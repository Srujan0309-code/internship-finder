const Application = require('../models/Application');
const Internship = require('../models/Internship');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Get dashboard analytics for current user
 * @route   GET /api/v1/analytics/dashboard
 * @access  Protected
 */
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [total, statusBreakdown, recentApplications, activeInternships] = await Promise.all([
    Application.countDocuments({ user: userId }),
    Application.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]),
    Application.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('internship', 'title company deadline'),
    Internship.countDocuments({ isActive: true, deadline: { $gte: new Date() } }),
  ]);

  return ApiResponse.success(res, {
    total,
    statusBreakdown,
    recentApplications,
    activeInternships,
  });
});

/**
 * @desc    Get weekly application trend (last 8 weeks)
 * @route   GET /api/v1/analytics/weekly
 * @access  Protected
 */
const getWeeklyStats = asyncHandler(async (req, res) => {
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const stats = await Application.aggregate([
    { $match: { user: req.user._id, createdAt: { $gte: eightWeeksAgo } } },
    {
      $group: {
        _id: { $week: '$createdAt' },
        count: { $sum: 1 },
        year: { $first: { $year: '$createdAt' } },
      },
    },
    { $sort: { '_id': 1 } },
  ]);

  return ApiResponse.success(res, { weekly: stats });
});

/**
 * @desc    Get monthly application trend (last 12 months)
 * @route   GET /api/v1/analytics/monthly
 * @access  Protected
 */
const getMonthlyStats = asyncHandler(async (req, res) => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const stats = await Application.aggregate([
    { $match: { user: req.user._id, createdAt: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  return ApiResponse.success(res, { monthly: stats });
});

/**
 * @desc    Admin: platform-wide statistics
 * @route   GET /api/v1/analytics/admin
 * @access  Admin
 */
const getAdminStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalInternships, totalApplications, applicationsByStatus] = await Promise.all([
    User.countDocuments(),
    Internship.countDocuments(),
    Application.countDocuments(),
    Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  return ApiResponse.success(res, {
    totalUsers,
    totalInternships,
    totalApplications,
    applicationsByStatus,
  });
});

module.exports = { getDashboard, getWeeklyStats, getMonthlyStats, getAdminStats };
