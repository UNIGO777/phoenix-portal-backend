const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    industry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Industry',
      required: [true, 'Industry is required'],
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      required: [true, 'Country is required'],
    },
    city: {
      type: String,
      trim: true,
    },
    askingPrice: {
      type: Number,
      min: [0, 'Asking price cannot be negative'],
    },
    yearEstablished: {
      type: Number,
    },
    numEmployees: {
      type: Number,
      min: [0, 'Number of employees cannot be negative'],
    },
    images: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredOrder: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'sold', 'draft'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

businessSchema.index({ name: 'text', description: 'text', city: 'text' });
businessSchema.index({ industry: 1 });
businessSchema.index({ country: 1 });
businessSchema.index({ status: 1 });
businessSchema.index({ isFeatured: 1, featuredOrder: 1 });
businessSchema.index({ askingPrice: 1 });

businessSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Business', businessSchema);
