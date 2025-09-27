const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const developerMiddleware = (req, res, next) => {
  if (!['developer', 'admin'].includes(req.user.userType)) {
    return res.status(403).json({ error: 'Developer access required' });
  }
  next();
};

const investorMiddleware = (req, res, next) => {
  if (!['investor', 'admin'].includes(req.user.userType)) {
    return res.status(403).json({ error: 'Investor access required' });
  }
  next();
};

const kycVerifiedMiddleware = (req, res, next) => {
  if (req.user.kycStatus !== 'Verified') {
    return res.status(403).json({ 
      error: 'KYC verification required',
      kycStatus: req.user.kycStatus 
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  developerMiddleware,
  investorMiddleware,
  kycVerifiedMiddleware
};
