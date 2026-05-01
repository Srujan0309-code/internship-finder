const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');
const ApiError = require('../utils/ApiError');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — we pipe the buffer directly to Cloudinary
const memStorage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const uploadResume = multer({
  storage: memStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'), false);
    }
  },
});

/**
 * Uploads a buffer to Cloudinary and returns { url, publicId }.
 * Used in userController after multer parses the file into req.file.buffer.
 */
const uploadBufferToCloudinary = (buffer, userId) => {
  return new Promise((resolve, reject) => {
    const publicId = `internship-finder/resumes/resume_${userId}_${Date.now()}`;
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', public_id: publicId },
      (error, result) => {
        if (error) return reject(new ApiError(500, `Cloudinary upload failed: ${error.message}`));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = { cloudinary, uploadResume, uploadBufferToCloudinary };
