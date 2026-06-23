const { generateTemplate, parseExcelBuffer } = require('../utils/excelParser');
const { importBusinesses, bulkUpdateBusinesses, bulkDeleteBusinesses } = require('../services/bulkImportService');

exports.downloadTemplate = async (req, res, next) => {
  try {
    const buffer = generateTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=business_import_template.xlsx');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

exports.importBusinesses = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Excel file is required' });
    }

    const rows = parseExcelBuffer(req.file.buffer);
    if (!rows.length) {
      return res.status(400).json({ success: false, message: 'Excel file is empty' });
    }

    const results = await importBusinesses(rows);

    res.json({
      success: true,
      message: `Import complete: ${results.created} created, ${results.duplicates} duplicates, ${results.errors.length} errors`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

exports.bulkUpdate = async (req, res, next) => {
  try {
    const { ids, updates } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: 'IDs array is required' });
    }

    // Only allow certain fields for bulk update
    const allowed = ['status', 'isFeatured', 'industry', 'country'];
    const safeUpdates = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        safeUpdates[key] = updates[key];
      }
    }

    if (!Object.keys(safeUpdates).length) {
      return res.status(400).json({ success: false, message: 'No valid update fields provided' });
    }

    const count = await bulkUpdateBusinesses(ids, safeUpdates);
    res.json({ success: true, message: `${count} business(es) updated` });
  } catch (error) {
    next(error);
  }
};

exports.bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: 'IDs array is required' });
    }

    const count = await bulkDeleteBusinesses(ids);
    res.json({ success: true, message: `${count} business(es) deleted` });
  } catch (error) {
    next(error);
  }
};

exports.bulkActivate = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: 'IDs array is required' });
    }

    const count = await bulkUpdateBusinesses(ids, { status: 'active' });
    res.json({ success: true, message: `${count} business(es) activated` });
  } catch (error) {
    next(error);
  }
};

exports.bulkDeactivate = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: 'IDs array is required' });
    }

    const count = await bulkUpdateBusinesses(ids, { status: 'draft' });
    res.json({ success: true, message: `${count} business(es) deactivated` });
  } catch (error) {
    next(error);
  }
};

exports.bulkFeatured = async (req, res, next) => {
  try {
    const { ids, featured } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: 'IDs array is required' });
    }

    const count = await bulkUpdateBusinesses(ids, { isFeatured: featured !== false });
    res.json({ success: true, message: `${count} business(es) updated` });
  } catch (error) {
    next(error);
  }
};
