const Country = require('../models/Country');

exports.listCountries = async (req, res, next) => {
  try {
    const countries = await Country.find().sort('name');
    res.json({ success: true, data: countries });
  } catch (error) {
    next(error);
  }
};

exports.createCountry = async (req, res, next) => {
  try {
    const existing = await Country.findOne({ name: { $regex: new RegExp(`^${req.body.name}$`, 'i') } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Country already exists' });
    }
    const country = await Country.create({ name: req.body.name, code: req.body.code });
    res.status(201).json({ success: true, message: 'Country created', data: country });
  } catch (error) {
    next(error);
  }
};

exports.updateCountry = async (req, res, next) => {
  try {
    const existing = await Country.findOne({
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
      _id: { $ne: req.params.id },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Country name already exists' });
    }

    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.code) updates.code = req.body.code;

    const country = await Country.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }
    res.json({ success: true, message: 'Country updated', data: country });
  } catch (error) {
    next(error);
  }
};

exports.deleteCountry = async (req, res, next) => {
  try {
    const country = await Country.findByIdAndDelete(req.params.id);
    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found' });
    }
    res.json({ success: true, message: 'Country deleted' });
  } catch (error) {
    next(error);
  }
};
