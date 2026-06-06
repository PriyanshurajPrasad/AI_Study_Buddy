const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

/**
 * Authentication Routes
 * Base path: /api/auth
 */

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get user profile (protected)
router.get('/profile', protect, getProfile);

module.exports = router;
