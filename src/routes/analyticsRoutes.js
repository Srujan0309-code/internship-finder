const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getWeeklyStats,
  getMonthlyStats,
  getAdminStats,
} = require('../controllers/analyticsController');
const { verifyJWT, verifyAdmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Application statistics and trends
 */

router.use(verifyJWT);

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Personal dashboard stats (totals, status breakdown, recent apps)
 *     tags: [Analytics]
 */
router.get('/dashboard', getDashboard);

/**
 * @swagger
 * /analytics/weekly:
 *   get:
 *     summary: Weekly application count for the last 8 weeks
 *     tags: [Analytics]
 */
router.get('/weekly', getWeeklyStats);

/**
 * @swagger
 * /analytics/monthly:
 *   get:
 *     summary: Monthly application count for the last 12 months
 *     tags: [Analytics]
 */
router.get('/monthly', getMonthlyStats);

/**
 * @swagger
 * /analytics/admin:
 *   get:
 *     summary: Platform-wide stats (admin only)
 *     tags: [Analytics]
 */
router.get('/admin', verifyAdmin, getAdminStats);

module.exports = router;
