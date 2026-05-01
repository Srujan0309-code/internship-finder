const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, maxlength: 1000 },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const matchResultSchema = new mongoose.Schema(
  {
    score: { type: Number, min: 0, max: 100 },
    missingSkills: [String],
    suggestions: [String],
    rawResponse: { type: String },
    matchedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: true,
    },
    status: {
      type: String,
      enum: ['applied', 'under_review', 'interview', 'rejected', 'offer', 'withdrawn'],
      default: 'applied',
    },
    coverLetter: {
      type: String,
      maxlength: 3000,
      default: '',
    },
    notes: [noteSchema],
    matchResult: matchResultSchema,
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

// ─── Prevent duplicate applications ──────────────────────────────────────────
applicationSchema.index({ user: 1, internship: 1 }, { unique: true });
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ internship: 1, status: 1 });
applicationSchema.index({ createdAt: -1 });

// ─── Track status changes automatically ──────────────────────────────────────
applicationSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({ status: this.status, changedAt: new Date() });
  }
  next();
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
