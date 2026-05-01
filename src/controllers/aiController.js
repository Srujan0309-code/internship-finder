const Application = require('../models/Application');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { matchResumeWithJob } = require('../services/aiService');
const { notifyMatchResult } = require('../services/notificationService');

/**
 * @desc    Match resume against a job description using Groq AI
 * @route   POST /api/v1/ai/match
 * @access  Protected
 */
const matchResume = asyncHandler(async (req, res) => {
  const { jobDescription, applicationId } = req.body;

  // Get user's resume text from profile
  const user = await User.findById(req.user._id);
  if (!user.resume?.url) throw ApiError.badRequest('No resume found. Please upload a resume first.');

  // Use resume URL as reference text for matching.
  // In a full implementation, you'd extract text from the PDF via a parsing library.
  // Here we compose a profile-based summary as the resume representation.
  const resumeText = `
Name: ${user.name}
Skills: ${(user.profile?.skills || []).join(', ')}
Bio: ${user.profile?.bio || ''}
LinkedIn: ${user.profile?.linkedIn || ''}
Portfolio: ${user.profile?.portfolio || ''}
Resume URL: ${user.resume.url}
  `.trim();

  const result = await matchResumeWithJob(resumeText, jobDescription);

  // If applicationId provided, save the match result to that application
  if (applicationId) {
    const application = await Application.findOne({
      _id: applicationId,
      user: req.user._id,
    });

    if (application) {
      application.matchResult = {
        score: result.score,
        missingSkills: result.missingSkills,
        suggestions: result.suggestions,
        rawResponse: result.rawResponse,
        matchedAt: new Date(),
      };
      await application.save();

      // Notify user
      await notifyMatchResult(req.user._id, applicationId, result.score);
    }
  }

  return ApiResponse.success(res, { matchResult: result }, 'Resume analysis complete');
});

/**
 * @desc    Get saved match result for an application
 * @route   GET /api/v1/ai/match/:applicationId
 * @access  Protected
 */
const getMatchResult = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.applicationId,
    user: req.user._id,
  }).select('matchResult internship');

  if (!application) throw ApiError.notFound('Application not found');
  if (!application.matchResult?.score) throw ApiError.notFound('No match result found for this application');

  return ApiResponse.success(res, { matchResult: application.matchResult });
});

module.exports = { matchResume, getMatchResult };
