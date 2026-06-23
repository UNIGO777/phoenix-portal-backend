const Business = require('../models/Business');
const { paginate, paginatedResponse } = require('../utils/pagination');

const searchBusinesses = async (query) => {
  const { page, limit, skip, sort } = paginate(query);

  const filter = { status: 'active' };

  // Text search
  if (query.search) {
    filter.$text = { $search: query.search };
  }

  // Filters
  if (query.industry) {
    filter.industry = query.industry;
  }
  if (query.country) {
    filter.country = query.country;
  }
  if (query.city) {
    filter.city = new RegExp(query.city, 'i');
  }
  if (query.featured === 'true') {
    filter.isFeatured = true;
  }

  // Price range
  if (query.minPrice || query.maxPrice) {
    filter.askingPrice = {};
    if (query.minPrice) filter.askingPrice.$gte = parseFloat(query.minPrice);
    if (query.maxPrice) filter.askingPrice.$lte = parseFloat(query.maxPrice);
  }

  // Status override for admin
  if (query.status) {
    filter.status = query.status;
  }

  const [businesses, total] = await Promise.all([
    Business.find(filter)
      .populate('industry', 'name')
      .populate('country', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Business.countDocuments(filter),
  ]);

  return { success: true, ...paginatedResponse(businesses, total, { page, limit }) };
};

const getSuggestions = async (query) => {
  if (!query || query.length < 2) return [];

  const businesses = await Business.find({
    name: new RegExp(query, 'i'),
    status: 'active',
  })
    .select('name city')
    .limit(10)
    .sort('name');

  return businesses.map((b) => ({ id: b._id, name: b.name, city: b.city }));
};

module.exports = { searchBusinesses, getSuggestions };
