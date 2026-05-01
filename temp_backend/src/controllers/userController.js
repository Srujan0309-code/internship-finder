const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { deleteFile } = require('../services/cloudinaryService');
const { uploadBufferToCloudinary } = require('../config/cloudinary');

/**
 * @desc    Get user profile
 * @route   GET /api/v1/users/profile
 * @access  Protected
 */
const getProfile = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, { user: req.user });
});

/**
 * @desc    Update user profile
 * @route   PATCH /api/v1/users/profile
 * @access  Protected
 */
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'profile'];
  const updates = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return ApiResponse.success(res, { user: user.toSafeObject() }, 'Profile updated');
});

/**
 * @desc    Upload / replace resume
 * @route   POST /api/v1/users/resume
 * @access  Protected
 */
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');

  const user = await User.findById(req.user._id);

  // Delete old resume from Cloudinary if it exists
  if (user.resume?.publicId) {
    await deleteFile(user.resume.publicId, 'raw');
  }

  // Stream buffer to Cloudinary
  const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer, req.user._id);

  user.resume = { url, publicId, uploadedAt: new Date() };
  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, { resume: user.resume }, 'Resume uploaded successfully');
});

/**
 * @desc    Delete resume
 * @route   DELETE /api/v1/users/resume
 * @access  Protected
 */
const deleteResume = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.resume?.publicId) throw ApiError.notFound('No resume found');

  await deleteFile(user.resume.publicId, 'raw');
  user.resume = { url: '', publicId: '', uploadedAt: null };
  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, null, 'Resume deleted');
});

/**
 * @desc    Get public profile of any user (by ID)
 * @route   GET /api/v1/users/:id
 * @access  Protected
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('name profile createdAt');
  if (!user) throw ApiError.notFound('User not found');
  return ApiResponse.success(res, { user });
});

module.exports = { getProfile, updateProfile, uploadResume, deleteResume, getUserById };
