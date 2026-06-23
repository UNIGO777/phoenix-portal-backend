const multer = require('multer');
const path = require('path');
const env = require('../config/env');
const cloudinary = require('../config/cloudinary');

// Use memory storage — files go to Cloudinary, not disk
const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  const allowedExts = /\.(jpe?g|png|webp|gif|svg|heic|heif|avif|bmp|tiff?)$/i;
  const allowedMimes = /^image\//;

  const extOk = allowedExts.test(path.extname(file.originalname));
  const mimeOk = allowedMimes.test(file.mimetype);

  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error(`File "${file.originalname}" is not a supported image. Allowed: JPEG, PNG, WebP, GIF, SVG, HEIC, AVIF.`), false);
  }
};

const uploadBusinessImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: env.upload.maxFileSize,
    files: env.upload.maxFiles,
  },
});

const uploadToCloudinary = (buffer, folder = 'businesses') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `phoenix/${folder}`, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.warn('Failed to delete from Cloudinary:', error.message);
  }
};

const uploadExcel = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = /xlsx|csv|xls/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) and CSV files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = { uploadBusinessImages, uploadExcel, uploadToCloudinary, deleteFromCloudinary };
