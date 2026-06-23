const Business = require('../models/Business');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { deleteBusinessImages, removeImageAtIndex } = require('../services/businessService');
const { searchBusinesses, getSuggestions } = require('../services/searchService');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

exports.listBusinesses = async (req, res, next) => {
  try {
    // For admin, allow all statuses; for users, only active
    if (req.user.role !== 'admin') {
      req.query.status = 'active';
    }
    const result = await searchBusinesses(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate('industry', 'name')
      .populate('country', 'name code');

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // Users can only view active businesses
    if (req.user.role !== 'admin' && business.status !== 'active') {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    res.json({ success: true, data: business });
  } catch (error) {
    next(error);
  }
};

exports.createBusiness = async (req, res, next) => {
  try {
    const business = await Business.create(req.body);
    const populated = await Business.findById(business._id)
      .populate('industry', 'name')
      .populate('country', 'name code');

    res.status(201).json({ success: true, message: 'Business created', data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateBusiness = async (req, res, next) => {
  try {
    const business = await Business.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('industry', 'name')
      .populate('country', 'name code');

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    res.json({ success: true, message: 'Business updated', data: business });
  } catch (error) {
    next(error);
  }
};

exports.deleteBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    deleteBusinessImages(business.images);
    await Business.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Business deleted' });
  } catch (error) {
    next(error);
  }
};

exports.changeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'sold', 'draft'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    res.json({ success: true, message: `Status changed to ${status}`, data: business });
  } catch (error) {
    next(error);
  }
};

exports.toggleFeatured = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    business.isFeatured = !business.isFeatured;
    if (!business.isFeatured) {
      business.featuredOrder = 0;
    }
    await business.save();

    res.json({
      success: true,
      message: business.isFeatured ? 'Marked as featured' : 'Removed from featured',
      data: business,
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadImages = async (req, res, next) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ success: false, message: 'No images uploaded' });
    }

    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    // Upload each file to Cloudinary
    const uploadPromises = req.files.map((f) => uploadToCloudinary(f.buffer, 'businesses'));
    const results = await Promise.all(uploadPromises);
    const newUrls = results.map((r) => r.secure_url);

    business.images.push(...newUrls);
    await business.save();

    res.json({ success: true, message: `${req.files.length} image(s) uploaded`, data: business });
  } catch (error) {
    next(error);
  }
};

exports.removeImage = async (req, res, next) => {
  try {
    const imageIndex = parseInt(req.params.imageIndex, 10);
    const result = await removeImageAtIndex(req.params.id, imageIndex);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.json({ success: true, message: 'Image removed', data: result });
  } catch (error) {
    next(error);
  }
};

exports.searchSuggestions = async (req, res, next) => {
  try {
    const suggestions = await getSuggestions(req.query.q);
    res.json({ success: true, data: suggestions });
  } catch (error) {
    next(error);
  }
};
