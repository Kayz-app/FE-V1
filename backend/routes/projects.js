const express = require('express');
const Project = require('../models/Project');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const { authMiddleware, adminMiddleware, developerMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [{
        model: User,
        as: 'developer',
        attributes: ['name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'developer',
        attributes: ['name', 'email']
      }]
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create project (developers only)
router.post('/', authMiddleware, developerMiddleware, async (req, res) => {
  try {
    const {
      title,
      tokenTicker,
      tokenSupply,
      location,
      fundingGoal,
      apy,
      term,
      description,
      imageUrl,
      images,
      contractAddress
    } = req.body;

    // Validation
    if (!title || !tokenTicker || !tokenSupply || !location || !fundingGoal || !apy || !term || !description) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const project = await Project.create({
      title,
      tokenTicker: tokenTicker.toUpperCase(),
      tokenSupply,
      developerId: req.user.id,
      developerName: req.user.name,
      location,
      fundingGoal,
      apy,
      term,
      description,
      imageUrl,
      images: images || [],
      contractAddress,
      status: 'pending'
    });

    const projectWithDeveloper = await Project.findByPk(project.id, {
      include: [{
        model: User,
        as: 'developer',
        attributes: ['name', 'email']
      }]
    });

    res.status(201).json({
      message: 'Project created successfully',
      project: projectWithDeveloper
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update project (developer or admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user can update (developer owns project or is admin)
    if (project.developerId !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this project' });
    }

    const updateData = req.body;
    await project.update(updateData);

    const updatedProject = await Project.findByPk(project.id, {
      include: [{
        model: User,
        as: 'developer',
        attributes: ['name', 'email']
      }]
    });

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update project status (admin only)
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'active', 'funded', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await project.update({ status });

    const updatedProject = await Project.findByPk(project.id, {
      include: [{
        model: User,
        as: 'developer',
        attributes: ['name', 'email']
      }]
    });

    res.json({
      message: 'Project status updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Update project status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's portfolio
router.get('/portfolio/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user can access this portfolio
    if (req.user.id !== userId && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to access this portfolio' });
    }

    const portfolio = await Portfolio.findOne({ 
      where: { userId },
      include: [{
        model: Project,
        as: 'project',
        required: false
      }]
    });
    
    res.json(portfolio || { tokens: [] });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add token to portfolio
router.post('/portfolio', authMiddleware, async (req, res) => {
  try {
    const { tokenId, projectId, type, amount, purchasePrice } = req.body;

    if (!tokenId || !projectId || !type || !amount) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    let portfolio = await Portfolio.findOne({ where: { userId: req.user.id } });
    
    if (!portfolio) {
      portfolio = await Portfolio.create({
        userId: req.user.id,
        tokens: []
      });
    }

    const token = {
      tokenId,
      projectId,
      type,
      amount,
      originalOwnerId: req.user.id,
      ownerId: req.user.id,
      purchasePrice,
      purchaseDate: new Date()
    };

    const updatedTokens = [...portfolio.tokens, token];
    await portfolio.update({ tokens: updatedTokens });

    res.status(201).json({
      message: 'Token added to portfolio successfully',
      portfolio
    });
  } catch (error) {
    console.error('Add token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;