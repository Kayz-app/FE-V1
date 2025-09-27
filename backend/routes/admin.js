const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const KycDocument = require('../models/KycDocument');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get admin dashboard overview
router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [
      totalUsers,
      totalProjects,
      pendingKyc,
      activeProjects,
      fundedProjects
    ] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      User.countDocuments({ kycStatus: 'Pending' }),
      Project.countDocuments({ status: 'active' }),
      Project.countDocuments({ status: 'funded' })
    ]);

    res.json({
      overview: {
        totalUsers,
        totalProjects,
        pendingKyc,
        activeProjects,
        fundedProjects
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users with pagination
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({}, '-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending projects
router.get('/projects/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ status: 'pending' })
      .populate('developerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Get pending projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve project
router.put('/projects/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    ).populate('developerId', 'name email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: 'Project approved successfully',
      project
    });
  } catch (error) {
    console.error('Approve project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject project
router.put('/projects/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'cancelled',
        metadata: { ...req.body.metadata, rejectionReason: reason }
      },
      { new: true }
    ).populate('developerId', 'name email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: 'Project rejected successfully',
      project
    });
  } catch (error) {
    console.error('Reject project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get KYC compliance data
router.get('/compliance', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [
      pendingKycUsers,
      verifiedUsers,
      rejectedUsers
    ] = await Promise.all([
      User.find({ kycStatus: 'Pending' }).select('name email userType createdAt'),
      User.find({ kycStatus: 'Verified' }).select('name email userType createdAt'),
      User.find({ kycStatus: 'Rejected' }).select('name email userType createdAt')
    ]);

    res.json({
      pending: pendingKycUsers,
      verified: verifiedUsers,
      rejected: rejectedUsers
    });
  } catch (error) {
    console.error('Get compliance data error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user KYC status
router.put('/users/:id/kyc', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { kycStatus } = req.body;
    
    if (!['Not Submitted', 'Pending', 'Verified', 'Rejected'].includes(kycStatus)) {
      return res.status(400).json({ error: 'Invalid KYC status' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { kycStatus },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User KYC status updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user KYC status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get platform analytics
router.get('/analytics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [
      userStats,
      projectStats,
      kycStats
    ] = await Promise.all([
      User.aggregate([
        { $group: { _id: '$userType', count: { $sum: 1 } } }
      ]),
      Project.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $group: { _id: '$kycStatus', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      users: userStats,
      projects: projectStats,
      kyc: kycStats
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
