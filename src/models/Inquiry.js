const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'responded', 'closed'],
      default: 'new',
    },
  },
  { timestamps: true }
);

inquirySchema.index({ user: 1 });
inquirySchema.index({ business: 1 });
inquirySchema.index({ status: 1 });

inquirySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Inquiry', inquirySchema);
