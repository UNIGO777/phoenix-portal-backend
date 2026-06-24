const Business = require('../models/Business');
const Industry = require('../models/Industry');
const Country = require('../models/Country');
const logger = require('../utils/logger');

const resolveReferences = async () => {
  const industries = await Industry.find();
  const countries = await Country.find();

  const industryMap = {};
  industries.forEach((i) => {
    industryMap[i.name.toLowerCase()] = i._id;
  });

  const countryMap = {};
  countries.forEach((c) => {
    countryMap[c.name.toLowerCase()] = c._id;
  });

  return { industryMap, countryMap };
};

const importBusinesses = async (rows) => {
  const { industryMap, countryMap } = await resolveReferences();

  const results = { created: 0, duplicates: 0, errors: [], total: rows.length };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 for header row + 0-index

    // Validate required fields
    if (!row.name) {
      results.errors.push({ row: rowNum, message: 'Business name is required' });
      continue;
    }

    // Resolve industry — auto-create if missing
    let industryId = row.industryName ? industryMap[row.industryName.toLowerCase()] : null;
    if (!industryId && row.industryName) {
      try {
        const newIndustry = await Industry.create({ name: row.industryName.trim() });
        industryId = newIndustry._id;
        industryMap[newIndustry.name.toLowerCase()] = industryId;
      } catch (err) {
        results.errors.push({ row: rowNum, message: `Failed to create industry "${row.industryName}": ${err.message}` });
        continue;
      }
    }
    if (!industryId) {
      results.errors.push({ row: rowNum, message: 'Industry name is required' });
      continue;
    }

    // Resolve country — auto-create if missing
    let countryId = row.countryName ? countryMap[row.countryName.toLowerCase()] : null;
    if (!countryId && row.countryName) {
      try {
        const newCountry = await Country.create({ name: row.countryName.trim() });
        countryId = newCountry._id;
        countryMap[newCountry.name.toLowerCase()] = countryId;
      } catch (err) {
        results.errors.push({ row: rowNum, message: `Failed to create country "${row.countryName}": ${err.message}` });
        continue;
      }
    }
    if (!countryId) {
      results.errors.push({ row: rowNum, message: 'Country name is required' });
      continue;
    }

    // Duplicate detection (same name + country)
    const existing = await Business.findOne({
      name: { $regex: new RegExp(`^${row.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      country: countryId,
    });

    if (existing) {
      results.duplicates++;
      results.errors.push({ row: rowNum, message: `Duplicate: "${row.name}" already exists in this country` });
      continue;
    }

    try {
      await Business.create({
        name: row.name,
        description: row.description,
        industry: industryId,
        country: countryId,
        city: row.city,
        askingPrice: row.askingPrice,
        yearEstablished: row.yearEstablished,
        numEmployees: row.numEmployees,
        isFeatured: row.isFeatured,
        status: row.status,
      });
      results.created++;
    } catch (error) {
      results.errors.push({ row: rowNum, message: error.message });
    }
  }

  logger.info(`Bulk import: ${results.created} created, ${results.duplicates} duplicates, ${results.errors.length} errors`);
  return results;
};

const bulkUpdateBusinesses = async (ids, updates) => {
  const result = await Business.updateMany({ _id: { $in: ids } }, updates);
  return result.modifiedCount;
};

const bulkDeleteBusinesses = async (ids) => {
  const result = await Business.deleteMany({ _id: { $in: ids } });
  return result.deletedCount;
};

module.exports = { importBusinesses, bulkUpdateBusinesses, bulkDeleteBusinesses };
