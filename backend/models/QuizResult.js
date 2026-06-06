const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  subject: {
    type: String,
    default: "General"
  },
  topic: {
    type: String,
    default: "Untitled Topic"
  },
  title: {
    type: String,
    default: "Untitled Quiz"
  },
  questions: {
    type: Array,
    default: []
  },
  selectedAnswers: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  wrongAnswers: {
    type: Number,
    default: 0
  },
  scorePercentage: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("QuizResult", quizResultSchema);
