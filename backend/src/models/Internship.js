const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    locationType: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      default: 'onsite',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    skillsRequired: {
      type: [String],
      required: [true, 'At least one skill is required'],
      validate: [(arr) => arr.length > 0, 'At least one skill is required'],
    },
    stipend: {
      amount: { type: Number, min: 0 },
      currency: { type: String, default: 'INR' },
      isPaid: { type: Boolean, default: true },
    },
    duration: {
      type: String,
      trim: true, // e.g. "3 months", "6 weeks"
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    openings: {
      type: Number,
      default: 1,
      min: 1,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
  },
  { timestamps: true }
);

// ─── Indexes for search & filtering ──────────────────────────────────────────
internshipSchema.index({ title: 'text', company: 'text', description: 'text' });
internshipSchema.index({ location: 1 });
internshipSchema.index({ skillsRequired: 1 });
internshipSchema.index({ deadline: 1 });
internshipSchema.index({ isActive: 1 });
internshipSchema.index({ postedBy: 1 });
internshipSchema.index({ tags: 1 });

const Internship = mongoose.model('Internship', internshipSchema);
module.exports = Internship;
