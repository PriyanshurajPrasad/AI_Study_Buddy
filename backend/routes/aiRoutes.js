const express = require('express');
const router = express.Router();
const {
  summarizeNotes,
  explainConcept,
  generateQuizFromNotes,
  generateVivaQuestions,
  askDoubt,
} = require('../controllers/aiController');
const protect = require('../middleware/authMiddleware');

/**
 * AI Routes
 * Base path: /api/ai
 */

// Summarize notes (protected)
router.post('/summarize', protect, summarizeNotes);

// Explain a concept in Hinglish (protected)
router.post('/explain', protect, explainConcept);

// Generate MCQ quiz from notes (protected)
router.post('/generate-quiz', protect, generateQuizFromNotes);

// Generate viva questions from notes (protected)
router.post('/generate-viva', protect, generateVivaQuestions);

// Ask a study doubt/question (protected)
router.post('/ask', protect, askDoubt);

module.exports = router;
