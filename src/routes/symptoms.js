const express = require('express');
const router = express.Router();
const llmProviders = require('../llm/providers');
const { saveQuery, getHistory } = require('../database');

router.post('/symptoms', async (req, res) => {
  try {
    const { symptoms, sessionId } = req.body;

    if (!symptoms || symptoms.trim().length === 0) {
      return res.status(400).json({
        error: 'Symptoms are required'
      });
    }

    if (symptoms.length > 1000) {
      return res.status(400).json({
        error: 'Symptoms description too long (max 1000 characters)'
      });
    }

    console.log('🔍 Analyzing symptoms with Gemini:', symptoms.substring(0, 100) + '...');

    const analysis = await llmProviders.analyzeSymptoms(symptoms);
    await saveQuery(symptoms, analysis, 'gemini', sessionId);

    const response = {
      ...analysis,
      timestamp: new Date().toISOString(),
      provider: 'gemini',
      safetyNotice: '⚠️ This is educational information only. Always consult healthcare professionals for medical advice.'
    };

    res.json(response);

  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    
    res.status(500).json({
      error: 'Failed to analyze symptoms',
      message: error.message,
      safetyNotice: '⚠️ Please consult a healthcare professional directly.'
    });
  }
});

router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = await getHistory(limit);
    
    res.json({
      history,
      count: history.length
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      error: 'Failed to fetch history'
    });
  }
});

router.get('/providers', (req, res) => {
  const providers = process.env.GOOGLE_API_KEY ? ['gemini'] : [];
  res.json({ providers });
});

module.exports = router;