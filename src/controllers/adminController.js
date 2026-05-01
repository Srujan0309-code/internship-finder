const User = require('../models/User');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const paginate = require('../utils/paginate');

/**
 * @desc    List all users
 * @route   GET /api/v1/admin/users
 * @access  Admin
 */
const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role } = req.query;
  const filter = {};
  if (role) filter.role = role;

  const { data, meta } = await paginate(User, filter, {
    page,
    limit,
    select: '-password -refreshToken',
    sort: { createdAt: -1 },
  });

  return ApiResponse.paginated(res, data, meta);
});

/**
 * @desc    Toggle user active status (ban/unban)
 * @route   PATCH /api/v1/admin/users/:id/toggle
 * @access  Admin
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  if (user._id.toString() === req.user._id.toString()) throw ApiError.badRequest('Cannot toggle your own status');

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, { isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'deactivated'}`);
});

/**
 * @desc    Promote user to admin
 * @route   PATCH /api/v1/admin/users/:id/promote
 * @access  Admin
 */
const promoteToAdmin = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: 'admin' },
    { new: true }
  ).select('-password -refreshToken');
  if (!user) throw ApiError.notFound('User not found');
  return ApiResponse.success(res, { user }, 'User promoted to admin');
});

/**
 * @desc    List all internships (including inactive)
 * @route   GET /api/v1/admin/internships
 * @access  Admin
 */
const listAllInternships = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const { data, meta } = await paginate(Internship, {}, {
    page,
    limit,
    populate: { path: 'postedBy', select: 'name email' },
    sort: { createdAt: -1 },
  });
  return ApiResponse.paginated(res, data, meta);
});

/**
 * @desc    Hard delete internship
 * @route   DELETE /api/v1/admin/internships/:id
 * @access  Admin
 */
const hardDeleteInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findByIdAndDelete(req.params.id);
  if (!internship) throw ApiError.notFound('Internship not found');
  await Application.deleteMany({ internship: req.params.id });
  return ApiResponse.success(res, null, 'Internship and related applications deleted');
});

module.exports = { listUsers, toggleUserStatus, promoteToAdmin, listAllInternships, hardDeleteInternship };
