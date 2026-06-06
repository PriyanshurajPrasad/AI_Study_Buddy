const express = require('express');
const router = express.Router();
const { uploadNote, getAllNotes, getNoteById, deleteNote } = require('../controllers/noteController');
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

/**
 * Notes Routes
 * Base path: /api/notes
 */

// Upload a new note (protected, with file upload)
router.post('/upload', protect, upload.single('file'), uploadNote);

// Get all notes for the user (protected) - both routes work
router.get('/', protect, getAllNotes);
router.get('/all', protect, getAllNotes);

// Get a single note by ID (protected)
router.get('/:id', protect, getNoteById);

// Delete a note (protected)
router.delete('/:id', protect, deleteNote);

module.exports = router;
