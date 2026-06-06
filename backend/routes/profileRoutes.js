const express = require('express');
const router = express.Router();
const { getProfileAnalytics } = require('../controllers/profileController');
const protect = require('../middleware/authMiddleware');

/**
 * Profile Routes
 * Base path: /api/profile
 */

// Get profile analytics (protected)
router.get('/analytics', protect, getProfileAnalytics);

module.exports = router;
