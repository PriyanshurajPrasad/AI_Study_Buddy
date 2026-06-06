const mongoose = require('mongoose');

/**
 * Note Schema
 * Stores uploaded study notes and PDFs with extracted text
 */
const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  originalFileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'docx', 'txt'],
  },
  filePath: {
    type: String,
    required: true,
  },
  extractedText: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Note', noteSchema);
