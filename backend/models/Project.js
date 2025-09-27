const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  tokenTicker: {
    type: String,
    required: true,
    uppercase: true,
    maxlength: 3
  },
  tokenSupply: {
    type: Number,
    required: true,
    min: 1
  },
  developerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  developerName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  fundingGoal: {
    type: Number,
    required: true,
    min: 1
  },
  amountRaised: {
    type: Number,
    default: 0
  },
  apy: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  term: {
    type: Number,
    required: true,
    min: 1
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: String,
  images: [String],
  status: {
    type: String,
    enum: ['pending', 'active', 'funded', 'completed', 'cancelled'],
    default: 'pending'
  },
  projectWalletBalance: {
    type: Number,
    default: 0
  },
  completionDate: Date,
  fundsWithdrawn: {
    type: Boolean,
    default: false
  },
  contractAddress: {
    type: String,
    unique: true,
    sparse: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', projectSchema);
