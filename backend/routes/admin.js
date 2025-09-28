const express = require('express');
const { sequelize } = require('../config/database');
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
      User.count(),
      Project.count(),
      User.count({ where: { kycStatus: 'Pending' } }),
      Project.count({ where: { status: 'active' } }),
      Project.count({ where: { status: 'funded' } })
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
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      users,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
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
    const projects = await Project.findAll({
      where: { status: 'pending' },
      include: [{
        model: User,
        as: 'developer',
        attributes: ['name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(projects);
  } catch (error) {
    console.error('Get pending projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve project
router.put('/projects/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await project.update({ status: 'active' });

    const updatedProject = await Project.findByPk(project.id, {
      include: [{
        model: User,
        as: 'developer',
        attributes: ['name', 'email']
      }]
    });

    res.json({
      message: 'Project approved successfully',
      project: updatedProject
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
    
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const currentMetadata = project.metadata || {};
    await project.update({
      status: 'cancelled',
      metadata: { ...currentMetadata, rejectionReason: reason }
    });

    const updatedProject = await Project.findByPk(project.id, {
      include: [{
        model: User,
        as: 'developer',
        attributes: ['name', 'email']
      }]
    });

    res.json({
      message: 'Project rejected successfully',
      project: updatedProject
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
      User.findAll({
        where: { kycStatus: 'Pending' },
        attributes: ['name', 'email', 'userType', 'createdAt']
      }),
      User.findAll({
        where: { kycStatus: 'Verified' },
        attributes: ['name', 'email', 'userType', 'createdAt']
      }),
      User.findAll({
        where: { kycStatus: 'Rejected' },
        attributes: ['name', 'email', 'userType', 'createdAt']
      })
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

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ kycStatus });

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
      sequelize.query(
        'SELECT user_type, COUNT(*) as count FROM users GROUP BY user_type',
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        'SELECT status, COUNT(*) as count FROM projects GROUP BY status',
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        'SELECT kyc_status, COUNT(*) as count FROM users GROUP BY kyc_status',
        { type: sequelize.QueryTypes.SELECT }
      )
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