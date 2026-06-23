const Business = require('../models/Business');
const logger = require('../utils/logger');
const { deleteFromCloudinary } = require('../middleware/upload');

const extractPublicId = (url) => {
  // Extract Cloudinary public_id from URL like:
  // https://res.cloudinary.com/xxx/image/upload/v123/phoenix/businesses/abc.jpg
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    const pathWithVersion = parts[1];
    // Remove version prefix (v123456/)
    const withoutVersion = pathWithVersion.replace(/^v\d+\//, '');
    // Remove file extension
    return withoutVersion.replace(/\.\w+$/, '');
  } catch {
    return null;
  }
};

const deleteImageFile = async (imagePath) => {
  try {
    if (imagePath.startsWith('http')) {
      // Cloudinary URL
      const publicId = extractPublicId(imagePath);
      if (publicId) await deleteFromCloudinary(publicId);
    }
  } catch (error) {
    logger.warn('Failed to delete image:', error.message);
  }
};

const deleteBusinessImages = async (images) => {
  if (images && images.length) {
    await Promise.all(images.map(deleteImageFile));
  }
};

const removeImageAtIndex = async (businessId, imageIndex) => {
  const business = await Business.findById(businessId);
  if (!business) return null;

  if (imageIndex < 0 || imageIndex >= business.images.length) {
    return { error: 'Image index out of range' };
  }

  const removed = business.images[imageIndex];
  await deleteImageFile(removed);
  business.images.splice(imageIndex, 1);
  await business.save();

  return business;
};

module.exports = { deleteImageFile, deleteBusinessImages, removeImageAtIndex };
