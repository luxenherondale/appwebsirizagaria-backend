const Customer = require('../models/customer');
const Invoice = require('../models/invoice');

exports.getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;
    const filter = {};

    if (isActive !== undefined) filter.isActive = isActive === 'true';

    if (search) {
      filter.$or = [
        { rut: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const customers = await Customer.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments(filter);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error fetching customer:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const { rut, email, name, phone, address, commune, region, businessName, businessType } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const existingCustomer = await Customer.findOne({
      $or: [
        rut ? { rut } : null,
        email ? { email } : null
      ].filter(Boolean)
    });

    if (existingCustomer) {
      return res.status(400).json({ success: false, error: 'Customer with this RUT or email already exists' });
    }

    const customer = new Customer({
      rut,
      email,
      name,
      phone,
      address,
      commune,
      region,
      businessName,
      businessType
    });

    await customer.save();

    res.status(201).json({ success: true, message: 'Customer created successfully', data: customer });
  } catch (error) {
    console.error('Error creating customer:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const customer = await Customer.findByIdAndUpdate(id, updates, { new: true });

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({ success: true, message: 'Customer updated successfully', data: customer });
  } catch (error) {
    console.error('Error updating customer:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({ success: true, message: 'Customer deactivated successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCustomerByRut = async (req, res) => {
  try {
    const { rut } = req.params;
    const customer = await Customer.findOne({ rut });

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error fetching customer by RUT:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCustomerOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const Order = require('../models/order');
    const orders = await Order.find({ customerId: id })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments({ customerId: id });

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
    console.error('Error fetching customer orders:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCustomerInvoices = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    const skip = (page - 1) * limit;
    const filter = { customerId: id };

    if (status) filter.status = status;

    const invoices = await Invoice.find(filter)
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
    console.error('Error fetching customer invoices:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCustomerStats = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const invoices = await Invoice.find({ customerId: id });
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalOwed = invoices.reduce((sum, inv) => sum + inv.amountOwed, 0);

    res.json({
      success: true,
      data: {
        customerId: id,
        name: customer.name,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        totalOwed: customer.totalOwed,
        totalInvoices,
        totalAmount,
        totalPaid,
        amountOwed: totalOwed,
        lastOrderDate: customer.lastOrderDate
      }
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
