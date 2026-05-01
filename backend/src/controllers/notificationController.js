const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const paginate = require('../utils/paginate');

/**
 * @desc    Get notifications for current user
 * @route   GET /api/v1/notifications
 * @access  Protected
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { isRead, page = 1, limit = 20 } = req.query;
  const filter = { user: req.user._id };
  if (isRead !== undefined) filter.isRead = isRead === 'true';

  const { data, meta } = await paginate(Notification, filter, {
    page,
    limit,
    sort: { createdAt: -1 },
  });

  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

  return ApiResponse.paginated(res, data, { ...meta, unreadCount });
});

/**
 * @desc    Mark a notification as read
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Protected
 */
const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw ApiError.notFound('Notification not found');
  return ApiResponse.success(res, { notification }, 'Marked as read');
});

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/v1/notifications/read-all
 * @access  Protected
 */
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  return ApiResponse.success(res, null, 'All notifications marked as read');
});

/**
 * @desc    Delete a notification
 * @route   DELETE /api/v1/notifications/:id
 * @access  Protected
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!notification) throw ApiError.notFound('Notification not found');
  return ApiResponse.success(res, null, 'Notification deleted');
});

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };
