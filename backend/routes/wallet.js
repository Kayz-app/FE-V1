const express = require('express');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get wallet balance
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('wallet');
    res.json({ balance: user.wallet });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update wallet balance
router.put('/balance', authMiddleware, async (req, res) => {
  try {
    const { ngn, usdt, usdc } = req.body;
    
    const updateData = {};
    if (typeof ngn === 'number') updateData['wallet.ngn'] = ngn;
    if (typeof usdt === 'number') updateData['wallet.usdt'] = usdt;
    if (typeof usdc === 'number') updateData['wallet.usdc'] = usdc;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('wallet');

    res.json({
      message: 'Wallet balance updated successfully',
      balance: user.wallet
    });
  } catch (error) {
    console.error('Update wallet balance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get exchange rates (mock data)
router.get('/exchange-rates', async (req, res) => {
  try {
    // In a real application, this would fetch from a financial API
    const rates = {
      USD_TO_NGN: 1500,
      NGN_TO_USD: 0.00067,
      USDT_TO_NGN: 1500,
      USDC_TO_NGN: 1500,
      lastUpdated: new Date().toISOString()
    };

    res.json(rates);
  } catch (error) {
    console.error('Get exchange rates error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Simulate deposit
router.post('/deposit', authMiddleware, async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    if (!amount || !currency) {
      return res.status(400).json({ error: 'Amount and currency are required' });
    }

    if (!['ngn', 'usdt', 'usdc'].includes(currency.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid currency' });
    }

    const user = await User.findById(req.user._id);
    const currentBalance = user.wallet[currency.toLowerCase()] || 0;
    
    await User.findByIdAndUpdate(req.user._id, {
      [`wallet.${currency.toLowerCase()}`]: currentBalance + parseFloat(amount)
    });

    res.json({
      message: 'Deposit successful',
      amount: parseFloat(amount),
      currency: currency.toLowerCase(),
      newBalance: currentBalance + parseFloat(amount)
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Simulate withdrawal
router.post('/withdraw', authMiddleware, async (req, res) => {
  try {
    const { amount, currency, address } = req.body;
    
    if (!amount || !currency || !address) {
      return res.status(400).json({ error: 'Amount, currency, and address are required' });
    }

    if (!['ngn', 'usdt', 'usdc'].includes(currency.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid currency' });
    }

    const user = await User.findById(req.user._id);
    const currentBalance = user.wallet[currency.toLowerCase()] || 0;
    
    if (currentBalance < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      [`wallet.${currency.toLowerCase()}`]: currentBalance - parseFloat(amount)
    });

    res.json({
      message: 'Withdrawal successful',
      amount: parseFloat(amount),
      currency: currency.toLowerCase(),
      address,
      newBalance: currentBalance - parseFloat(amount)
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
