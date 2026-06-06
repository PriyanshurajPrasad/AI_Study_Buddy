const express = require('express');
const router = express.Router();
const { saveQuizResult, getProgressStats, getTestHistory, getSubjectStatistics } = require('../controllers/progressController');
const protect = require('../middleware/authMiddleware');

/**
 * Progress Routes
 * Base path: /api/progress
 */

// Save quiz result (protected)
router.post('/save-result', protect, saveQuizResult);

// Get user progress statistics (protected)
router.get('/stats', protect, getProgressStats);

// Get user test history (protected)
router.get('/history', protect, getTestHistory);

// Get user subject statistics (protected)
router.get('/subject-statistics', protect, getSubjectStatistics);

module.exports = router;
