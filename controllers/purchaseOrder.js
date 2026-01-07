const PurchaseOrder = require('../models/purchaseOrder');
const Stock = require('../models/stock');
const Contabilidad = require('../models/contabilidad');

exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, customerId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (customerId) filter.customerId = customerId;

    const skip = (page - 1) * limit;
    const orders = await PurchaseOrder.find(filter)
      .populate('customerId', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ poDate: -1 });

    const total = await PurchaseOrder.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching purchase orders:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPurchaseOrderById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id).populate('customerId');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Purchase order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching purchase order:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    const { purchaseOrderNumber, customerId, supplierId, supplierName, items, paymentTerms, shippingTerms, notes } = req.body;

    if (!purchaseOrderNumber || !customerId || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const existingPO = await PurchaseOrder.findOne({ purchaseOrderNumber });
    if (existingPO) {
      return res.status(400).json({ success: false, error: 'Purchase order number already exists' });
    }

    const po = new PurchaseOrder({
      purchaseOrderNumber,
      customerId,
      supplierId,
      supplierName,
      items,
      paymentTerms,
      shippingTerms,
      notes,
      createdBy: req.user?.id || 'system'
    });

    await po.save();

    const contabilidad = new Contabilidad({
      transactionNumber: `PO-${Date.now()}`,
      customerId,
      transactionDate: new Date(),
      type: 'expense',
      category: 'purchase_order',
      description: `Purchase order ${purchaseOrderNumber}`,
      amount: po.total,
      relatedPurchaseOrderId: po._id,
      status: 'pending',
      recordedBy: req.user?.id || 'system',
      recordedDate: new Date()
    });

    await contabilidad.save();

    res.status(201).json({ success: true, message: 'Purchase order created successfully', data: po });
  } catch (error) {
    console.error('Error creating purchase order:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const po = await PurchaseOrder.findByIdAndUpdate(id, updates, { new: true });

    if (!po) {
      return res.status(404).json({ success: false, error: 'Purchase order not found' });
    }

    res.json({ success: true, message: 'Purchase order updated successfully', data: po });
  } catch (error) {
    console.error('Error updating purchase order:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.receivePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualDeliveryDate, receivedItems } = req.body;

    const po = await PurchaseOrder.findById(id);

    if (!po) {
      return res.status(404).json({ success: false, error: 'Purchase order not found' });
    }

    po.status = 'received';
    po.actualDeliveryDate = actualDeliveryDate || new Date();

    for (const item of receivedItems || po.items) {
      if (item.bookId) {
        let stock = await Stock.findOne({ customerId: po.customerId, bookId: item.bookId });

        if (!stock) {
          stock = new Stock({
            customerId: po.customerId,
            bookId: item.bookId,
            quantity: item.quantity,
            costPerUnit: item.unitPrice,
            movements: [
              {
                type: 'in',
                quantity: item.quantity,
                reason: `Received from PO ${po.purchaseOrderNumber}`,
                reference: po._id.toString(),
                createdBy: req.user?.id || 'system'
              }
            ]
          });
        } else {
          stock.quantity = (stock.quantity || 0) + item.quantity;
          stock.movements.push({
            type: 'in',
            quantity: item.quantity,
            reason: `Received from PO ${po.purchaseOrderNumber}`,
            reference: po._id.toString(),
            createdBy: req.user?.id || 'system'
          });
        }

        await stock.save();
      }
    }

    await po.save();

    res.json({ success: true, message: 'Purchase order received successfully', data: po });
  } catch (error) {
    console.error('Error receiving purchase order:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.cancelPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const po = await PurchaseOrder.findById(id);

    if (!po) {
      return res.status(404).json({ success: false, error: 'Purchase order not found' });
    }

    po.status = 'cancelled';
    po.notes = (po.notes || '') + `\nCancelled: ${reason || 'No reason provided'}`;

    await po.save();

    res.json({ success: true, message: 'Purchase order cancelled successfully', data: po });
  } catch (error) {
    console.error('Error cancelling purchase order:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
