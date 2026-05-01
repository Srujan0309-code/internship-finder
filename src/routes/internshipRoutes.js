const express = require('express');
const router = express.Router();
const {
  getInternships,
  getInternship,
  createInternship,
  updateInternship,
  deleteInternship,
  getMyInternships,
} = require('../controllers/internshipController');
const { verifyJWT } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Internships
 *   description: Internship listing management
 */

/**
 * @swagger
 * /internships:
 *   get:
 *     summary: List internships with filters and search
 *     tags: [Internships]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Full-text search across title, company, description
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: locationType
 *         schema: { type: string, enum: [remote, onsite, hybrid] }
 *       - in: query
 *         name: skills
 *         schema: { type: string }
 *         description: Comma-separated list of skills
 *       - in: query
 *         name: company
 *         schema: { type: string }
 *       - in: query
 *         name: isPaid
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, default: "-createdAt" }
 *   post:
 *     summary: Create a new internship listing
 *     tags: [Internships]
 */
router.get('/', getInternships);
router.post('/', verifyJWT, validate(schemas.createInternship), createInternship);

/**
 * @swagger
 * /internships/my:
 *   get:
 *     summary: Get internships posted by the current user
 *     tags: [Internships]
 */
router.get('/my', verifyJWT, getMyInternships);

/**
 * @swagger
 * /internships/{id}:
 *   get:
 *     summary: Get a single internship by ID
 *     tags: [Internships]
 *     security: []
 *   put:
 *     summary: Update an internship
 *     tags: [Internships]
 *   delete:
 *     summary: Soft-delete an internship
 *     tags: [Internships]
 */
router.get('/:id', getInternship);
router.put('/:id', verifyJWT, validate(schemas.updateInternship), updateInternship);
router.delete('/:id', verifyJWT, deleteInternship);

module.exports = router;
