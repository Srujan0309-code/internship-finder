const { cloudinary } = require('../config/cloudinary');
const logger = require('../utils/logger');

/**
 * Deletes a file from Cloudinary by its public_id.
 * Handles both image and raw (document) resource types.
 */
const deleteFile = async (publicId, resourceType = 'raw') => {
  if (!publicId) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    logger.info(`Cloudinary: deleted ${publicId} → ${result.result}`);
    return result;
  } catch (err) {
    logger.error(`Cloudinary deletion failed for ${publicId}:`, err.message);
    // Non-blocking
  }
};

module.exports = { deleteFile };
