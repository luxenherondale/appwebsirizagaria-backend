const Invoice = require('../models/invoice');
const Customer = require('../models/customer');
const Contabilidad = require('../models/contabilidad');

exports.getAllInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, customerId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (customerId) filter.customerId = customerId;

    const skip = (page - 1) * limit;
    const invoices = await Invoice.find(filter)
      .populate('customerId', 'name email rut')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ invoiceDate: -1 });

    const total = await Invoice.countDocuments(filter);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('customerId');

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error fetching invoice:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const { invoiceNumber, customerId, orderId, items, taxRate = 19, notes } = req.body;

    if (!invoiceNumber || !customerId || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const existingInvoice = await Invoice.findOne({ invoiceNumber });
    if (existingInvoice) {
      return res.status(400).json({ success: false, error: 'Invoice number already exists' });
    }

    const invoice = new Invoice({
      invoiceNumber,
      customerId,
      orderId,
      items,
      taxRate,
      notes,
      issuedBy: req.user?.id || 'system'
    });

    await invoice.save();

    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.totalOrders = (customer.totalOrders || 0) + 1;
      customer.totalOwed = (customer.totalOwed || 0) + invoice.total;
      await customer.save();
    }

    res.status(201).json({ success: true, message: 'Invoice created successfully', data: invoice });
  } catch (error) {
    console.error('Error creating invoice:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const invoice = await Invoice.findByIdAndUpdate(id, updates, { new: true });

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    res.json({ success: true, message: 'Invoice updated successfully', data: invoice });
  } catch (error) {
    console.error('Error updating invoice:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.recordPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentDate, paymentMethod, reference } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid payment amount required' });
    }

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    invoice.amountPaid = (invoice.amountPaid || 0) + amount;
    invoice.amountOwed = invoice.total - invoice.amountPaid;

    invoice.payments.push({
      amount,
      paymentDate: paymentDate || new Date(),
      paymentMethod,
      reference
    });

    if (invoice.amountOwed <= 0) {
      invoice.paymentStatus = 'paid';
      invoice.status = 'paid';
    } else if (invoice.amountPaid > 0) {
      invoice.paymentStatus = 'partially_paid';
    }

    await invoice.save();

    const customer = await Customer.findById(invoice.customerId);
    if (customer) {
      customer.totalOwed = Math.max(0, (customer.totalOwed || 0) - amount);
      await customer.save();
    }

    const contabilidad = new Contabilidad({
      transactionNumber: `PAY-${Date.now()}`,
      customerId: invoice.customerId,
      transactionDate: paymentDate || new Date(),
      type: 'income',
      category: 'payment',
      description: `Payment for invoice ${invoice.invoiceNumber}`,
      amount,
      relatedInvoiceId: id,
      paymentMethod,
      reference,
      status: 'recorded',
      recordedBy: req.user?.id || 'system',
      recordedDate: new Date()
    });

    await contabilidad.save();

    res.json({ success: true, message: 'Payment recorded successfully', data: invoice });
  } catch (error) {
    console.error('Error recording payment:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getInvoiceStats = async (req, res) => {
  try {
    const invoices = await Invoice.find();

    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalOwed = invoices.reduce((sum, inv) => sum + inv.amountOwed, 0);

    const byStatus = {};
    invoices.forEach(inv => {
      byStatus[inv.status] = (byStatus[inv.status] || 0) + 1;
    });

    const byPaymentStatus = {};
    invoices.forEach(inv => {
      byPaymentStatus[inv.paymentStatus] = (byPaymentStatus[inv.paymentStatus] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalInvoices,
        totalAmount,
        totalPaid,
        totalOwed,
        byStatus,
        byPaymentStatus
      }
    });
  } catch (error) {
    console.error('Error fetching invoice stats:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
