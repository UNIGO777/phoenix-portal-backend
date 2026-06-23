const mongoose = require('mongoose');

const savedBusinessSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
  },
  { timestamps: true }
);

savedBusinessSchema.index({ user: 1, business: 1 }, { unique: true });

savedBusinessSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('SavedBusiness', savedBusinessSchema);
