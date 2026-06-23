const Inquiry = require('../models/Inquiry');
const Business = require('../models/Business');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { sendInquiryNotification } = require('../services/emailService');

exports.createInquiry = async (req, res, next) => {
  try {
    const { business: businessId, message } = req.body;

    const business = await Business.findById(businessId);
    if (!business || business.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const inquiry = await Inquiry.create({
      user: req.user.id,
      business: businessId,
      message,
    });

    // Send email notification to admin
    await sendInquiryNotification({
      userName: req.user.account.fullName,
      userEmail: req.user.account.email,
      businessName: business.name,
      message,
    });

    const populated = await Inquiry.findById(inquiry._id)
      .populate('user', 'fullName email')
      .populate('business', 'name city');

    res.status(201).json({ success: true, message: 'Inquiry submitted', data: populated });
  } catch (error) {
    next(error);
  }
};

exports.listInquiries = async (req, res, next) => {
  try {
    const { page, limit, skip, sort } = paginate(req.query);

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.business) filter.business = req.query.business;

    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter)
        .populate('user', 'fullName email mobile')
        .populate('business', 'name city country')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Inquiry.countDocuments(filter),
    ]);

    res.json({ success: true, ...paginatedResponse(inquiries, total, { page, limit }) });
  } catch (error) {
    next(error);
  }
};

exports.updateInquiryStatus = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    )
      .populate('user', 'fullName email')
      .populate('business', 'name city');

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.json({ success: true, message: `Status updated to ${req.body.status}`, data: inquiry });
  } catch (error) {
    next(error);
  }
};
