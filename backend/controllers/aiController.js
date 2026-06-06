const Note = require('../models/Note');
const { generateSummary, generateExplanation, generateQuiz, generateViva, askQuestion } = require('../services/groqService');

/**
 * @desc    Summarize notes using AI
 * @route   POST /api/ai/summarize
 * @access  Private
 */
const summarizeNotes = async (req, res) => {
  try {
    const { noteId } = req.body;

    if (!noteId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide note ID',
      });
    }

    const note = await Note.findOne({ _id: noteId, userId: req.user.id });
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    const summary = await generateSummary(note.extractedText);

    // Update note with summary
    note.summary = summary;
    await note.save();

    res.status(200).json({
      success: true,
      message: 'Summary generated successfully',
      data: {
        summary,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Explain a concept using AI
 * @route   POST /api/ai/explain
 * @access  Private
 */
const explainConcept = async (req, res) => {
  try {
    // Support multiple field names from frontend
    const { concept, prompt, question, text, language } = req.body;
    
    // Use first available field
    const contentToExplain = concept || prompt || question || text;
    const selectedLanguage = language || 'english';

    if (!contentToExplain) {
      return res.status(400).json({
        success: false,
        message: 'Concept is required',
      });
    }

    const explanation = await generateExplanation(contentToExplain, selectedLanguage);

    res.status(200).json({
      success: true,
      message: 'Explanation generated successfully',
      data: {
        explanation,
      },
    });
  } catch (error) {
    // In development, return 200 with fallback message to avoid frontend crash
    if (process.env.NODE_ENV === 'development') {
      res.status(200).json({
        success: true,
        message: 'Explanation generated successfully',
        data: {
          explanation: 'AI service is currently unavailable. Please check GROQ_API_KEY in backend/.env file and try again. (Development fallback - this would be a 500 error in production)',
        },
      });
    } else {
      // In production, return proper error status
      res.status(500).json({
        success: false,
        message: 'AI explanation failed',
        error: error.message || 'Server error. Please try again later.'
      });
    }
  }
};

/**
 * @desc    Generate MCQ quiz from notes
 * @route   POST /api/ai/generate-quiz
 * @access  Private
 */
const generateQuizFromNotes = async (req, res) => {
  try {
    const { noteId } = req.body;

    if (!noteId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide note ID',
      });
    }

    const note = await Note.findOne({ _id: noteId, userId: req.user.id });
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    const quiz = await generateQuiz(note.extractedText);

    res.status(200).json({
      success: true,
      message: 'Quiz generated successfully',
      data: {
        quiz,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Generate viva questions from notes
 * @route   POST /api/ai/generate-viva
 * @access  Private
 */
const generateVivaQuestions = async (req, res) => {
  try {
    const { noteId } = req.body;

    if (!noteId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide note ID',
      });
    }

    const note = await Note.findOne({ _id: noteId, userId: req.user.id });
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    const vivaQuestions = await generateViva(note.extractedText);

    res.status(200).json({
      success: true,
      message: 'Viva questions generated successfully',
      data: {
        vivaQuestions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Ask a study doubt/question
 * @route   POST /api/ai/ask
 * @access  Private
 */
const askDoubt = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question',
      });
    }

    const answer = await askQuestion(question);

    res.status(200).json({
      success: true,
      message: 'Answer generated successfully',
      data: {
        answer,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  summarizeNotes,
  explainConcept,
  generateQuizFromNotes,
  generateVivaQuestions,
  askDoubt,
};
