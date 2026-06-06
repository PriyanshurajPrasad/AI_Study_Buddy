const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const { generateQuizFromTopic } = require('../services/groqQuizService');

/**
 * Generate quiz from subject and topic using AI
 * POST /api/quiz/generate-topic
 */
const generateTopicQuiz = async (req, res) => {
  try {
    const { subject, topic, numberOfQuestions, difficulty = 'Mixed' } = req.body;

    // Validate required fields
    if (!subject || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject and topic'
      });
    }

    // Validate numberOfQuestions
    const validQuestionCounts = [5, 10, 15, 20, 30];
    const questionCount = numberOfQuestions || 10;
    if (!validQuestionCounts.includes(questionCount)) {
      return res.status(400).json({
        success: false,
        message: 'Question count must be 5, 10, 15, 20, or 30'
      });
    }

    // Validate difficulty
    const validDifficulties = ['Easy', 'Medium', 'Hard', 'Mixed'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Difficulty must be Easy, Medium, Hard, or Mixed'
      });
    }

    // Generate quiz using AI
    const quizData = await generateQuizFromTopic(subject, topic, questionCount, difficulty);

    // Validate we have questions
    if (!quizData.questions || quizData.questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'AI could not generate valid questions. Please try again.'
      });
    }

    // Create quiz in database (without noteId for topic-based quizzes)
    const quiz = await Quiz.create({
      userId: req.user.id,
      noteId: null,
      subject,
      topic,
      title: quizData.title,
      questions: quizData.questions,
      totalQuestions: quizData.questions.length,
    });

    return res.status(200).json({
      success: true,
      message: 'Quiz generated successfully',
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        topic: quiz.topic,
        questions: quiz.questions,
        totalQuestions: quiz.questions.length
      }
    });

  } catch (error) {
    // Return real error message from Groq API if available
    const errorMessage = error.response?.data?.error?.message ||
                         error.response?.data?.message ||
                         error.message ||
                         'Failed to generate quiz. Please try again.';

    return res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

const submitTopicQuiz = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not found"
      });
    }

    const {
      quizId = null,
      subject = "General",
      topic = "Untitled Topic",
      title = "Untitled Quiz",
      questions = [],
      selectedAnswers = {},
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      scorePercentage
    } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions array is required"
      });
    }

    const total = Number(totalQuestions) || questions.length;
    const correct = Number(correctAnswers) || 0;
    const wrong = Number(wrongAnswers) || total - correct;
    const score = Number(scorePercentage) || Math.round((correct / total) * 100);

    const result = await QuizResult.create({
      userId,
      quizId,
      subject,
      topic,
      title,
      questions,
      selectedAnswers,
      totalQuestions: total,
      correctAnswers: correct,
      wrongAnswers: wrong,
      scorePercentage: score
    });

    return res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      result
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      name: error.name
    });
  }
};

module.exports = {
  generateTopicQuiz,
  submitTopicQuiz,
};
