const mongoose = require('mongoose');
const env = require('../config/env');
const logger = require('../utils/logger');
const Business = require('../models/Business');
const Industry = require('../models/Industry');
const Country = require('../models/Country');

const sampleBusinesses = [
  {
    name: 'Vertical CRM Platform',
    description: 'Profitable B2B software with 92% net revenue retention and a seasoned team in place.',
    askingPrice: 7200000,
    yearEstablished: 2016,
    numEmployees: 24,
    city: 'San Francisco',
    status: 'active',
    isFeatured: true,
    featuredOrder: 1,
    images: ['https://images.unsplash.com/photo-1551434678-e076c223a692?w=1000&q=80'],
  },
  {
    name: 'DTC Home Goods Brand',
    description: 'Loyal customer base with 38% repeat purchase rate.',
    askingPrice: 3400000,
    yearEstablished: 2018,
    numEmployees: 12,
    city: 'Los Angeles',
    status: 'active',
    isFeatured: true,
    featuredOrder: 2,
    images: ['https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&q=80'],
  },
  {
    name: 'Multi-Site Dental Group',
    description: 'Four locations with recurring patient base.',
    askingPrice: 9800000,
    yearEstablished: 2012,
    numEmployees: 45,
    city: 'New York',
    status: 'active',
    isFeatured: true,
    featuredOrder: 3,
    images: ['https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80'],
  },
  {
    name: 'Workflow Automation Tool',
    description: 'Revenue $3.2M with 41% margin.',
    askingPrice: 5600000,
    yearEstablished: 2017,
    numEmployees: 18,
    city: 'Austin',
    status: 'active',
    isFeatured: true,
    featuredOrder: 4,
    images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80'],
  },
  {
    name: 'Specialty Coffee Chain',
    description: 'Revenue $4.1M across 6 locations.',
    askingPrice: 2900000,
    yearEstablished: 2014,
    numEmployees: 32,
    city: 'Seattle',
    status: 'active',
    isFeatured: true,
    featuredOrder: 5,
    images: ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80'],
  },
  {
    name: 'SaaS Analytics Platform',
    description: 'Enterprise analytics with $2.8M ARR and 60% gross margins.',
    askingPrice: 4500000,
    yearEstablished: 2015,
    numEmployees: 28,
    city: 'Boston',
    status: 'active',
    isFeatured: true,
    images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80'],
  },
  {
    name: 'Digital Marketing Agency',
    description: 'Full-service agency serving 150+ clients with $5.2M revenue.',
    askingPrice: 3800000,
    yearEstablished: 2010,
    numEmployees: 35,
    city: 'Chicago',
    status: 'active',
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'],
  },
  {
    name: 'Fitness & Wellness Centers',
    description: 'Chain of 8 premium fitness centers in major cities.',
    askingPrice: 6200000,
    yearEstablished: 2013,
    numEmployees: 52,
    city: 'Miami',
    status: 'active',
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'],
  },
  {
    name: 'E-Commerce Logistics Network',
    description: 'Fulfillment service managing $8.5M in annual shipments.',
    askingPrice: 5200000,
    yearEstablished: 2011,
    numEmployees: 42,
    city: 'Dallas',
    status: 'active',
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1565849904461-04db1267c0cc?w=800&q=80'],
  },
  {
    name: 'Niche Publishing Platform',
    description: 'Industry publication with 45K subscribers and newsletter revenue.',
    askingPrice: 2400000,
    yearEstablished: 2012,
    numEmployees: 8,
    city: 'Portland',
    status: 'active',
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1554224311-beee415c15c9?w=800&q=80'],
  },
  {
    name: 'Managed IT Services Firm',
    description: '150+ managed clients with recurring revenue model. 24/7 support team.',
    askingPrice: 4100000,
    yearEstablished: 2009,
    numEmployees: 22,
    city: 'Denver',
    status: 'active',
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80'],
  },
  {
    name: 'Pet Care Franchise Network',
    description: 'Expanding franchise with 12 locations and strong brand recognition.',
    askingPrice: 3600000,
    yearEstablished: 2014,
    numEmployees: 38,
    city: 'Phoenix',
    status: 'active',
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1552053831-71594a27c62d?w=800&q=80'],
  },
  {
    name: 'Cloud Infrastructure Provider',
    description: 'B2B cloud services with 200+ enterprise clients and $6.5M ARR.',
    askingPrice: 8900000,
    yearEstablished: 2013,
    numEmployees: 40,
    city: 'San Jose',
    status: 'active',
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1544197150-b99a580bb3e7?w=800&q=80'],
  },
  {
    name: 'Real Estate Investment Group',
    description: 'Property management company overseeing 50+ residential units.',
    askingPrice: 7100000,
    yearEstablished: 2008,
    numEmployees: 18,
    city: 'Atlanta',
    status: 'active',
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'],
  },
  {
    name: 'Organic Food Distribution',
    description: 'B2B organic produce distributor serving 200+ restaurants and retailers.',
    askingPrice: 2800000,
    yearEstablished: 2011,
    numEmployees: 25,
    city: 'Boulder',
    status: 'active',
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1488459716781-0cb67da46c8a?w=800&q=80'],
  },
  {
    name: 'Mobile App Development Studio',
    description: 'Award-winning studio with 8 published apps and 2M+ downloads.',
    askingPrice: 3200000,
    yearEstablished: 2016,
    numEmployees: 16,
    city: 'Brooklyn',
    status: 'active',
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80'],
  },
  {
    name: 'Educational Software Platform',
    description: 'Online learning platform with 50K+ enrolled students and institutional partnerships.',
    askingPrice: 6700000,
    yearEstablished: 2012,
    numEmployees: 34,
    city: 'Cambridge',
    status: 'active',
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80'],
  },
  {
    name: 'Industrial Equipment Rental',
    description: 'Fleet of 500+ units with strong contractor relationships.',
    askingPrice: 5900000,
    yearEstablished: 2007,
    numEmployees: 41,
    city: 'Houston',
    status: 'active',
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80'],
  },
  {
    name: 'Luxury Event Planning Services',
    description: 'High-end event planner managing 50+ events annually with $4.3M revenue.',
    askingPrice: 3500000,
    yearEstablished: 2015,
    numEmployees: 14,
    city: 'Las Vegas',
    status: 'active',
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80'],
  },
];

async function seedBusinesses() {
  try {
    await mongoose.connect(env.db.uri, { dbName: env.db.name });
    logger.info('Connected to MongoDB for seeding businesses');

    const industry = await Industry.findOne();
    const country = await Country.findOne();

    if (!industry || !country) {
      logger.error('Industries and Countries must be seeded first. Run: npm run seed');
      await mongoose.disconnect();
      process.exit(1);
    }

    let created = 0;
    for (const biz of sampleBusinesses) {
      const exists = await Business.findOne({ name: biz.name });
      if (!exists) {
        await Business.create({
          ...biz,
          industry: industry._id,
          country: country._id,
        });
        created++;
        logger.info(`✅ Business created: ${biz.name} ${biz.isFeatured ? '(FEATURED)' : ''}`);
      }
    }

    logger.info(`\n✅ Complete: ${created} new businesses seeded`);
    logger.info(`✅ Featured: 5 businesses ready to display`);
    logger.info(`✅ Total: ${sampleBusinesses.length} businesses available`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seedBusinesses();
