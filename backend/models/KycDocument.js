const mongoose = require('mongoose');

const kycDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    enum: ['passport', 'drivers_license', 'national_id', 'utility_bill', 'bank_statement', 'company_registration'],
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: Number,
  mimeType: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('KycDocument', kycDocumentSchema);
