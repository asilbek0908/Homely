const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['customer', 'worker', 'admin'], default: 'customer' },
  avatar: { type: String, default: '' },
  location: {
    district: { type: String, default: '' },
    city: { type: String, default: 'Tashkent' },
  },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, default: '' },
  emailVerificationExpires: { type: Date },
  resetPasswordToken: { type: String, default: '' },
  resetPasswordExpires: { type: Date },
  telegramChatId: { type: String, default: '' },
  savedWorkers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Worker' }],
  createdAt: { type: Date, default: Date.now },
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
