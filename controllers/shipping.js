const Shipping = require('../models/shipping');
const Stock = require('../models/stock');

exports.getAllShipments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, customerId, orderId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (customerId) filter.customerId = customerId;
    if (orderId) filter.orderId = orderId;

    const skip = (page - 1) * limit;
    const shipments = await Shipping.find(filter)
      .populate('customerId', 'name email')
      .populate('orderId', 'orderNumber')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ shippingDate: -1 });

    const total = await Shipping.countDocuments(filter);

    res.json({
      success: true,
      data: shipments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching shipments:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getShipmentById = async (req, res) => {
  try {
    const shipment = await Shipping.findById(req.params.id)
      .populate('customerId')
      .populate('orderId')
      .populate('invoiceId');

    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }

    res.json({ success: true, data: shipment });
  } catch (error) {
    console.error('Error fetching shipment:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createShipment = async (req, res) => {
  try {
    const { orderId, customerId, invoiceId, items, shippingMethod, shippingAddress, shippingCost } = req.body;

    if (!orderId || !customerId || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const shipment = new Shipping({
      orderId,
      customerId,
      invoiceId,
      items,
      shippingMethod,
      shippingAddress,
      shippingCost,
      status: 'pending'
    });

    await shipment.save();

    for (const item of items) {
      if (item.bookId) {
        const stock = await Stock.findOne({ customerId, bookId: item.bookId });
        if (stock) {
          stock.reservedQuantity = Math.max(0, stock.reservedQuantity - item.quantity);
          stock.quantity = Math.max(0, stock.quantity - item.quantity);
          stock.movements.push({
            type: 'out',
            quantity: item.quantity,
            reason: `Shipped in order ${orderId}`,
            reference: shipment._id.toString(),
            createdBy: req.user?.id || 'system'
          });
          await stock.save();
        }
      }
    }

    res.status(201).json({ success: true, message: 'Shipment created successfully', data: shipment });
  } catch (error) {
    console.error('Error creating shipment:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, trackingUrl, actualDeliveryDate } = req.body;

    const shipment = await Shipping.findById(id);

    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }

    if (status) shipment.status = status;
    if (trackingNumber) shipment.trackingNumber = trackingNumber;
    if (trackingUrl) shipment.trackingUrl = trackingUrl;
    if (actualDeliveryDate) shipment.actualDeliveryDate = actualDeliveryDate;

    if (status === 'delivered') {
      shipment.actualDeliveryDate = actualDeliveryDate || new Date();
    }

    await shipment.save();

    res.json({ success: true, message: 'Shipment updated successfully', data: shipment });
  } catch (error) {
    console.error('Error updating shipment:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.generateGuiaElectronica = async (req, res) => {
  try {
    const { id } = req.params;

    const shipment = await Shipping.findById(id);

    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }

    shipment.guiaElectronica = 'generated';
    shipment.guiaElectronicaNumber = `GDE-${Date.now()}`;
    shipment.guiaElectronicaUrl = `https://api.sirizagaria.com/guia/${shipment.guiaElectronicaNumber}`;

    await shipment.save();

    res.json({ success: true, message: 'Guía electrónica generated successfully', data: shipment });
  } catch (error) {
    console.error('Error generating guía electrónica:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOrderShipments = async (req, res) => {
  try {
    const { orderId } = req.params;
    const shipments = await Shipping.find({ orderId })
      .populate('customerId', 'name email')
      .sort({ shippingDate: -1 });

    res.json({ success: true, data: shipments });
  } catch (error) {
    console.error('Error fetching order shipments:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
