const express = require('express');
const router = express.Router();
const { saveAIHistory, getAIHistory, deleteAIHistory, clearAIHistory } = require('../controllers/aiHistoryController');
const protect = require('../middleware/authMiddleware');

/**
 * AI History Routes
 * Base path: /api/ai-history
 */

// Save AI history (protected)
router.post('/', protect, saveAIHistory);

// Get all AI history (protected)
router.get('/', protect, getAIHistory);

// Delete single AI history entry (protected)
router.delete('/:id', protect, deleteAIHistory);

// Clear all AI history (protected)
router.delete('/', protect, clearAIHistory);

module.exports = router;
