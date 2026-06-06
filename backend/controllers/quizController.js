const Quiz = require('../models/Quiz');
const Note = require('../models/Note');
const User = require('../models/User');
const QuizResult = require('../models/QuizResult');
const { generateQuizFromText } = require('../services/quizAIService');
const { generateQuizFromTopic } = require('../services/topicQuizService');

/**
 * @desc    Create a new quiz
 * @route   POST /api/quiz/create
 * @access  Private
 */
const createQuiz = async (req, res, next) => {
  try {
    const { noteId, questions } = req.body;

    if (!noteId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide note ID and questions array',
      });
    }

    // Validate note belongs to user
    const note = await Note.findOne({ _id: noteId, userId: req.user.id });
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found',
      });
    }

    // Create quiz
    const quiz = await Quiz.create({
      userId: req.user.id,
      noteId,
      title: `Quiz for ${note.title}`,
      questions,
      totalQuestions: questions.length,
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: {
        quiz: {
          id: quiz._id,
          noteId: quiz.noteId,
          title: quiz.title,
          questions: quiz.questions,
          totalQuestions: quiz.totalQuestions,
          createdAt: quiz.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate quiz from note using AI
 * @route   POST /api/quiz/generate/:noteId
 * @access  Private
 */
const generateQuizFromNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    // Validate note belongs to user
    const note = await Note.findOne({ _id: noteId, userId: req.user.id });
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if note has extracted text
    if (!note.extractedText || note.extractedText.trim().length < 1000) {
      return res.status(400).json({
        success: false,
        message: 'PDF text extraction failed. Please upload a readable PDF.'
      });
    }

    let quizData;
    let generatedCount = 0;
    let cleanTextLength = 0;
    let chunksCount = 0;
    let rawAIResponse = "";
    let parseError = null;
    let validationErrors = [];
    
    // Generate quiz using AI - NO FALLBACK
    try {
      quizData = await generateQuizFromText(note.extractedText, note.title);
      generatedCount = quizData?.questions?.length || 0;
      cleanTextLength = note.extractedText.replace(/\s+/g, " ").trim().length;
      // Estimate chunks (6000 chars per chunk)
      chunksCount = Math.ceil(Math.min(cleanTextLength, 18000) / 6000);
    } catch (aiError) {
      cleanTextLength = note.extractedText.replace(/\s+/g, " ").trim().length;
      chunksCount = Math.ceil(Math.min(cleanTextLength, 18000) / 6000);
      parseError = aiError;

      const debugData = {
        noteId,
        noteFound: !!note,
        extractedTextLength: note?.extractedText?.length || 0,
        cleanTextLength,
        chunksCount,
        rawAIResponsePreview: rawAIResponse.slice(0, 1000),
        parseError: parseError?.message,
        generatedCount,
        validCount: 0,
        validationErrors
      };

      return res.status(422).json({
        success: false,
        message: "Quiz generation failed",
        debug: debugData
      });
    }

    // Validate questions before creating quiz
    if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      const debugData = {
        noteId,
        noteFound: !!note,
        extractedTextLength: note?.extractedText?.length || 0,
        cleanTextLength,
        chunksCount,
        rawAIResponsePreview: rawAIResponse.slice(0, 1000),
        parseError: "No questions in AI response",
        generatedCount,
        validCount: 0,
        validationErrors
      };

      return res.status(422).json({
        success: false,
        message: 'AI could not generate valid quiz JSON. Please try again.',
        debug: debugData
      });
    }

    // Validate each question meets quality standards
    const invalidQuestions = quizData.questions.filter((q, index) => {
      // Check for placeholder questions
      if (q.question && q.question.toLowerCase().startsWith('question')) {
        return true;
      }
      
      // Check question length
      if (!q.question || q.question.length < 20) {
        return true;
      }

      // Check options - support both array and object formats
      let optionsArray;
      if (Array.isArray(q.options)) {
        optionsArray = q.options;
      } else if (typeof q.options === 'object' && q.options !== null) {
        optionsArray = Object.values(q.options);
      } else {
        return true;
      }

      if (!optionsArray || optionsArray.length !== 4) {
        return true;
      }

      // Check each option length (allow short math options like "20", "40 km/h", "x = 5")
      const hasInvalidOptions = optionsArray.some(opt => !opt || opt.trim().length < 2);
      if (hasInvalidOptions) {
        return true;
      }

      // Check correct answer
      if (!q.correctAnswer || !['A', 'B', 'C', 'D'].includes(q.correctAnswer.toUpperCase())) {
        return true;
      }

      // Check explanation
      if (!q.explanation || q.explanation.length < 5) {
        return true;
      }

      return false;
    });

    const validCount = quizData.questions.length - invalidQuestions.length;

    // If all questions are invalid, return 422
    if (validCount === 0) {
      const debugData = {
        noteId,
        noteFound: !!note,
        extractedTextLength: note?.extractedText?.length || 0,
        cleanTextLength,
        chunksCount,
        rawAIResponsePreview: rawAIResponse.slice(0, 1000),
        parseError: parseError?.message,
        generatedCount,
        validCount,
        validationErrors
      };

      return res.status(422).json({
        success: false,
        message: "AI could not generate valid quiz JSON. Please try again.",
        debug: debugData
      });
    }

    // Only fail if we have NO valid questions at all
    if (validCount === 0) {
      const debugData = {
        noteId,
        noteFound: !!note,
        extractedTextLength: note?.extractedText?.length || 0,
        cleanTextLength,
        chunksCount,
        rawAIResponsePreview: rawAIResponse.slice(0, 1000),
        parseError: parseError?.message,
        generatedCount,
        validCount,
        validationErrors
      };

      return res.status(422).json({
        success: false,
        message: "AI could not generate valid questions from this PDF.",
        debug: debugData
      });
    }

    // Filter to only valid questions
    const validQuestions = quizData.questions.filter((q, index) => !invalidQuestions.includes(index));

    // Convert object format options to array format for database
    const questionsWithArrayOptions = validQuestions.map(q => ({
      ...q,
      options: typeof q.options === 'object' && q.options !== null 
        ? Object.values(q.options) 
        : q.options
    }));

    // Create quiz in database
    const quiz = await Quiz.create({
      userId: req.user.id,
      noteId,
      title: quizData.title,
      questions: questionsWithArrayOptions,
      totalQuestions: quizData.totalQuestions,
    });

    // Validate created quiz has questions
    if (!quiz.questions || quiz.questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Quiz created but questions are missing from database',
      });
    }

    // Convert array options to object format for response
    const questionsWithObjectOptions = quiz.questions.map(q => ({
      ...q,
      options: {
        A: q.options[0],
        B: q.options[1], 
        C: q.options[2],
        D: q.options[3]
      }
    }));

    return res.status(200).json({
      success: true,
      message: `Quiz generated successfully with ${quiz.questions.length} questions.`,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        noteId: quiz.noteId,
        questions: questionsWithObjectOptions,
        totalQuestions: quiz.questions.length
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate quiz. Please try again.',
    });
  }
};

/**
 * @desc    Submit quiz answers and calculate score
 * @route   POST /api/quiz/submit
 * @access  Private
 */
const submitQuiz = async (req, res, next) => {
  try {
    const { quizId, answers } = req.body;

    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide quiz ID and answers array',
      });
    }

    // Find quiz
    const quiz = await Quiz.findOne({ _id: quizId, userId: req.user.id });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Calculate score
    let correctCount = 0;
    const results = quiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctCount++;
      
      return {
        question: question.question,
        options: question.options,
        userAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        isCorrect,
      };
    });

    const score = correctCount;

    // Update quiz with score
    quiz.score = score;
    await quiz.save();

    // Update user's quizzes attempted count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { quizzesAttempted: 1 },
    });

    // Save complete quiz result with questions
    const quizResult = await QuizResult.create({
      userId: req.user.id,
      quizId: quiz._id,
      subject: quiz.subject || 'General',
      topic: quiz.topic || quiz.title || 'Quiz',
      title: quiz.title,
      score,
      totalQuestions: quiz.totalQuestions,
      correctAnswers: correctCount,
      wrongAnswers: quiz.totalQuestions - correctCount,
      percentage: ((score / quiz.totalQuestions) * 100),
      answers,
      questions: results,
      completedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        resultId: quizResult._id,
        score,
        totalQuestions: quiz.totalQuestions,
        percentage: ((score / quiz.totalQuestions) * 100).toFixed(2),
        results,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get quiz history for a user
 * @route   GET /api/quiz/history
 * @access  Private
 */
const getQuizHistory = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user.id })
      .populate('noteId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: {
        quizzes: quizzes.map((quiz) => ({
          id: quiz._id,
          noteTitle: quiz.noteId?.title || quiz.subject || 'Unknown',
          score: quiz.score || 0,
          totalQuestions: quiz.totalQuestions,
          percentage: quiz.totalQuestions > 0 
            ? ((quiz.score || 0) / quiz.totalQuestions * 100).toFixed(2)
            : '0.00',
          createdAt: quiz.createdAt,
        })),
      },
    });
  } catch (error) {
    // Return safe fallback instead of error
    res.status(200).json({
      success: true,
      count: 0,
      data: {
        quizzes: [],
      },
    });
  }
};

/**
 * @desc    Generate quiz from subject and topic using AI
 * @route   POST /api/quiz/generate-topic
 * @access  Private
 */
const generateQuizFromTopicController = async (req, res, next) => {
  try {
    const { subject, topic, questionCount, difficulty = 'Mixed' } = req.body;

    // Validate required fields
    if (!subject || !topic || !questionCount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject, topic, and question count'
      });
    }

    // Validate question count
    if (questionCount < 1 || questionCount > 50) {
      return res.status(400).json({
        success: false,
        message: 'Question count must be between 1 and 50'
      });
    }

    // Generate quiz using AI
    let quizData;
    let generatedCount = 0;
    let parseError = null;
    let validationErrors = [];
    
    try {
      quizData = await generateQuizFromTopic(subject, topic, questionCount, difficulty);
      generatedCount = quizData?.questions?.length || 0;
    } catch (aiError) {
      parseError = aiError;

      return res.status(422).json({
        success: false,
        message: "Quiz generation failed",
        debug: {
          parseError: parseError?.message,
          generatedCount,
          validationErrors
        }
      });
    }

    // Validate questions before creating quiz
    if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      return res.status(422).json({
        success: false,
        message: 'AI could not generate valid quiz JSON. Please try again.',
        debug: {
          parseError: "No questions in AI response",
          generatedCount,
          validCount: 0,
          validationErrors
        }
      });
    }

    // Validate each question meets quality standards
    const invalidQuestions = quizData.questions.filter((q, index) => {
      // Check for placeholder questions
      if (q.question && q.question.toLowerCase().startsWith('question')) {
        return true;
      }
      
      // Check question length
      if (!q.question || q.question.length < 20) {
        return true;
      }

      // Check options - support both array and object formats
      let optionsArray;
      if (Array.isArray(q.options)) {
        optionsArray = q.options;
      } else if (typeof q.options === 'object' && q.options !== null) {
        optionsArray = Object.values(q.options);
      } else {
        return true;
      }

      if (!optionsArray || optionsArray.length !== 4) {
        return true;
      }

      // Check each option length (allow short math options like "20", "40 km/h", "x = 5")
      const hasInvalidOptions = optionsArray.some(opt => !opt || opt.trim().length < 2);
      if (hasInvalidOptions) {
        return true;
      }

      // Check correct answer
      if (!q.correctAnswer || !['A', 'B', 'C', 'D'].includes(q.correctAnswer.toUpperCase())) {
        return true;
      }

      // Check explanation
      if (!q.explanation || q.explanation.length < 5) {
        return true;
      }

      return false;
    });

    const validCount = quizData.questions.length - invalidQuestions.length;

    // Only fail if we have NO valid questions at all
    if (validCount === 0) {
      return res.status(422).json({
        success: false,
        message: "AI could not generate valid questions from this topic.",
        debug: {
          parseError: parseError?.message,
          generatedCount,
          validCount,
          validationErrors
        }
      });
    }

    // Filter to only valid questions
    const validQuestions = quizData.questions.filter((q, index) => !invalidQuestions.includes(index));

    // Convert object format options to array format for database
    const questionsWithArrayOptions = validQuestions.map(q => ({
      ...q,
      options: typeof q.options === 'object' && q.options !== null 
        ? Object.values(q.options) 
        : q.options
    }));

    // Create quiz in database
    const quiz = await Quiz.create({
      userId: req.user.id,
      noteId: null, // Topic-based quizzes don't require a note
      subject,
      topic,
      title: quizData.title,
      questions: questionsWithArrayOptions,
      totalQuestions: validQuestions.length,
    });

    // Validate created quiz has questions
    if (!quiz.questions || quiz.questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Quiz created but questions are missing from database',
      });
    }

    // Convert array options to object format for response
    const questionsWithObjectOptions = quiz.questions.map(q => ({
      ...q,
      options: {
        A: q.options[0],
        B: q.options[1], 
        C: q.options[2],
        D: q.options[3]
      }
    }));

    return res.status(200).json({
      success: true,
      message: `Quiz generated successfully with ${quiz.questions.length} questions.`,
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        topic: quiz.topic,
        questions: questionsWithObjectOptions,
        totalQuestions: quiz.questions.length
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate quiz. Please try again.',
    });
  }
};

/**
 * @desc    Get a specific quiz result by ID
 * @route   GET /api/quiz/results/:resultId
 * @access  Private
 */
const getQuizResultById = async (req, res, next) => {
  try {
    const { resultId } = req.params;

    const quizResult = await QuizResult.findOne({
      _id: resultId,
      userId: req.user.id,
    });

    if (!quizResult) {
      return res.status(404).json({
        success: false,
        message: 'Quiz result not found',
      });
    }

    res.status(200).json({
      success: true,
      result: {
        _id: quizResult._id,
        quizId: quizResult.quizId,
        title: quizResult.title,
        subject: quizResult.subject,
        topic: quizResult.topic,
        totalQuestions: quizResult.totalQuestions,
        correctAnswers: quizResult.correctAnswers,
        wrongAnswers: quizResult.wrongAnswers,
        scorePercentage: quizResult.scorePercentage,
        questions: quizResult.questions,
        selectedAnswers: quizResult.selectedAnswers,
        createdAt: quizResult.createdAt,
        updatedAt: quizResult.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz result',
    });
  }
};

module.exports = {
  createQuiz,
  generateQuizFromNote,
  generateQuizFromTopicController,
  submitQuiz,
  getQuizHistory,
  getQuizResultById,
};
