const QuizResult = require('../models/QuizResult');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

/**
 * Save quiz result to database
 * POST /api/progress/save-result
 */
const saveQuizResult = async (req, res, next) => {
  try {
    const { quizId, subject, topic, score, totalQuestions, correctAnswers, wrongAnswers, percentage, answers } = req.body;

    console.log('=== SAVING QUIZ RESULT TO MONGODB ===');
    console.log('User ID:', req.user.id);
    console.log('User Email:', req.user.email);
    console.log('Quiz Data:', { quizId, subject, topic, score, totalQuestions, percentage });

    // Validate required fields
    if (!quizId || !subject || !topic || score === undefined || !totalQuestions) {
      return res.status(400).json({
        success: false,
        message: 'Missing required quiz result data'
      });
    }

    // Save quiz result
    const quizResult = await QuizResult.create({
      userId: req.user.id,
      quizId,
      subject,
      topic,
      score,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      percentage,
      answers: answers || [],
    });

    console.log('✅ Quiz Result saved successfully to MongoDB');
    console.log('   Result ID:', quizResult._id);
    console.log('   User ID:', quizResult.userId);
    console.log('   Subject:', quizResult.subject);
    console.log('   Topic:', quizResult.topic);
    console.log('   Percentage:', quizResult.percentage + '%');

    return res.status(201).json({
      success: true,
      message: 'Quiz result saved successfully',
      result: quizResult
    });
  } catch (error) {
    console.error('Error saving quiz result:', error);
    next(error);
  }
};

/**
 * Get user progress statistics
 * GET /api/progress/stats
 */
const getProgressStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    console.log('=== FETCHING PROGRESS STATS FROM MONGODB ===');
    console.log('User ID:', req.user.id);
    console.log('User Email:', req.user.email);

    // Get all quiz results for this user
    const allResults = await QuizResult.find({ userId }).sort({ createdAt: -1 });

    console.log('✅ Quiz results fetched successfully from MongoDB');
    console.log('   Total Results:', allResults.length);
    console.log('   User ID:', userId);

    if (allResults.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          totalQuizzes: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          averageScore: 0,
          bestScore: 0,
          learningStreak: 0,
          completedTopics: [],
          recentResults: [],
          weeklyPerformance: [],
          topicPerformance: []
        }
      });
    }

    // Calculate basic stats
    const totalQuizzes = allResults.length;
    const totalQuestions = allResults.reduce((acc, r) => acc + r.totalQuestions, 0);
    const totalCorrect = allResults.reduce((acc, r) => acc + r.correctAnswers, 0);
    const averageScore = totalQuestions > 0 ? (totalCorrect / totalQuestions * 100).toFixed(2) : 0;
    const bestScore = Math.max(...allResults.map(r => r.scorePercentage), 0);

    // Calculate learning streak (consecutive days with quiz attempts)
    const learningStreak = calculateLearningStreak(allResults);

    // Calculate completed topics/subjects
    const completedTopicsData = calculateCompletedTopics(allResults);
    const completedTopics = completedTopicsData.topics; // Return only topics as array

    // Get all results (not just last 5) for complete history
    const recentResults = allResults.map(r => ({
      _id: r._id,
      quizId: r.quizId,
      subject: r.subject,
      topic: r.topic,
      title: r.title,
      scorePercentage: r.scorePercentage,
      totalQuestions: r.totalQuestions,
      correctAnswers: r.correctAnswers,
      wrongAnswers: r.wrongAnswers,
      createdAt: r.createdAt,
      createdAtFormatted: formatDate(r.createdAt),
      questions: r.questions,
      selectedAnswers: r.selectedAnswers
    }));

    // Calculate weekly performance (last 7 days)
    const weeklyPerformance = calculateWeeklyPerformance(allResults);

    // Calculate topic-wise performance
    const topicPerformance = calculateTopicPerformance(allResults);

    return res.status(200).json({
      success: true,
      stats: {
        totalQuizzes,
        totalQuestions,
        totalCorrect,
        averageScore: parseFloat(averageScore),
        bestScore,
        learningStreak,
        completedTopics,
        recentResults,
        weeklyPerformance,
        topicPerformance
      }
    });
  } catch (error) {
    console.error('Error getting progress stats:', error);
    next(error);
  }
};

// Helper function to calculate learning streak
const calculateLearningStreak = (results) => {
  if (results.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = today;

  // Sort results by date descending
  const sortedResults = results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Check for each day going backwards
  for (let i = 0; i < 30; i++) {
    const dayStart = new Date(currentDate);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const hasQuizOnDay = sortedResults.some(r => {
      const completedDate = new Date(r.createdAt);
      return completedDate >= dayStart && completedDate <= dayEnd;
    });

    if (hasQuizOnDay) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (i === 0) {
      // Check if today has no quiz, check yesterday
      currentDate.setDate(currentDate.getDate() - 1);
      continue;
    } else {
      break;
    }
  }

  return streak;
};

// Helper function to calculate completed topics
const calculateCompletedTopics = (results) => {
  const topicSet = new Set();
  const subjectSet = new Set();

  results.forEach(r => {
    if (r.topic) topicSet.add(r.topic);
    if (r.subject) subjectSet.add(r.subject);
  });

  return {
    topics: Array.from(topicSet),
    subjects: Array.from(subjectSet),
    totalTopics: topicSet.size,
    totalSubjects: subjectSet.size
  };
};

// Helper function to calculate weekly performance
const calculateWeeklyPerformance = (results) => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayResults = results.filter(r => {
      const completedDate = new Date(r.createdAt);
      return completedDate >= dayStart && completedDate <= dayEnd;
    });

    const dayPercentage = dayResults.length > 0
      ? dayResults.reduce((acc, r) => acc + r.scorePercentage, 0) / dayResults.length
      : 0;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = dayNames[date.getDay()];

    days.push({
      day: dayName,
      date: date.toISOString().split('T')[0],
      averageScore: parseFloat(dayPercentage.toFixed(2)),
      quizzes: dayResults.length
    });
  }

  return days;
};

// Helper function to calculate topic performance
const calculateTopicPerformance = (results) => {
  const topicStats = {};

  results.forEach(r => {
    const key = `${r.subject}/${r.topic}`;
    if (!topicStats[key]) {
      topicStats[key] = {
        subject: r.subject,
        topic: r.topic,
        attempts: 0,
        totalPercentage: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        scores: []
      };
    }
    topicStats[key].attempts++;
    topicStats[key].scores.push(r.scorePercentage);
    topicStats[key].totalPercentage += r.scorePercentage;
    topicStats[key].totalQuestions += r.totalQuestions;
    topicStats[key].correctAnswers += r.correctAnswers;
  });

  return Object.values(topicStats).map(topic => ({
    subject: topic.subject,
    topic: topic.topic,
    attempts: topic.attempts,
    averageScore: parseFloat((topic.totalPercentage / topic.attempts).toFixed(2)),
    bestScore: Math.max(...topic.scores),
    totalQuestions: topic.totalQuestions,
    correctAnswers: topic.correctAnswers
  })).sort((a, b) => b.attempts - a.attempts);
};

/**
 * Get user's complete test history
 * GET /api/progress/history
 */
const getTestHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    console.log('=== FETCHING TEST HISTORY FROM MONGODB ===');
    console.log('User ID:', req.user.id);

    // Get all quiz results for this user
    const allResults = await QuizResult.find({ userId }).sort({ createdAt: -1 });

    console.log('✅ Test history fetched successfully from MongoDB');
    console.log('   Total Results:', allResults.length);

    return res.status(200).json({
      success: true,
      results: allResults
    });
  } catch (error) {
    console.error('Error fetching test history:', error);
    next(error);
  }
};

// Helper function to format date
const formatDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

/**
 * Get user's subject statistics with detailed breakdown
 * GET /api/progress/subject-statistics
 */
const getSubjectStatistics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    console.log('=== FETCHING SUBJECT STATISTICS FROM MONGODB ===');
    console.log('User ID:', req.user.id);

    // Get all quiz results for this user
    const allResults = await QuizResult.find({ userId }).sort({ createdAt: -1 });

    console.log('✅ Quiz results fetched successfully from MongoDB');
    console.log('   Total Results:', allResults.length);

    if (allResults.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          totalSubjects: 0,
          totalTopics: 0,
          averageScore: 0,
          bestTopic: null,
          subjects: []
        }
      });
    }

    // Group by subject
    const subjectStats = {};
    const allTopics = new Set();
    let totalScoreSum = 0;
    let bestTopicInfo = { topic: '', score: -1 };

    allResults.forEach(r => {
      const subject = r.subject || 'General';
      const topic = r.topic || 'General';

      if (!subjectStats[subject]) {
        subjectStats[subject] = {
          subject: subject,
          attempts: 0,
          totalPercentage: 0,
          scores: [],
          topics: {}
        };
      }

      if (!subjectStats[subject].topics[topic]) {
        subjectStats[subject].topics[topic] = {
          topic: topic,
          attempts: 0,
          totalPercentage: 0,
          scores: [],
          totalQuestions: 0,
          correctAnswers: 0
        };
      }

      subjectStats[subject].attempts++;
      subjectStats[subject].scores.push(r.scorePercentage);
      subjectStats[subject].totalPercentage += r.scorePercentage;

      subjectStats[subject].topics[topic].attempts++;
      subjectStats[subject].topics[topic].scores.push(r.scorePercentage);
      subjectStats[subject].topics[topic].totalPercentage += r.scorePercentage;
      subjectStats[subject].topics[topic].totalQuestions += r.totalQuestions || 0;
      subjectStats[subject].topics[topic].correctAnswers += r.correctAnswers || 0;

      allTopics.add(topic);
      totalScoreSum += r.scorePercentage;

      if (r.scorePercentage > bestTopicInfo.score) {
        bestTopicInfo = { topic: topic, score: r.scorePercentage };
      }
    });

    // Process subjects
    const subjects = Object.values(subjectStats).map(subject => {
      const topicsData = Object.values(subject.topics).map(topic => ({
        topic: topic.topic,
        attempts: topic.attempts,
        averageScore: parseFloat((topic.totalPercentage / topic.attempts).toFixed(2)),
        bestScore: Math.max(...topic.scores),
        totalQuestions: topic.totalQuestions,
        correctAnswers: topic.correctAnswers
      })).sort((a, b) => b.attempts - a.attempts);

      return {
        subject: subject.subject,
        attempts: subject.attempts,
        averageScore: parseFloat((subject.totalPercentage / subject.attempts).toFixed(2)),
        bestScore: Math.max(...subject.scores),
        topics: topicsData
      };
    }).sort((a, b) => b.attempts - a.attempts);

    const stats = {
      totalSubjects: subjects.length,
      totalTopics: allTopics.size,
      averageScore: parseFloat((totalScoreSum / allResults.length).toFixed(2)),
      bestTopic: bestTopicInfo.topic,
      subjects: subjects
    };

    console.log('✅ Subject statistics calculated successfully');
    console.log('   Total Subjects:', stats.totalSubjects);
    console.log('   Total Topics:', stats.totalTopics);

    return res.status(200).json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error fetching subject statistics:', error);
    next(error);
  }
};

module.exports = {
  saveQuizResult,
  getProgressStats,
  getTestHistory,
  getSubjectStatistics
};
