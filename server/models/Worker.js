const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, maxlength: 500, default: '' },
  services: [{ type: String }],
  jobRate: { type: Number, default: 0 },
  experience: { type: Number, default: 0 },
  portfolio: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  idDocument: { type: String, default: '' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  totalJobs: { type: Number, default: 0 },
  location: {
    district: { type: String, default: '' },
    city: { type: String, default: 'Tashkent' },
  },
  availability: [
    {
      day: { type: String },
      slots: [{ type: String }],
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Worker', workerSchema);
