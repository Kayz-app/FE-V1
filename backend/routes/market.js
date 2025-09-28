const express = require('express');
const MarketListing = require('../models/MarketListing');
const User = require('../models/User');
const Project = require('../models/Project');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all market listings
router.get('/', async (req, res) => {
  try {
    const listings = await MarketListing.findAll({
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'tokenTicker', 'apy', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(listings);
  } catch (error) {
    console.error('Get market listings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get market listing by ID
router.get('/:id', async (req, res) => {
  try {
    const listing = await MarketListing.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'tokenTicker', 'apy', 'status']
        }
      ]
    });

    if (!listing) {
      return res.status(404).json({ error: 'Market listing not found' });
    }

    res.json(listing);
  } catch (error) {
    console.error('Get market listing error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create market listing
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tokenId, projectId, amount, price } = req.body;

    // Validation
    if (!tokenId || !projectId || !amount || !price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Generate unique listing ID
    const listingId = `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const listing = await MarketListing.create({
      listingId,
      tokenId,
      sellerId: req.user.id,
      projectId,
      amount,
      price,
      status: 'active'
    });

    const listingWithDetails = await MarketListing.findByPk(listing.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'tokenTicker', 'apy', 'status']
        }
      ]
    });

    res.status(201).json(listingWithDetails);
  } catch (error) {
    console.error('Create market listing error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update market listing
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { amount, price, status } = req.body;

    const listing = await MarketListing.findByPk(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: 'Market listing not found' });
    }

    // Check if user owns the listing
    if (listing.sellerId !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await listing.update({
      amount: amount || listing.amount,
      price: price || listing.price,
      status: status || listing.status
    });

    const updatedListing = await MarketListing.findByPk(listing.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'tokenTicker', 'apy', 'status']
        }
      ]
    });

    res.json(updatedListing);
  } catch (error) {
    console.error('Update market listing error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Buy token from market
router.post('/:id/buy', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    const listing = await MarketListing.findByPk(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: 'Market listing not found' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ error: 'Listing is not active' });
    }

    if (listing.sellerId === req.user.id) {
      return res.status(400).json({ error: 'Cannot buy your own listing' });
    }

    if (amount > listing.amount) {
      return res.status(400).json({ error: 'Insufficient tokens available' });
    }

    // Update listing
    const remainingAmount = listing.amount - amount;
    const newStatus = remainingAmount === 0 ? 'sold' : 'active';

    await listing.update({
      amount: remainingAmount,
      status: newStatus,
      buyerId: req.user.id,
      soldAt: new Date()
    });

    // TODO: Update portfolios (remove from seller, add to buyer)
    // This would require portfolio management logic

    const updatedListing = await MarketListing.findByPk(listing.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'tokenTicker', 'apy', 'status']
        }
      ]
    });

    res.json({
      message: 'Token purchase successful',
      listing: updatedListing,
      purchasedAmount: amount
    });
  } catch (error) {
    console.error('Buy token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete market listing
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const listing = await MarketListing.findByPk(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: 'Market listing not found' });
    }

    // Check if user owns the listing or is admin
    if (listing.sellerId !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await listing.destroy();

    res.json({ message: 'Market listing deleted successfully' });
  } catch (error) {
    console.error('Delete market listing error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's market listings
router.get('/user/me', authMiddleware, async (req, res) => {
  try {
    const listings = await MarketListing.findAll({
      where: { sellerId: req.user.id },
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'title', 'tokenTicker', 'apy', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(listings);
  } catch (error) {
    console.error('Get user market listings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
