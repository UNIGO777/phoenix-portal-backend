const Business = require('../models/Business');

exports.listFeatured = async (req, res, next) => {
  try {
    const businesses = await Business.find({ isFeatured: true, status: 'active' })
      .populate('industry', 'name')
      .populate('country', 'name code')
      .sort('featuredOrder');

    res.json({ success: true, data: businesses });
  } catch (error) {
    next(error);
  }
};

exports.updateOrder = async (req, res, next) => {
  try {
    const { order } = req.body;
    // order: [{ id: "...", position: 0 }, { id: "...", position: 1 }, ...]
    if (!Array.isArray(order) || !order.length) {
      return res.status(400).json({ success: false, message: 'Order array is required' });
    }

    const bulkOps = order.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { featuredOrder: item.position },
      },
    }));

    await Business.bulkWrite(bulkOps);

    const businesses = await Business.find({ isFeatured: true, status: 'active' })
      .populate('industry', 'name')
      .populate('country', 'name code')
      .sort('featuredOrder');

    res.json({ success: true, message: 'Featured order updated', data: businesses });
  } catch (error) {
    next(error);
  }
};
