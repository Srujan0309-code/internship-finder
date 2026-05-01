const Joi = require('joi');
const ApiError = require('../utils/ApiError');

/**
 * Returns an Express middleware that validates req.body against a Joi schema.
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message.replace(/"/g, "'"));
      return next(ApiError.badRequest('Validation error', messages));
    }

    req[property] = value; // replace with sanitized value
    next();
  };
};

// ─── Auth Schemas ─────────────────────────────────────────────────────────────
const schemas = {
  register: Joi.object({
    name: Joi.string().trim().min(2).max(60).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).max(128).required(),
    role: Joi.string().valid('user', 'admin').default('user'),
  }),

  login: Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    name: Joi.string().trim().min(2).max(60),
    profile: Joi.object({
      bio: Joi.string().max(500).allow(''),
      skills: Joi.array().items(Joi.string().trim()).max(30),
      location: Joi.string().trim().max(100).allow(''),
      linkedIn: Joi.string().uri().allow(''),
      github: Joi.string().uri().allow(''),
      portfolio: Joi.string().uri().allow(''),
    }),
  }),

  createInternship: Joi.object({
    title: Joi.string().trim().min(3).max(100).required(),
    company: Joi.string().trim().min(2).max(100).required(),
    location: Joi.string().trim().required(),
    locationType: Joi.string().valid('remote', 'onsite', 'hybrid').default('onsite'),
    description: Joi.string().min(20).max(5000).required(),
    skillsRequired: Joi.array().items(Joi.string().trim()).min(1).required(),
    stipend: Joi.object({
      amount: Joi.number().min(0),
      currency: Joi.string().default('INR'),
      isPaid: Joi.boolean().default(true),
    }),
    duration: Joi.string().trim().max(50).allow(''),
    deadline: Joi.date().greater('now').required(),
    openings: Joi.number().integer().min(1).default(1),
    tags: Joi.array().items(Joi.string().trim().lowercase()).max(10),
  }),

  updateInternship: Joi.object({
    title: Joi.string().trim().min(3).max(100),
    company: Joi.string().trim().min(2).max(100),
    location: Joi.string().trim(),
    locationType: Joi.string().valid('remote', 'onsite', 'hybrid'),
    description: Joi.string().min(20).max(5000),
    skillsRequired: Joi.array().items(Joi.string().trim()).min(1),
    stipend: Joi.object({
      amount: Joi.number().min(0),
      currency: Joi.string(),
      isPaid: Joi.boolean(),
    }),
    duration: Joi.string().trim().max(50).allow(''),
    deadline: Joi.date(),
    openings: Joi.number().integer().min(1),
    isActive: Joi.boolean(),
    tags: Joi.array().items(Joi.string().trim().lowercase()).max(10),
  }),

  applyInternship: Joi.object({
    coverLetter: Joi.string().max(3000).allow(''),
  }),

  updateApplicationStatus: Joi.object({
    status: Joi.string()
      .valid('applied', 'under_review', 'interview', 'rejected', 'offer', 'withdrawn')
      .required(),
    note: Joi.string().max(500).allow(''),
  }),

  addNote: Joi.object({
    content: Joi.string().min(1).max(1000).required(),
  }),

  resumeMatch: Joi.object({
    jobDescription: Joi.string().min(20).max(10000).required(),
    applicationId: Joi.string().optional(),
  }),
};

module.exports = { validate, schemas };
