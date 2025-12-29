const axios = require('axios');
const Order = require('../models/order');

// Transbank Production Configuration
const TBK_COMMERCE_CODE = process.env.TBK_COMMERCE_CODE || '597052958374';
const TBK_API_KEY = process.env.TBK_API_KEY || 'c5d59ef5-514c-4792-8f30-b2b0089bf0ea';
const TBK_BASE_URL = process.env.TBK_BASE_URL || 'https://webpay3g.transbank.cl';
const TBK_ENDPOINT = '/rswebpaytransaction/api/webpay/v1.2';

// Helper function to make Transbank API requests
async function transbankRequest(method, endpoint, data = null) {
  const config = {
    method,
    url: `${TBK_BASE_URL}${TBK_ENDPOINT}${endpoint}`,
    headers: {
      'Tbk-Api-Key-Id': TBK_COMMERCE_CODE,
      'Tbk-Api-Key-Secret': TBK_API_KEY,
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    config.data = data;
  }

  return axios(config);
}

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { 
      nombre, email, telefono, region, comuna, direccion, notas,
      cantidad, payment_method, subtotal, shipping_cost, total, return_url
    } = req.body;

    // Validate required fields
    if (!nombre || !email || !telefono || !region || !comuna || !direccion) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos obligatorios del cliente'
      });
    }

    if (!total || total < 100) {
      return res.status(400).json({
        success: false,
        error: 'El monto debe ser al menos $100 CLP'
      });
    }

    // Generate order identifiers
    const buy_order = Order.generateBuyOrder();
    const session_id = Order.generateSessionId();

    // Create order in database
    const order = new Order({
      buy_order,
      session_id,
      customer: {
        nombre,
        email,
        telefono,
        region,
        comuna,
        direccion,
        notas
      },
      items: [{
        product: 'La Nueva Violencia Moderna',
        quantity: parseInt(cantidad) || 1,
        unit_price: 19000
      }],
      subtotal: parseInt(subtotal),
      shipping_cost: parseInt(shipping_cost) || 0,
      total: parseInt(total),
      payment_method: payment_method || 'webpay',
      status: 'initiated'
    });

    await order.save();

    // If payment method is transferencia, just return order info
    if (payment_method === 'transferencia') {
      order.status = 'pending_payment';
      await order.save();
      
      return res.json({
        success: true,
        payment_method: 'transferencia',
        order_id: buy_order,
        message: 'Orden creada. Por favor realiza la transferencia.'
      });
    }

    // Create Transbank transaction
    const tbkPayload = {
      buy_order,
      session_id,
      amount: parseInt(total),
      return_url: return_url || `${req.protocol}://${req.get('host')}/api/payment/return`
    };

    console.log('Creating Transbank transaction:', tbkPayload);

    const tbkResponse = await transbankRequest('post', '/transactions', tbkPayload);

    // Update order with Transbank data
    order.transbank_token = tbkResponse.data.token;
    order.transbank_url = tbkResponse.data.url;
    order.status = 'pending_payment';
    await order.save();

    // Return redirect URL
    const redirectUrl = `${tbkResponse.data.url}?token_ws=${tbkResponse.data.token}`;

    res.json({
      success: true,
      redirect_url: redirectUrl,
      token: tbkResponse.data.token,
      order_id: buy_order
    });

  } catch (error) {
    console.error('Error creating transaction:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Error al crear la transacción',
      details: error.response?.data || error.message
    });
  }
};

// Confirm transaction (called by Transbank redirect)
exports.confirmTransaction = async (req, res) => {
  try {
    // Transbank sends token_ws via POST or GET
    const token_ws = req.body.token_ws || req.query.token_ws;
    const TBK_TOKEN = req.body.TBK_TOKEN || req.query.TBK_TOKEN;
    const TBK_ORDEN_COMPRA = req.body.TBK_ORDEN_COMPRA || req.query.TBK_ORDEN_COMPRA;
    const TBK_ID_SESION = req.body.TBK_ID_SESION || req.query.TBK_ID_SESION;

    // Check if user cancelled payment
    if (TBK_TOKEN && !token_ws) {
      // User cancelled at Webpay
      const order = await Order.findOne({ buy_order: TBK_ORDEN_COMPRA });
      if (order) {
        order.status = 'cancelled';
        order.cancelled_at = new Date();
        await order.save();
      }
      
      // Redirect to frontend with cancelled status
      const frontendUrl = process.env.FRONTEND_URL || 'https://sirizagaria.com';
      return res.redirect(`${frontendUrl}/pago-resultado?status=cancelled&order=${TBK_ORDEN_COMPRA}`);
    }

    if (!token_ws) {
      return res.status(400).json({
        success: false,
        error: 'Token no proporcionado'
      });
    }

    // Find order by token
    const order = await Order.findOne({ transbank_token: token_ws });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada'
      });
    }

    // Confirm transaction with Transbank
    console.log('Confirming transaction with token:', token_ws);
    const tbkResponse = await transbankRequest('put', `/transactions/${token_ws}`, {});

    const paymentData = tbkResponse.data;
    console.log('Transbank confirmation response:', paymentData);

    // Update order with transaction data
    order.transaction_data = {
      vci: paymentData.vci,
      authorization_code: paymentData.authorization_code,
      payment_type_code: paymentData.payment_type_code,
      response_code: paymentData.response_code,
      installments_number: paymentData.installments_number,
      card_last4: paymentData.card_detail?.card_number,
      accounting_date: paymentData.accounting_date,
      transaction_date: paymentData.transaction_date
    };

    // Check if payment was successful
    if (paymentData.response_code === 0 && paymentData.status === 'AUTHORIZED') {
      order.status = 'confirmed';
      order.confirmed_at = new Date();
      await order.save();

      // Redirect to success page
      const frontendUrl = process.env.FRONTEND_URL || 'https://sirizagaria.com';
      return res.redirect(`${frontendUrl}/pago-resultado?status=success&order=${order.buy_order}&auth=${paymentData.authorization_code}`);
    } else {
      order.status = 'failed';
      await order.save();

      // Redirect to failure page
      const frontendUrl = process.env.FRONTEND_URL || 'https://sirizagaria.com';
      return res.redirect(`${frontendUrl}/pago-resultado?status=failed&order=${order.buy_order}&code=${paymentData.response_code}`);
    }

  } catch (error) {
    console.error('Error confirming transaction:', error.response?.data || error.message);
    
    const frontendUrl = process.env.FRONTEND_URL || 'https://sirizagaria.com';
    return res.redirect(`${frontendUrl}/pago-resultado?status=error&message=${encodeURIComponent(error.message)}`);
  }
};

// Get transaction status
exports.getTransactionStatus = async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await Order.findOne({ buy_order: order_id });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada'
      });
    }

    // If there's a token, query Transbank for latest status
    if (order.transbank_token && order.status === 'pending_payment') {
      try {
        const tbkResponse = await transbankRequest('get', `/transactions/${order.transbank_token}`);
        
        return res.json({
          success: true,
          order: {
            order_id: order.buy_order,
            status: order.status,
            total: order.total,
            created_at: order.created_at
          },
          transbank_status: tbkResponse.data
        });
      } catch (tbkError) {
        // Token might be expired, just return order status
      }
    }

    res.json({
      success: true,
      order: {
        order_id: order.buy_order,
        status: order.status,
        total: order.total,
        customer_email: order.customer.email,
        created_at: order.created_at,
        confirmed_at: order.confirmed_at,
        transaction_data: order.status === 'confirmed' ? {
          authorization_code: order.transaction_data?.authorization_code,
          card_last4: order.transaction_data?.card_last4
        } : null
      }
    });

  } catch (error) {
    console.error('Error getting transaction status:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estado de la transacción'
    });
  }
};

// Refund transaction
exports.refundTransaction = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { amount } = req.body;

    const order = await Order.findOne({ buy_order: order_id });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada'
      });
    }

    if (order.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden reembolsar órdenes confirmadas'
      });
    }

    if (!order.transbank_token) {
      return res.status(400).json({
        success: false,
        error: 'No hay token de Transbank para esta orden'
      });
    }

    const refundAmount = amount || order.total;

    const tbkResponse = await transbankRequest('post', `/transactions/${order.transbank_token}/refunds`, {
      amount: parseInt(refundAmount)
    });

    order.status = 'refunded';
    await order.save();

    res.json({
      success: true,
      message: 'Reembolso procesado exitosamente',
      data: tbkResponse.data
    });

  } catch (error) {
    console.error('Error processing refund:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Error al procesar el reembolso',
      details: error.response?.data || error.message
    });
  }
};

// Retry a failed/cancelled payment
exports.retryPayment = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { return_url } = req.body;

    const order = await Order.findOne({ buy_order: order_id });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada'
      });
    }

    // Only allow retry for failed or cancelled orders
    if (!['failed', 'cancelled', 'initiated'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: `No se puede reintentar una orden con estado: ${order.status}`
      });
    }

    // Generate new session_id for retry
    const new_session_id = Order.generateSessionId();

    // Create new Transbank transaction
    const tbkPayload = {
      buy_order: order.buy_order,
      session_id: new_session_id,
      amount: order.total,
      return_url: return_url || `${req.protocol}://${req.get('host')}/api/payment/return`
    };

    console.log('Retrying Transbank transaction:', tbkPayload);

    const tbkResponse = await transbankRequest('post', '/transactions', tbkPayload);

    // Update order with new Transbank data
    order.session_id = new_session_id;
    order.transbank_token = tbkResponse.data.token;
    order.transbank_url = tbkResponse.data.url;
    order.status = 'pending_payment';
    order.updated_at = new Date();
    await order.save();

    // Return new redirect URL
    const redirectUrl = `${tbkResponse.data.url}?token_ws=${tbkResponse.data.token}`;

    res.json({
      success: true,
      redirect_url: redirectUrl,
      token: tbkResponse.data.token,
      order_id: order.buy_order
    });

  } catch (error) {
    console.error('Error retrying payment:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Error al reintentar el pago',
      details: error.response?.data || error.message
    });
  }
};

// Get all orders (admin)
exports.getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error getting orders:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al obtener órdenes'
    });
  }
};

// Confirm bank transfer payment (admin)
exports.confirmTransferPayment = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { confirmation_notes } = req.body;

    const order = await Order.findOne({ buy_order: order_id });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada'
      });
    }

    if (order.payment_method !== 'transferencia') {
      return res.status(400).json({
        success: false,
        error: 'Esta orden no es de transferencia bancaria'
      });
    }

    if (order.status === 'confirmed') {
      return res.status(400).json({
        success: false,
        error: 'Esta orden ya está confirmada'
      });
    }

    order.status = 'confirmed';
    order.confirmed_at = new Date();
    order.transaction_data = {
      ...order.transaction_data,
      confirmation_notes: confirmation_notes || 'Transferencia confirmada manualmente',
      confirmed_by: 'admin'
    };
    await order.save();

    // Deduct stock
    const Book = require('../models/book');
    for (const item of order.items) {
      await Book.findOneAndUpdate(
        { title: item.product },
        { $inc: { stock: -item.quantity, sold: item.quantity } }
      );
    }

    res.json({
      success: true,
      message: 'Pago por transferencia confirmado',
      order: {
        order_id: order.buy_order,
        status: order.status,
        confirmed_at: order.confirmed_at
      }
    });

  } catch (error) {
    console.error('Error confirming transfer:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al confirmar transferencia'
    });
  }
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['initiated', 'pending_payment', 'confirmed', 'cancelled', 'refunded', 'failed', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Estado inválido. Estados válidos: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findOne({ buy_order: order_id });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Orden no encontrada'
      });
    }

    const previousStatus = order.status;
    order.status = status;
    
    if (status === 'confirmed' && previousStatus !== 'confirmed') {
      order.confirmed_at = new Date();
      
      // Deduct stock on confirmation
      const Book = require('../models/book');
      for (const item of order.items) {
        await Book.findOneAndUpdate(
          { title: item.product },
          { $inc: { stock: -item.quantity, sold: item.quantity } }
        );
      }
    }
    
    if (status === 'cancelled') {
      order.cancelled_at = new Date();
    }

    if (notes) {
      order.transaction_data = {
        ...order.transaction_data,
        admin_notes: notes
      };
    }

    await order.save();

    res.json({
      success: true,
      message: `Estado actualizado a: ${status}`,
      order: {
        order_id: order.buy_order,
        status: order.status,
        previous_status: previousStatus
      }
    });

  } catch (error) {
    console.error('Error updating order status:', error.message);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar estado'
    });
  }
};
