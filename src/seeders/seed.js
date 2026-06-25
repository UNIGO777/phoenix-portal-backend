const mongoose = require('mongoose');
const env = require('../config/env');
const logger = require('../utils/logger');
const Industry = require('../models/Industry');
const Country = require('../models/Country');
const Admin = require('../models/Admin');

const industries = [
  { name: 'Technology', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80' },
  { name: 'Healthcare', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80' },
  { name: 'Manufacturing', image: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&q=80' },
  { name: 'E-Commerce', image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80' },
  { name: 'Logistics', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80' },
  { name: 'Hospitality', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80' },
  { name: 'Finance', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80' },
  { name: 'Real Estate', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80' },
  { name: 'Education', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80' },
  { name: 'Retail', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80' },
  { name: 'Food & Beverage', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80' },
  { name: 'Automotive', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80' },
  { name: 'Energy', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80' },
  { name: 'Construction', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80' },
  { name: 'Media & Entertainment', image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80' },
];

const countries = [
  { name: 'United States', code: 'US' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Canada', code: 'CA' },
  { name: 'Australia', code: 'AU' },
  { name: 'Germany', code: 'DE' },
  { name: 'France', code: 'FR' },
  { name: 'United Arab Emirates', code: 'AE' },
  { name: 'Saudi Arabia', code: 'SA' },
  { name: 'India', code: 'IN' },
  { name: 'Singapore', code: 'SG' },
  { name: 'Japan', code: 'JP' },
  { name: 'South Korea', code: 'KR' },
  { name: 'Brazil', code: 'BR' },
  { name: 'Netherlands', code: 'NL' },
  { name: 'Switzerland', code: 'CH' },
  { name: 'Spain', code: 'ES' },
  { name: 'Italy', code: 'IT' },
  { name: 'China', code: 'CN' },
  { name: 'Mexico', code: 'MX' },
  { name: 'South Africa', code: 'ZA' },
];

async function seed() {
  try {
    await mongoose.connect(env.db.uri, { dbName: env.db.name });
    logger.info('Connected to MongoDB for seeding');

    // Seed industries (upsert with images)
    let created = 0;
    let updated = 0;
    for (const ind of industries) {
      const result = await Industry.findOneAndUpdate(
        { name: ind.name },
        { name: ind.name, image: ind.image },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (result.createdAt && result.updatedAt && result.createdAt.getTime() === result.updatedAt.getTime()) {
        created++;
      } else {
        updated++;
      }
    }
    logger.info(`Industries: ${created} created, ${updated} updated`);

    // Seed countries
    created = 0;
    for (const c of countries) {
      const exists = await Country.findOne({ name: c.name });
      if (!exists) {
        await Country.create(c);
        created++;
      }
    }
    logger.info(`Countries: ${created} created, ${countries.length - created} already existed`);

    // Seed admin
    const adminEmail = 'info@pcba.com.au';
    const exists = await Admin.findOne({ email: adminEmail });
    if (!exists) {
      await Admin.create({
        email: adminEmail,
        password: 'info@1234',
        name: 'Admin',
      });
      logger.info(`Admin created: ${adminEmail}`);
    } else {
      logger.info(`Admin already exists: ${adminEmail}`);
    }

    logger.info('Seeding complete');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
