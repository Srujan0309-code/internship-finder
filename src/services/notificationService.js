const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Creates a notification record in the database.
 */
const createNotification = async ({ userId, type, title, message, metadata = {} }) => {
  try {
    return await Notification.create({ user: userId, type, title, message, metadata });
  } catch (err) {
    logger.error('Failed to create notification:', err.message);
    // Non-blocking
  }
};

const notifyDeadline = (userId, internship) =>
  createNotification({
    userId,
    type: 'deadline_reminder',
    title: 'Application Deadline Approaching',
    message: `The deadline for "${internship.title}" at ${internship.company} is ${new Date(internship.deadline).toDateString()}.`,
    metadata: { internshipId: internship._id },
  });

const notifyStatusChange = (userId, application, internshipTitle) =>
  createNotification({
    userId,
    type: 'status_update',
    title: 'Application Status Updated',
    message: `Your application for "${internshipTitle}" has been updated to: ${application.status.toUpperCase()}.`,
    metadata: { applicationId: application._id },
  });

const notifyMatchResult = (userId, applicationId, score) =>
  createNotification({
    userId,
    type: 'match_result',
    title: 'AI Resume Match Complete',
    message: `Your resume matched ${score}% with the job description. Check your application for detailed suggestions.`,
    metadata: { applicationId },
  });

module.exports = { createNotification, notifyDeadline, notifyStatusChange, notifyMatchResult };
