const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  const allowedMimeTypes = /^image\/(jpeg|jpg|png|gif|webp|svg\+xml|svg)$/;

  const extname = allowedExtensions.test(path.extname(file.originalname));
  const mimetype = allowedMimeTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid image format. Supported formats: JPG, JPEG, PNG, GIF, WEBP, SVG.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Image size exceeds the maximum allowed size of 10 MB. Please upload a smaller image.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Please check the maximum allowed number of files.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Please check the field name.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`,
    });
  }

  if (err) {
    if (err.message.includes('Invalid image format')) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error. Please try again.',
    });
  }

  next();
};

module.exports = { upload, handleMulterError };
