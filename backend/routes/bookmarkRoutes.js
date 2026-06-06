const express = require('express');
const router = express.Router();
const { uploadBookmark, getBookmarks, getBookmarkById, getBookmarkFile, deleteBookmark } = require('../controllers/bookmarkController');
const protect = require('../middleware/authMiddleware');

// Configure multer upload
const upload = require('../middleware/uploadMiddleware');

/**
 * Bookmark Routes
 * Base path: /api/bookmarks
 */

// Upload bookmark (protected)
router.post('/upload', protect, upload.single('file'), uploadBookmark);

// Get all bookmarks (protected)
router.get('/', protect, getBookmarks);

// Get single bookmark (protected)
router.get('/:id', protect, getBookmarkById);

// Get bookmark file (protected)
router.get('/file/:id', protect, getBookmarkFile);

// Delete bookmark (protected)
router.delete('/:id', protect, deleteBookmark);

module.exports = router;
