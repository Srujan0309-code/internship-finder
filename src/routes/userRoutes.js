const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadResume, deleteResume, getUserById } = require('../controllers/userController');
const { verifyJWT } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validationMiddleware');
const { uploadResume: multerUpload } = require('../config/cloudinary');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and resume management
 */

// All user routes require authentication
router.use(verifyJWT);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *   patch:
 *     summary: Update current user's profile
 *     tags: [Users]
 */
router.get('/profile', getProfile);
router.patch('/profile', validate(schemas.updateProfile), updateProfile);

/**
 * @swagger
 * /users/resume:
 *   post:
 *     summary: Upload or replace resume (PDF/DOC, max 5MB)
 *     tags: [Users]
 *   delete:
 *     summary: Delete resume
 *     tags: [Users]
 */
router.post('/resume', multerUpload.single('resume'), uploadResume);
router.delete('/resume', deleteResume);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get public profile of a user by ID
 *     tags: [Users]
 */
router.get('/:id', getUserById);

module.exports = router;
