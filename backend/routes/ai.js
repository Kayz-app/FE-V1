const express = require('express');
const OpenAI = require('openai');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Initialize OpenAI (only if API key is available)
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// AI Chat endpoint
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!openai) {
      return res.status(503).json({ error: 'OpenAI API key not configured' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;

    res.json({
      choices: [{
        message: {
          content: response
        }
      }]
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({ error: 'OpenAI API quota exceeded' });
    }
    
    if (error.code === 'invalid_api_key') {
      return res.status(401).json({ error: 'Invalid OpenAI API key' });
    }

    res.status(500).json({ 
      error: 'AI service error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Generate project description
router.post('/generate-description', authMiddleware, async (req, res) => {
  try {
    const { projectTitle, location, fundingGoal, apy, term } = req.body;

    if (!projectTitle || !location || !fundingGoal || !apy || !term) {
      return res.status(400).json({ error: 'All project fields are required' });
    }

    if (!openai) {
      return res.status(503).json({ error: 'OpenAI API key not configured' });
    }

    const prompt = `Generate a compelling and professional real estate project description based on the following key details. The tone should be enticing to potential investors on a real estate crowdfunding platform.

- Project Title: ${projectTitle}
- Location: ${location}
- Funding Goal: $${fundingGoal}
- Target APY: ${apy}%
- Investment Term: ${term} months

Highlight the key selling points and investment potential. Keep it to one or two paragraphs.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that helps with real estate due diligence and investment analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const description = completion.choices[0].message.content;

    res.json({
      description
    });
  } catch (error) {
    console.error('Generate description error:', error);
    res.status(500).json({ 
      error: 'AI service error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Health check for AI service
router.get('/health', async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ 
        status: 'unavailable',
        message: 'OpenAI API key not configured' 
      });
    }

    res.json({ 
      status: 'available',
      message: 'AI service is ready' 
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unavailable',
      message: 'AI service error' 
    });
  }
});

module.exports = router;
