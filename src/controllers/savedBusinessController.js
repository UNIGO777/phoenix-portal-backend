const SavedBusiness = require('../models/SavedBusiness');
const Business = require('../models/Business');
const { paginate, paginatedResponse } = require('../utils/pagination');

exports.saveBusiness = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);
    if (!business || business.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const existing = await SavedBusiness.findOne({ user: req.user.id, business: businessId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Business already saved' });
    }

    await SavedBusiness.create({ user: req.user.id, business: businessId });
    res.status(201).json({ success: true, message: 'Business saved' });
  } catch (error) {
    next(error);
  }
};

exports.unsaveBusiness = async (req, res, next) => {
  try {
    const result = await SavedBusiness.findOneAndDelete({
      user: req.user.id,
      business: req.params.businessId,
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Saved business not found' });
    }

    res.json({ success: true, message: 'Business removed from saved' });
  } catch (error) {
    next(error);
  }
};

exports.listSaved = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);

    const filter = { user: req.user.id };

    const [saved, total] = await Promise.all([
      SavedBusiness.find(filter)
        .populate({
          path: 'business',
          match: { status: 'active' },
          populate: [
            { path: 'industry', select: 'name' },
            { path: 'country', select: 'name code' },
          ],
        })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      SavedBusiness.countDocuments(filter),
    ]);

    // Filter out entries where business was deleted or no longer active
    const filtered = saved.filter((s) => s.business !== null);

    res.json({ success: true, ...paginatedResponse(filtered, total, { page, limit }) });
  } catch (error) {
    next(error);
  }
};
