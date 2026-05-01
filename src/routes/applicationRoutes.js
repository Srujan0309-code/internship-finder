const express = require('express');
const router = express.Router();
const {
  applyToInternship,
  getMyApplications,
  getApplication,
  updateStatus,
  addNote,
  deleteNote,
  withdrawApplication,
} = require('../controllers/applicationController');
const { verifyJWT } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Internship application tracker
 */

// All routes protected
router.use(verifyJWT);

/**
 * @swagger
 * /applications:
 *   get:
 *     summary: Get all my applications (filterable by status)
 *     tags: [Applications]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [applied, under_review, interview, rejected, offer, withdrawn]
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 */
router.get('/', getMyApplications);

/**
 * @swagger
 * /applications/{internshipId}:
 *   post:
 *     summary: Apply to an internship
 *     tags: [Applications]
 */
router.post('/:internshipId', validate(schemas.applyInternship), applyToInternship);

/**
 * @swagger
 * /applications/{id}:
 *   get:
 *     summary: Get a specific application with full details
 *     tags: [Applications]
 *   delete:
 *     summary: Withdraw an application
 *     tags: [Applications]
 */
router.get('/:id', getApplication);
router.delete('/:id', withdrawApplication);

/**
 * @swagger
 * /applications/{id}/status:
 *   patch:
 *     summary: Update application status
 *     tags: [Applications]
 */
router.patch('/:id/status', validate(schemas.updateApplicationStatus), updateStatus);

/**
 * @swagger
 * /applications/{id}/notes:
 *   post:
 *     summary: Add a note to an application
 *     tags: [Applications]
 */
router.post('/:id/notes', validate(schemas.addNote), addNote);

/**
 * @swagger
 * /applications/{id}/notes/{noteId}:
 *   delete:
 *     summary: Delete a note from an application
 *     tags: [Applications]
 */
router.delete('/:id/notes/:noteId', deleteNote);

module.exports = router;
