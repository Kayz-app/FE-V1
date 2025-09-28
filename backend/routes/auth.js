const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, userType } = req.body;

    // Validation
    if (!email || !password || !name || !userType) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['investor', 'developer'].includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      userType,
      walletNgn: 0,
      walletUsdt: 0,
      walletUsdc: 0
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        kycStatus: user.kycStatus,
        wallet: {
          ngn: user.walletNgn,
          usdt: user.walletUsdt,
          usdc: user.walletUsdc
        },
        companyProfile: {
          name: user.companyName,
          regNumber: user.companyRegNumber,
          address: user.companyAddress,
          website: user.companyWebsite
        },
        treasuryAddress: user.treasuryAddress,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        userType: req.user.userType,
        kycStatus: req.user.kycStatus,
        wallet: {
          ngn: req.user.walletNgn,
          usdt: req.user.walletUsdt,
          usdc: req.user.walletUsdc
        },
        companyProfile: {
          name: req.user.companyName,
          regNumber: req.user.companyRegNumber,
          address: req.user.companyAddress,
          website: req.user.companyWebsite
        },
        treasuryAddress: req.user.treasuryAddress,
        twoFactorEnabled: req.user.twoFactorEnabled,
        walletAddress: req.user.walletAddress
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, companyProfile, treasuryAddress, walletAddress } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (companyProfile) {
      updateData.companyName = companyProfile.name;
      updateData.companyRegNumber = companyProfile.regNumber;
      updateData.companyAddress = companyProfile.address;
      updateData.companyWebsite = companyProfile.website;
    }
    if (treasuryAddress) updateData.treasuryAddress = treasuryAddress;
    if (walletAddress) updateData.walletAddress = walletAddress;

    const user = await req.user.update(updateData);

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout (client-side token removal)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;