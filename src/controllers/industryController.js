const Industry = require('../models/Industry');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

const extractPublicId = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const folderAndFile = parts.slice(parts.indexOf('phoenix')).join('/');
  return folderAndFile.replace(/\.[^/.]+$/, '');
};

exports.listIndustries = async (req, res, next) => {
  try {
    const industries = await Industry.find().sort('name');
    res.json({ success: true, data: industries });
  } catch (error) {
    next(error);
  }
};

exports.createIndustry = async (req, res, next) => {
  try {
    const existing = await Industry.findOne({ name: { $regex: new RegExp(`^${req.body.name}$`, 'i') } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Industry already exists' });
    }

    let imageUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'industries');
      imageUrl = result.secure_url;
    }

    const industry = await Industry.create({ name: req.body.name, image: imageUrl });
    res.status(201).json({ success: true, message: 'Industry created', data: industry });
  } catch (error) {
    next(error);
  }
};

exports.updateIndustry = async (req, res, next) => {
  try {
    const existing = await Industry.findOne({
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
      _id: { $ne: req.params.id },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Industry name already exists' });
    }

    const industry = await Industry.findById(req.params.id);
    if (!industry) {
      return res.status(404).json({ success: false, message: 'Industry not found' });
    }

    industry.name = req.body.name;

    if (req.file) {
      // Delete old image from Cloudinary
      if (industry.image) {
        const publicId = extractPublicId(industry.image);
        if (publicId) await deleteFromCloudinary(publicId);
      }
      const result = await uploadToCloudinary(req.file.buffer, 'industries');
      industry.image = result.secure_url;
    }

    await industry.save();
    res.json({ success: true, message: 'Industry updated', data: industry });
  } catch (error) {
    next(error);
  }
};

exports.deleteIndustry = async (req, res, next) => {
  try {
    const industry = await Industry.findById(req.params.id);
    if (!industry) {
      return res.status(404).json({ success: false, message: 'Industry not found' });
    }

    // Delete image from Cloudinary
    if (industry.image) {
      const publicId = extractPublicId(industry.image);
      if (publicId) await deleteFromCloudinary(publicId);
    }

    await Industry.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Industry deleted' });
  } catch (error) {
    next(error);
  }
};
