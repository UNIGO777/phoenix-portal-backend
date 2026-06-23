const User = require('../models/User');
const Inquiry = require('../models/Inquiry');
const { createUser, resetUserPassword } = require('../services/userService');
const { paginate, paginatedResponse } = require('../utils/pagination');

exports.listUsers = async (req, res, next) => {
  try {
    const { page, limit, skip, sort } = paginate(req.query);

    const filter = {};
    if (req.query.search) {
      const search = new RegExp(req.query.search, 'i');
      filter.$or = [{ fullName: search }, { email: search }];
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const [users, total] = await Promise.all([
      User.find(filter).populate('country', 'name code').sort(sort).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    // Attach inquiry counts per user
    const userIds = users.map((u) => u._id);
    const inquiryCounts = await Inquiry.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    inquiryCounts.forEach((ic) => { countMap[ic._id.toString()] = ic.count; });

    const usersWithCounts = users.map((u) => {
      const obj = u.toJSON();
      obj.inquiryCount = countMap[u._id.toString()] || 0;
      return obj;
    });

    res.json({ success: true, ...paginatedResponse(usersWithCounts, total, { page, limit }) });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('country', 'name code');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const user = await createUser(req.body);
    res.status(201).json({ success: true, message: 'User created successfully', data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    // Don't allow password update via this route
    delete req.body.password;

    if (req.body.email) {
      const existing = await User.findOne({ email: req.body.email, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already exists' });
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('country', 'name code');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.activateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User activated', data: user });
  } catch (error) {
    next(error);
  }
};

exports.deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deactivated', data: user });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const user = await resetUserPassword(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'Password reset and emailed to user' });
  } catch (error) {
    next(error);
  }
};
