const Stock = require('../models/stock');

exports.getAllStock = async (req, res) => {
  try {
    const { page = 1, limit = 20, customerId, bookId } = req.query;
    const filter = {};

    if (customerId) filter.customerId = customerId;
    if (bookId) filter.bookId = bookId;

    const skip = (page - 1) * limit;
    const stock = await Stock.find(filter)
      .populate('customerId', 'name email')
      .populate('bookId', 'title isbn')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Stock.countDocuments(filter);

    res.json({
      success: true,
      data: stock,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching stock:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStockById = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id)
      .populate('customerId')
      .populate('bookId');

    if (!stock) {
      return res.status(404).json({ success: false, error: 'Stock record not found' });
    }

    res.json({ success: true, data: stock });
  } catch (error) {
    console.error('Error fetching stock:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createStock = async (req, res) => {
  try {
    const { customerId, bookId, quantity, location, costPerUnit } = req.body;

    if (!customerId || !bookId || !quantity) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const existingStock = await Stock.findOne({ customerId, bookId });
    if (existingStock) {
      return res.status(400).json({ success: false, error: 'Stock record already exists for this customer and book' });
    }

    const stock = new Stock({
      customerId,
      bookId,
      quantity,
      location,
      costPerUnit,
      movements: [
        {
          type: 'in',
          quantity,
          reason: 'Initial stock',
          createdBy: req.user?.id || 'system'
        }
      ]
    });

    await stock.save();

    res.status(201).json({ success: true, message: 'Stock created successfully', data: stock });
  } catch (error) {
    console.error('Error creating stock:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, location, condition } = req.body;

    const stock = await Stock.findById(id);

    if (!stock) {
      return res.status(404).json({ success: false, error: 'Stock record not found' });
    }

    if (quantity !== undefined) {
      const difference = quantity - stock.quantity;
      stock.quantity = quantity;

      stock.movements.push({
        type: difference > 0 ? 'in' : 'out',
        quantity: Math.abs(difference),
        reason: 'Stock adjustment',
        createdBy: req.user?.id || 'system'
      });
    }

    if (location) stock.location = location;
    if (condition) stock.condition = condition;

    await stock.save();

    res.json({ success: true, message: 'Stock updated successfully', data: stock });
  } catch (error) {
    console.error('Error updating stock:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.reserveStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reason } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Valid quantity required' });
    }

    const stock = await Stock.findById(id);

    if (!stock) {
      return res.status(404).json({ success: false, error: 'Stock record not found' });
    }

    if (stock.availableQuantity < quantity) {
      return res.status(400).json({ success: false, error: 'Insufficient stock available' });
    }

    stock.reservedQuantity = (stock.reservedQuantity || 0) + quantity;

    stock.movements.push({
      type: 'adjustment',
      quantity,
      reason: reason || 'Stock reserved',
      createdBy: req.user?.id || 'system'
    });

    await stock.save();

    res.json({ success: true, message: 'Stock reserved successfully', data: stock });
  } catch (error) {
    console.error('Error reserving stock:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.releaseStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reason } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ success: false, error: 'Valid quantity required' });
    }

    const stock = await Stock.findById(id);

    if (!stock) {
      return res.status(404).json({ success: false, error: 'Stock record not found' });
    }

    if (stock.reservedQuantity < quantity) {
      return res.status(400).json({ success: false, error: 'Cannot release more than reserved' });
    }

    stock.reservedQuantity = Math.max(0, stock.reservedQuantity - quantity);

    stock.movements.push({
      type: 'adjustment',
      quantity,
      reason: reason || 'Stock released',
      createdBy: req.user?.id || 'system'
    });

    await stock.save();

    res.json({ success: true, message: 'Stock released successfully', data: stock });
  } catch (error) {
    console.error('Error releasing stock:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCustomerStock = async (req, res) => {
  try {
    const { customerId } = req.params;
    const stock = await Stock.find({ customerId })
      .populate('bookId', 'title isbn')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: stock });
  } catch (error) {
    console.error('Error fetching customer stock:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
