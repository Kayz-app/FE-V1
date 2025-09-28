const express = require('express');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const Project = require('../models/Project');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get user's portfolio
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      where: { userId: req.user.id },
      include: [{
        model: Project,
        as: 'project',
        attributes: ['id', 'title', 'tokenTicker', 'apy', 'status']
      }]
    });

    if (!portfolio) {
      // Create empty portfolio if none exists
      const newPortfolio = await Portfolio.create({
        userId: req.user.id,
        tokens: [],
        totalValue: 0
      });
      return res.json(newPortfolio);
    }

    res.json(portfolio);
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get portfolio by user ID (admin only)
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin or requesting their own portfolio
    if (req.user.userType !== 'admin' && req.user.id !== req.params.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const portfolio = await Portfolio.findOne({
      where: { userId: req.params.userId },
      include: [{
        model: Project,
        as: 'project',
        attributes: ['id', 'title', 'tokenTicker', 'apy', 'status']
      }]
    });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    res.json(portfolio);
  } catch (error) {
    console.error('Get portfolio by user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update portfolio (add/remove tokens)
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { tokens, totalValue } = req.body;

    const portfolio = await Portfolio.findOne({
      where: { userId: req.user.id }
    });

    if (!portfolio) {
      // Create new portfolio
      const newPortfolio = await Portfolio.create({
        userId: req.user.id,
        tokens: tokens || [],
        totalValue: totalValue || 0
      });
      return res.json(newPortfolio);
    }

    // Update existing portfolio
    await portfolio.update({
      tokens: tokens || portfolio.tokens,
      totalValue: totalValue || portfolio.totalValue
    });

    res.json(portfolio);
  } catch (error) {
    console.error('Update portfolio error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add token to portfolio
router.post('/me/tokens', authMiddleware, async (req, res) => {
  try {
    const { tokenId, projectId, type, amount, originalOwnerId, lastApyClaimDate } = req.body;

    const portfolio = await Portfolio.findOne({
      where: { userId: req.user.id }
    });

    if (!portfolio) {
      // Create new portfolio
      const newPortfolio = await Portfolio.create({
        userId: req.user.id,
        tokens: [{
          tokenId,
          projectId,
          type,
          amount,
          originalOwnerId,
          lastApyClaimDate
        }],
        totalValue: 0
      });
      return res.json(newPortfolio);
    }

    // Add token to existing portfolio
    const currentTokens = portfolio.tokens || [];
    const newToken = {
      tokenId,
      projectId,
      type,
      amount,
      originalOwnerId,
      lastApyClaimDate
    };

    currentTokens.push(newToken);
    await portfolio.update({ tokens: currentTokens });

    res.json(portfolio);
  } catch (error) {
    console.error('Add token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove token from portfolio
router.delete('/me/tokens/:tokenId', authMiddleware, async (req, res) => {
  try {
    const { tokenId } = req.params;

    const portfolio = await Portfolio.findOne({
      where: { userId: req.user.id }
    });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    // Remove token from portfolio
    const currentTokens = portfolio.tokens || [];
    const updatedTokens = currentTokens.filter(token => token.tokenId !== tokenId);
    
    await portfolio.update({ tokens: updatedTokens });

    res.json(portfolio);
  } catch (error) {
    console.error('Remove token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all portfolios (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const portfolios = await Portfolio.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'userType']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(portfolios);
  } catch (error) {
    console.error('Get all portfolios error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
