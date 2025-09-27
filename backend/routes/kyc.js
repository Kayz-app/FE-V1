const express = require('express');
const KycDocument = require('../models/KycDocument');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Upload KYC document
router.post('/upload', authMiddleware, upload.single('document'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { documentType } = req.body;
    
    if (!documentType) {
      return res.status(400).json({ error: 'Document type is required' });
    }

    const allowedTypes = ['passport', 'drivers_license', 'national_id', 'utility_bill', 'bank_statement', 'company_registration'];
    if (!allowedTypes.includes(documentType)) {
      return res.status(400).json({ error: 'Invalid document type' });
    }

    const kycDocument = new KycDocument({
      userId: req.user._id,
      documentType,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

    await kycDocument.save();

    // Update user KYC status to pending if not already verified
    if (req.user.kycStatus === 'Not Submitted') {
      await User.findByIdAndUpdate(req.user._id, { kycStatus: 'Pending' });
    }

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: kycDocument._id,
        documentType: kycDocument.documentType,
        fileName: kycDocument.fileName,
        status: kycDocument.status,
        uploadedAt: kycDocument.uploadedAt
      }
    });
  } catch (error) {
    console.error('Upload KYC document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's KYC documents
router.get('/documents', authMiddleware, async (req, res) => {
  try {
    const documents = await KycDocument.find({ userId: req.user._id }).sort({ uploadedAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error('Get KYC documents error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get KYC status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('kycStatus');
    res.json({ kycStatus: user.kycStatus });
  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all pending KYC documents (admin only)
router.get('/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const documents = await KycDocument.find({ status: 'pending' })
      .populate('userId', 'name email userType')
      .sort({ uploadedAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error('Get pending KYC documents error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve KYC document (admin only)
router.put('/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const document = await KycDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    document.status = 'approved';
    document.reviewedBy = req.user._id;
    document.reviewedAt = new Date();
    await document.save();

    // Check if all documents are approved and update user status
    const userDocuments = await KycDocument.find({ userId: document.userId });
    const allApproved = userDocuments.every(doc => doc.status === 'approved');
    
    if (allApproved) {
      await User.findByIdAndUpdate(document.userId, { kycStatus: 'Verified' });
    }

    res.json({
      message: 'Document approved successfully',
      document
    });
  } catch (error) {
    console.error('Approve KYC document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject KYC document (admin only)
router.put('/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    const document = await KycDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    document.status = 'rejected';
    document.rejectionReason = rejectionReason;
    document.reviewedBy = req.user._id;
    document.reviewedAt = new Date();
    await document.save();

    // Update user KYC status to rejected
    await User.findByIdAndUpdate(document.userId, { kycStatus: 'Rejected' });

    res.json({
      message: 'Document rejected successfully',
      document
    });
  } catch (error) {
    console.error('Reject KYC document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get KYC document by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const document = await KycDocument.findById(req.params.id).populate('userId', 'name email');
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user can access this document
    if (document.userId._id.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to access this document' });
    }

    res.json(document);
  } catch (error) {
    console.error('Get KYC document error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
