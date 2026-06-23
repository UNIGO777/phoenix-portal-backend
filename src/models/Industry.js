const mongoose = require('mongoose');

const industrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Industry name is required'],
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

industrySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Industry', industrySchema);
