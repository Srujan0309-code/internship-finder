const express = require('express');
const router = express.Router();
const {
  listUsers,
  toggleUserStatus,
  promoteToAdmin,
  listAllInternships,
  hardDeleteInternship,
} = require('../controllers/adminController');
const { verifyJWT, verifyAdmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only platform management endpoints
 */

// All admin routes: must be authenticated AND admin role
router.use(verifyJWT, verifyAdmin);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users (paginated)
 *     tags: [Admin]
 */
router.get('/users', listUsers);

/**
 * @swagger
 * /admin/users/{id}/toggle:
 *   patch:
 *     summary: Toggle user active/banned status
 *     tags: [Admin]
 */
router.patch('/users/:id/toggle', toggleUserStatus);

/**
 * @swagger
 * /admin/users/{id}/promote:
 *   patch:
 *     summary: Promote user to admin role
 *     tags: [Admin]
 */
router.patch('/users/:id/promote', promoteToAdmin);

/**
 * @swagger
 * /admin/internships:
 *   get:
 *     summary: List all internships including inactive ones
 *     tags: [Admin]
 */
router.get('/internships', listAllInternships);

/**
 * @swagger
 * /admin/internships/{id}:
 *   delete:
 *     summary: Hard-delete an internship and its applications
 *     tags: [Admin]
 */
router.delete('/internships/:id', hardDeleteInternship);

module.exports = router;
