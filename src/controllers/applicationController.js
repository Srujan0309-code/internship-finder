const Application = require('../models/Application');
const Internship = require('../models/Internship');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const paginate = require('../utils/paginate');
const { notifyStatusChange } = require('../services/notificationService');
const { sendStatusUpdate } = require('../services/emailService');

/**
 * @desc    Apply to an internship
 * @route   POST /api/v1/applications/:internshipId
 * @access  Protected
 */
const applyToInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.internshipId);
  if (!internship || !internship.isActive) throw ApiError.notFound('Internship not found or closed');
  if (new Date(internship.deadline) < new Date()) throw ApiError.badRequest('Application deadline has passed');

  const application = await Application.create({
    user: req.user._id,
    internship: req.params.internshipId,
    coverLetter: req.body.coverLetter || '',
    statusHistory: [{ status: 'applied', changedAt: new Date() }],
  });

  return ApiResponse.created(res, { application }, 'Application submitted successfully');
});

/**
 * @desc    Get my applications
 * @route   GET /api/v1/applications
 * @access  Protected
 */
const getMyApplications = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const { data, meta } = await paginate(Application, filter, {
    page,
    limit,
    populate: { path: 'internship', select: 'title company location deadline' },
    sort: { createdAt: -1 },
  });

  return ApiResponse.paginated(res, data, meta);
});

/**
 * @desc    Get single application
 * @route   GET /api/v1/applications/:id
 * @access  Protected
 */
const getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('internship')
    .populate('user', 'name email');

  if (!application) throw ApiError.notFound('Application not found');

  const isOwner = application.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw ApiError.forbidden('Not authorized');

  return ApiResponse.success(res, { application });
});

/**
 * @desc    Update application status
 * @route   PATCH /api/v1/applications/:id/status
 * @access  Protected (admin or internship poster)
 */
const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const application = await Application.findById(req.params.id).populate('internship', 'title postedBy');
  if (!application) throw ApiError.notFound('Application not found');

  const isPoster = application.internship.postedBy?.toString() === req.user._id.toString();
  const isApplicant = application.user.toString() === req.user._id.toString();

  // Applicant can only withdraw; poster/admin can change all statuses
  if (isApplicant && status !== 'withdrawn') throw ApiError.forbidden('Applicants can only withdraw applications');
  if (!isApplicant && !isPoster && req.user.role !== 'admin') throw ApiError.forbidden('Not authorized');

  application.status = status;
  if (note) application.statusHistory.push({ status, changedAt: new Date(), note });
  await application.save();

  // Notify applicant
  await notifyStatusChange(application.user, application, application.internship.title);
  await sendStatusUpdate(req.user.email, req.user.name, application.internship.title, status);

  return ApiResponse.success(res, { application }, 'Status updated');
});

/**
 * @desc    Add note to application
 * @route   POST /api/v1/applications/:id/notes
 * @access  Protected (owner only)
 */
const addNote = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw ApiError.notFound('Application not found');

  if (application.user.toString() !== req.user._id.toString()) throw ApiError.forbidden('Not authorized');

  application.notes.push({ content: req.body.content });
  await application.save();

  return ApiResponse.success(res, { notes: application.notes }, 'Note added');
});

/**
 * @desc    Delete a note from application
 * @route   DELETE /api/v1/applications/:id/notes/:noteId
 * @access  Protected (owner only)
 */
const deleteNote = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw ApiError.notFound('Application not found');
  if (application.user.toString() !== req.user._id.toString()) throw ApiError.forbidden('Not authorized');

  application.notes = application.notes.filter((n) => n._id.toString() !== req.params.noteId);
  await application.save();

  return ApiResponse.success(res, { notes: application.notes }, 'Note deleted');
});

/**
 * @desc    Withdraw application
 * @route   DELETE /api/v1/applications/:id
 * @access  Protected (owner)
 */
const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw ApiError.notFound('Application not found');
  if (application.user.toString() !== req.user._id.toString()) throw ApiError.forbidden('Not authorized');
  if (['offer', 'rejected'].includes(application.status)) throw ApiError.badRequest('Cannot withdraw a closed application');

  application.status = 'withdrawn';
  await application.save();

  return ApiResponse.success(res, null, 'Application withdrawn');
});

module.exports = {
  applyToInternship,
  getMyApplications,
  getApplication,
  updateStatus,
  addNote,
  deleteNote,
  withdrawApplication,
};
