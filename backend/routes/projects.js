const express = require('express');
const Project = require('../models/Project');
const Portfolio = require('../models/Portfolio');
const { authMiddleware, adminMiddleware, developerMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().populate('developerId', 'name email').sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('developerId', 'name email');
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

    const project = new Project({
      title,
      tokenTicker: tokenTicker.toUpperCase(),
      tokenSupply,
      developerId: req.user._id,
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

    await project.save();
    await project.populate('developerId', 'name email');

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update project (developer or admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user can update (developer owns project or is admin)
    if (project.developerId.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this project' });
    }

    const updateData = req.body;
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('developerId', 'name email');

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

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('developerId', 'name email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: 'Project status updated successfully',
      project
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
    if (req.user._id.toString() !== userId && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to access this portfolio' });
    }

    const portfolio = await Portfolio.findOne({ userId }).populate('tokens.projectId');
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

    let portfolio = await Portfolio.findOne({ userId: req.user._id });
    
    if (!portfolio) {
      portfolio = new Portfolio({
        userId: req.user._id,
        tokens: []
      });
    }

    const token = {
      tokenId,
      projectId,
      type,
      amount,
      originalOwnerId: req.user._id,
      ownerId: req.user._id,
      purchasePrice,
      purchaseDate: new Date()
    };

    portfolio.tokens.push(token);
    await portfolio.save();

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
