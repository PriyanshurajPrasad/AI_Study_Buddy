const express = require('express');
const router = express.Router();
const { createQuiz, generateQuizFromNote, submitQuiz, getQuizHistory, getQuizResultById } = require('../controllers/quizController');
const { generateTopicQuiz, submitTopicQuiz } = require('../controllers/topicQuizController');
const protect = require('../middleware/authMiddleware');

/**
 * Quiz Routes
 * Base path: /api/quiz
 */

// Create a new quiz (protected)
router.post('/create', protect, createQuiz);

// Generate quiz from note using AI (protected)
router.post('/generate/:noteId', protect, generateQuizFromNote);

// Generate quiz from subject and topic using AI (protected)
router.post('/generate-topic', protect, generateTopicQuiz);

// Submit quiz answers (protected)
router.post('/submit', protect, submitQuiz);

// Submit topic quiz answers (protected)
router.post('/submit-topic', protect, submitTopicQuiz);

// Get quiz history (protected)
router.get('/history', protect, getQuizHistory);

// Get quiz result by ID (protected)
router.get('/results/:resultId', protect, getQuizResultById);

module.exports = router;
