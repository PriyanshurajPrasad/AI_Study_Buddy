const QuizResult = require('../models/QuizResult');

/**
 * Get profile analytics for logged-in user
 * GET /api/profile/analytics
 */
const getProfileAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all quiz results for this user
    const results = await QuizResult.find({ userId }).sort({ createdAt: -1 });

    // Initialize default analytics structure
    const analytics = {
      weeklyPerformance: [
        { day: "Mon", score: 0 },
        { day: "Tue", score: 0 },
        { day: "Wed", score: 0 },
        { day: "Thu", score: 0 },
        { day: "Fri", score: 0 },
        { day: "Sat", score: 0 },
        { day: "Sun", score: 0 }
      ],
      topicProgress: [],
      quizPerformance: []
    };

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        analytics
      });
    }

    // Calculate weekly performance
    const dayMap = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };
    const dayScores = {};

    results.forEach(result => {
      const date = new Date(result.createdAt);
      const day = dayMap[date.getDay()];
      
      if (!dayScores[day]) {
        dayScores[day] = { total: 0, count: 0 };
      }
      dayScores[day].total += result.scorePercentage;
      dayScores[day].count += 1;
    });

    analytics.weeklyPerformance = Object.keys(dayMap).map(dayNum => {
      const day = dayMap[dayNum];
      const scores = dayScores[day];
      const averageScore = scores ? Math.round(scores.total / scores.count) : 0;
      return { day, score: averageScore };
    });

    // Calculate topic progress (group by topic)
    const topicMap = {};
    results.forEach(result => {
      const topic = result.topic || "General";
      if (!topicMap[topic]) {
        topicMap[topic] = { total: 0, count: 0 };
      }
      topicMap[topic].total += result.scorePercentage;
      topicMap[topic].count += 1;
    });

    analytics.topicProgress = Object.entries(topicMap).map(([topic, data]) => ({
      topic,
      attempts: data.count,
      averageScore: Math.round(data.total / data.count)
    }));

    // Calculate quiz performance (top 4 topics by most attempted)
    const topicPerformance = Object.entries(topicMap)
      .map(([topic, data]) => ({
        topic,
        attempts: data.count,
        averageScore: Math.round(data.total / data.count)
      }))
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 4);

    analytics.quizPerformance = topicPerformance;

    return res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch profile analytics"
    });
  }
};

module.exports = {
  getProfileAnalytics
};
