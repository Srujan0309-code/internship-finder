const express = require('express');
const router = express.Router();
const { matchResume, getMatchResult } = require('../controllers/aiController');
const { verifyJWT } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI-powered resume matching using Groq LLaMA3
 */

router.use(verifyJWT);

/**
 * @swagger
 * /ai/match:
 *   post:
 *     summary: Match your resume against a job description (Groq AI)
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobDescription]
 *             properties:
 *               jobDescription:
 *                 type: string
 *                 description: The full job description text
 *               applicationId:
 *                 type: string
 *                 description: Optional - saves result to this application
 *     responses:
 *       200:
 *         description: Match score, missing skills, and improvement suggestions
 */
router.post('/match', aiLimiter, validate(schemas.resumeMatch), matchResume);

/**
 * @swagger
 * /ai/match/{applicationId}:
 *   get:
 *     summary: Get saved AI match result for an application
 *     tags: [AI]
 */
router.get('/match/:applicationId', getMatchResult);

module.exports = router;
