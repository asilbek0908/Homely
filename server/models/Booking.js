const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  service: { type: String, required: true },
  description: { type: String, default: '' },
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },
  address: { type: String, required: true },
  district: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'inProgress', 'completed', 'cancelled'],
    default: 'pending',
  },
  price: { type: Number, default: 0 },
  paymentMethod: {
    type: String,
    enum: ['cash', 'click', 'payme'],
    default: 'cash',
  },
  commission: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);
