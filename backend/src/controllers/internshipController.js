const Internship = require('../models/Internship');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const paginate = require('../utils/paginate');

/**
 * @desc    Get all internships (with filters, search, pagination)
 * @route   GET /api/v1/internships
 * @access  Public
 */
const getInternships = asyncHandler(async (req, res) => {
  const {
    search,
    location,
    locationType,
    skills,
    company,
    isPaid,
    page = 1,
    limit = 10,
    sort = '-createdAt',
  } = req.query;

  const filter = { isActive: true };

  // Full-text search
  if (search) {
    filter.$text = { $search: search };
  }

  // Field filters
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (locationType) filter.locationType = locationType;
  if (company) filter.company = { $regex: company, $options: 'i' };
  if (isPaid !== undefined) filter['stipend.isPaid'] = isPaid === 'true';

  // Skills filter (comma-separated)
  if (skills) {
    const skillArr = skills.split(',').map((s) => s.trim());
    filter.skillsRequired = { $in: skillArr };
  }

  // Only show non-expired internships
  filter.deadline = { $gte: new Date() };

  const sortObj = {};
  sort.split(',').forEach((s) => {
    const dir = s.startsWith('-') ? -1 : 1;
    sortObj[s.replace('-', '')] = dir;
  });

  const { data, meta } = await paginate(Internship, filter, {
    page,
    limit,
    sort: sortObj,
    populate: { path: 'postedBy', select: 'name email' },
  });

  return ApiResponse.paginated(res, data, meta);
});

/**
 * @desc    Get single internship
 * @route   GET /api/v1/internships/:id
 * @access  Public
 */
const getInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id).populate('postedBy', 'name email');
  if (!internship) throw ApiError.notFound('Internship not found');
  return ApiResponse.success(res, { internship });
});

/**
 * @desc    Create internship
 * @route   POST /api/v1/internships
 * @access  Protected (user/admin)
 */
const createInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.create({ ...req.body, postedBy: req.user._id });
  return ApiResponse.created(res, { internship }, 'Internship created successfully');
});

/**
 * @desc    Update internship
 * @route   PUT /api/v1/internships/:id
 * @access  Protected (owner or admin)
 */
const updateInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) throw ApiError.notFound('Internship not found');

  const isOwner = internship.postedBy.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw ApiError.forbidden('Not authorized to update this internship');

  const updated = await Internship.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  return ApiResponse.success(res, { internship: updated }, 'Internship updated');
});

/**
 * @desc    Delete internship (soft delete)
 * @route   DELETE /api/v1/internships/:id
 * @access  Protected (owner or admin)
 */
const deleteInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) throw ApiError.notFound('Internship not found');

  const isOwner = internship.postedBy.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') throw ApiError.forbidden('Not authorized');

  internship.isActive = false;
  await internship.save();

  return ApiResponse.success(res, null, 'Internship removed');
});

/**
 * @desc    Get internships posted by the logged-in user
 * @route   GET /api/v1/internships/my
 * @access  Protected
 */
const getMyInternships = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { data, meta } = await paginate(Internship, { postedBy: req.user._id }, { page, limit });
  return ApiResponse.paginated(res, data, meta);
});

module.exports = {
  getInternships,
  getInternship,
  createInternship,
  updateInternship,
  deleteInternship,
  getMyInternships,
};
