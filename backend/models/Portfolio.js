const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tokens: [{
    tokenId: {
      type: String,
      required: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    type: {
      type: String,
      enum: ['SECURITY', 'MARKET'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    originalOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['held', 'listed', 'sold'],
      default: 'held'
    },
    lastApyClaimDate: Date,
    purchasePrice: Number,
    purchaseDate: {
      type: Date,
      default: Date.now
    }
  }],
  totalValue: {
    type: Number,
    default: 0
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
portfolioSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
