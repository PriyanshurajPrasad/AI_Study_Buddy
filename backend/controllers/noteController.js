const Note = require('../models/Note');
const { extractTextFromFile } = require('../services/pdfService');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Upload a new note (PDF, DOCX, or TXT)
 * @route   POST /api/notes/upload
 * @access  Private
 */
const uploadNote = async (req, res, next) => {
  try {
    const { title } = req.body;

    // Validate input
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a title for the note',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    // Determine file type
    const fileExt = req.file.originalname.split('.').pop().toLowerCase();
    const fileTypeMap = {
      'pdf': 'pdf',
      'docx': 'docx',
      'txt': 'txt'
    };
    const fileType = fileTypeMap[fileExt] || 'txt';

    // Extract text from file using the service
    let extractedText;
    try {
      extractedText = await extractTextFromFile(req.file.path, req.file.mimetype, req.file.originalname);
    } catch (error) {
      // Clean up file if text extraction fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: error.message || 'Could not extract text from this file',
      });
    }

    // Create note in database
    const note = await Note.create({
      userId: req.user.id,
      title,
      originalFileName: req.file.originalname,
      fileType,
      filePath: req.file.path,
      extractedText,
    });

    res.status(201).json({
      success: true,
      message: 'Note uploaded successfully',
      data: {
        note: {
          id: note._id,
          title: note.title,
          originalFileName: note.originalFileName,
          fileType: note.fileType,
          summary: note.summary,
          createdAt: note.createdAt,
        },
      },
    });
  } catch (error) {
    // Clean up file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * @desc    Get all notes for a user
 * @route   GET /api/notes/all
 * @access  Private
 */
const getAllNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: {
        notes: notes.map((note) => ({
          id: note._id,
          title: note.title,
          originalFileName: note.originalFileName,
          summary: note.summary,
          createdAt: note.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single note by ID
 * @route   GET /api/notes/:id
 * @access  Private
 */
const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        note: {
          id: note._id,
          title: note.title,
          originalFileName: note.originalFileName,
          extractedText: note.extractedText,
          summary: note.summary,
          createdAt: note.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a note
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadNote,
  getAllNotes,
  getNoteById,
  deleteNote,
};
