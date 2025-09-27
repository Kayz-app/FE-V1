const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  userType: {
    type: String,
    enum: ['investor', 'developer', 'admin'],
    required: true
  },
  wallet: {
    ngn: { type: Number, default: 0 },
    usdt: { type: Number, default: 0 },
    usdc: { type: Number, default: 0 }
  },
  kycStatus: {
    type: String,
    enum: ['Not Submitted', 'Pending', 'Verified', 'Rejected'],
    default: 'Not Submitted'
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  companyProfile: {
    name: String,
    regNumber: String,
    address: String,
    website: String
  },
  treasuryAddress: String,
  walletAddress: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
