const Contabilidad = require('../models/contabilidad');
const Invoice = require('../models/invoice');

exports.getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, category, status, customerId, startDate, endDate } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (customerId) filter.customerId = customerId;

    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const transactions = await Contabilidad.find(filter)
      .populate('customerId', 'name email rut')
      .populate('relatedInvoiceId', 'invoiceNumber')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ transactionDate: -1 });

    const total = await Contabilidad.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Contabilidad.findById(req.params.id)
      .populate('customerId')
      .populate('relatedInvoiceId')
      .populate('relatedPaymentId')
      .populate('relatedPurchaseOrderId');

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { transactionNumber, customerId, type, category, description, amount, paymentMethod, reference, invoiceAttachment, notes } = req.body;

    if (!transactionNumber || !customerId || !type || !category || !description || !amount) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const existingTransaction = await Contabilidad.findOne({ transactionNumber });
    if (existingTransaction) {
      return res.status(400).json({ success: false, error: 'Transaction number already exists' });
    }

    const transaction = new Contabilidad({
      transactionNumber,
      customerId,
      type,
      category,
      description,
      amount,
      paymentMethod,
      reference,
      invoiceAttachment,
      notes,
      status: 'pending',
      recordedBy: req.user?.id || 'system',
      recordedDate: new Date()
    });

    await transaction.save();

    res.status(201).json({ success: true, message: 'Transaction created successfully', data: transaction });
  } catch (error) {
    console.error('Error creating transaction:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const transaction = await Contabilidad.findByIdAndUpdate(id, updates, { new: true });

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    res.json({ success: true, message: 'Transaction updated successfully', data: transaction });
  } catch (error) {
    console.error('Error updating transaction:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.verifyTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const transaction = await Contabilidad.findById(id);

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    transaction.status = 'verified';
    transaction.verifiedBy = req.user?.id || 'system';
    transaction.verifiedDate = new Date();
    if (notes) transaction.notes = (transaction.notes || '') + `\nVerified: ${notes}`;

    await transaction.save();

    res.json({ success: true, message: 'Transaction verified successfully', data: transaction });
  } catch (error) {
    console.error('Error verifying transaction:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.reconcileTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reconciliationStatus, notes } = req.body;

    const transaction = await Contabilidad.findById(id);

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    transaction.reconciliationStatus = reconciliationStatus || 'reconciled';
    transaction.reconciliationDate = new Date();
    transaction.reconciliationNotes = notes;

    await transaction.save();

    res.json({ success: true, message: 'Transaction reconciled successfully', data: transaction });
  } catch (error) {
    console.error('Error reconciling transaction:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFinancialSummary = async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;
    const filter = {};

    if (customerId) filter.customerId = customerId;

    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) filter.transactionDate.$gte = new Date(startDate);
      if (endDate) filter.transactionDate.$lte = new Date(endDate);
    }

    const transactions = await Contabilidad.find(filter);

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory = {};
    transactions.forEach(t => {
      if (!byCategory[t.category]) {
        byCategory[t.category] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        byCategory[t.category].income += t.amount;
      } else {
        byCategory[t.category].expense += t.amount;
      }
    });

    const byStatus = {};
    transactions.forEach(t => {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalTransactions: transactions.length,
        totalIncome: income,
        totalExpenses: expenses,
        netIncome: income - expenses,
        byCategory,
        byStatus,
        period: {
          startDate: startDate || 'all',
          endDate: endDate || 'all'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching financial summary:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCustomerFinancialSummary = async (req, res) => {
  try {
    const { customerId } = req.params;

    const transactions = await Contabilidad.find({ customerId });
    const invoices = await Invoice.find({ customerId });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalOwed = invoices.reduce((sum, inv) => sum + inv.amountOwed, 0);

    res.json({
      success: true,
      data: {
        customerId,
        totalIncome: income,
        totalExpenses: expenses,
        netIncome: income - expenses,
        totalInvoiced,
        totalPaid,
        totalOwed,
        invoiceCount: invoices.length,
        transactionCount: transactions.length
      }
    });
  } catch (error) {
    console.error('Error fetching customer financial summary:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
