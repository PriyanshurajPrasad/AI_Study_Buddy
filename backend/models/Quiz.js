const mongoose = require('mongoose');

/**
 * Quiz Schema
 * Stores quiz questions and user scores
 */
const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    required: false, // Made optional for topic-based quizzes
  },
  subject: {
    type: String,
    required: false, // For topic-based quizzes
  },
  topic: {
    type: String,
    required: false, // For topic-based quizzes
  },
  title: {
    type: String,
    required: true,
  },
  questions: {
    type: [
      {
        question: {
          type: String,
          required: true,
        },
        options: {
          type: Object, // Changed back to object for {A, B, C, D} format
          required: true,
          validate: {
            validator: function(v) {
              return v && v.A && v.B && v.C && v.D;
            },
            message: 'Options must have A, B, C, D keys'
          }
        },
        correctAnswer: {
          type: String,
          required: true,
        },
        explanation: {
          type: String,
          required: true,
        },
        difficulty: {
          type: String,
          enum: ['Easy', 'Medium', 'Hard', 'Mixed'],
          default: 'Mixed'
        }
      },
    ],
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Quiz', quizSchema);
