import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProgress } from '../api/progress';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { FaFire, FaBook, FaTrophy, FaChartLine, FaCheckCircle, FaCrosshairs, FaBrain, FaMedal, FaBolt, FaRobot, FaCalendarAlt, FaStar, FaAward, FaLightbulb, FaChartBar, FaArrowUp, FaArrowDown, FaLock, FaEye, FaChevronRight } from 'react-icons/fa';
import { IoSparkles, IoTrendingUp, IoAnalytics, IoEye } from 'react-icons/io5';
import MainLayout from '../layouts/MainLayout';
import { getPercentageColor, getPercentageBgColor } from '../utils/helpers';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Progress = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Handle clicking on a quiz result
  const handleResultClick = (result) => {
    // Navigate to quiz result page with MongoDB ID
    const resultId = result._id || result.id;
    if (resultId) {
      navigate(`/quiz-result/${resultId}`);
    } else {
      console.error('Quiz result missing ID:', result);
      toast.error('Invalid quiz result');
    }
  };

  // Load progress data from MongoDB only
  const loadProgress = async () => {
    try {
      setLoading(true);
      console.log('Loading progress from MongoDB');
      
      const backendResponse = await getProgress();
      console.log('Progress API response:', backendResponse);
      
      if (backendResponse.success && backendResponse.stats) {
        setProgress(backendResponse.stats);
        console.log('Progress loaded successfully from MongoDB');
        console.log('   Stats keys:', Object.keys(backendResponse.stats));
        console.log('   Recent Results count:', backendResponse.stats.recentResults?.length || 0);
      } else {
        // Backend returned empty data
        console.log('No progress data found in MongoDB, showing empty stats');
        setProgress(getEmptyStats());
      }
    } catch (error) {
      console.error("Error loading progress from MongoDB:", error);
      setProgress(getEmptyStats());
    } finally {
      setLoading(false);
    }
  };

  // Empty stats for when no data exists
  const getEmptyStats = () => ({
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
  });

  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, []);

  // Format date helper
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

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader size="lg" text="Loading your progress..." />
        </div>
      </MainLayout>
    );
  }

  // Calculate stats from MongoDB data
  const averageScore = progress?.averageScore || 0;
  const bestScore = progress?.bestScore || 0;
  const learningStreak = progress?.learningStreak || 0;

  // Stats cards data
  const statCards = [
    {
      title: 'Total Quizzes',
      value: progress?.totalQuizzes || 0,
      icon: FaTrophy,
      bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
      borderColor: 'border-purple-200',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Average Score',
      value: `${averageScore}%`,
      icon: FaChartLine,
      bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      borderColor: 'border-blue-200',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Best Score',
      value: `${bestScore}%`,
      icon: FaMedal,
      bgColor: 'bg-gradient-to-r from-orange-500 to-red-500',
      borderColor: 'border-orange-200',
      color: 'from-orange-500 to-red-500',
      condition: averageScore >= 70 ? 'from-green-500 to-cyan-500' : 'from-orange-500 to-red-500',
    },
    {
      title: 'Learning Streak',
      value: `${learningStreak} days`,
      icon: FaFire,
      bgColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      borderColor: 'border-yellow-200',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 spacing-responsive">
        {/* Premium Analytics Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 sm:mb-6 lg:mb-8"
        >
          <div className="glass-enhanced rounded-2xl sm:rounded-3xl border border-purple-100/50 p-4 sm:p-6 md:p-8 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-3xl opacity-20"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-0 left-0 w-24 h-24 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full blur-3xl opacity-20"
            />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 sm:space-x-4 mb-3">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/20"
                  >
                    <IoAnalytics className="text-xl sm:text-2xl md:text-3xl text-white" />
                  </motion.div>
                  <div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="inline-flex items-center px-2.5 sm:px-3 py-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50 rounded-full"
                    >
                      <IoSparkles className="text-purple-500 mr-1 sm:mr-1.5 text-xs sm:text-sm" />
                      <span className="text-xs font-semibold text-purple-700">AI Powered</span>
                    </motion.div>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Your <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">Progress</span>
                </h1>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl">
                  Track your learning journey and see how you're improving over time
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 lg:mb-8"
        >
          {statCards.map((stat, index) => (
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="card-modern glass-enhanced rounded-2xl border border-gray-200/50 p-4 sm:p-6 shadow-lg shadow-gray-500/5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="p-2.5 sm:p-3 rounded-xl shadow-lg shadow-gray-500/20">
                  <stat.icon className="text-xl sm:text-2xl bg-gradient-to-br ${stat.color}" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{stat.title}</h3>
              <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r {stat.color}">
                {stat.value}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Results Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-enhanced rounded-2xl sm:rounded-3xl border border-gray-200/50 p-4 sm:p-6 md:p-8"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaTrophy className="text-purple-600" />
              Test History
            </h2>
            {progress?.recentResults && progress.recentResults.length > 0 && (
              <button
                onClick={loadProgress}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Refresh
              </button>
            )}
          </div>

          {progress?.recentResults && progress.recentResults.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={() => navigate('/progress/test-history')}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl border border-purple-100/50 p-6 sm:p-8 shadow-xl shadow-purple-500/10 cursor-pointer hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    Test History
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    View and track all your previous quiz attempts
                  </p>
                </div>
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <FaTrophy className="text-2xl sm:text-3xl text-purple-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Tests</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">{progress.recentResults.length}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Average Score</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    {Math.round(progress.recentResults.reduce((acc, r) => acc + (r.scorePercentage || 0), 0) / progress.recentResults.length)}%
                  </p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Best Score</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {Math.max(...progress.recentResults.map(r => r.scorePercentage || 0))}%
                  </p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Last Attempt</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                    {formatDate(progress.recentResults[0]?.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex items-center justify-center">
                <div className="flex items-center space-x-2 text-purple-600 text-sm sm:text-base font-medium">
                  <span>Click to view all {progress.recentResults.length} tests</span>
                  <FaChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <FaTrophy className="text-3xl sm:text-4xl text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">No quiz results yet</p>
              <button
                onClick={() => navigate('/quiz')}
                className="btn-full-mobile px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all text-sm min-h-[44px]"
              >
                Take Your First Quiz
              </button>
            </div>
          )}
        </motion.div>

        {/* Subject Statistics Section */}
        {progress?.topicPerformance && progress.topicPerformance.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="glass-enhanced rounded-2xl sm:rounded-3xl border border-gray-200/50 p-4 sm:p-6 md:p-8 mt-4 sm:mt-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={() => navigate('/progress/subject-statistics')}
              className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl sm:rounded-3xl border border-purple-100/50 p-6 sm:p-8 shadow-xl shadow-purple-500/10 cursor-pointer hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    Subject Statistics
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Track performance across all quiz subjects
                  </p>
                </div>
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <FaChartBar className="text-2xl sm:text-3xl text-purple-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Subjects</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">
                    {new Set(progress.topicPerformance.map(t => t.subject)).size}
                  </p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Topics</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{progress.topicPerformance.length}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Best Topic</p>
                  <p className="text-sm sm:text-base font-semibold text-green-600 truncate">
                    {progress.topicPerformance.reduce((best, topic) => 
                      topic.averageScore > best.averageScore ? topic : best
                    ).topic}
                  </p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Average Score</p>
                  <p className="text-xl sm:text-2xl font-bold text-indigo-600">
                    {Math.round(progress.topicPerformance.reduce((acc, topic) => 
                      acc + topic.averageScore, 0
                    ) / progress.topicPerformance.length)}%
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex items-center justify-center">
                <div className="flex items-center space-x-2 text-purple-600 text-sm sm:text-base font-medium">
                  <span>Click to view detailed statistics</span>
                  <FaChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/50 p-4 sm:p-6 md:p-8 mt-4 sm:mt-6 shadow-lg"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <FaChartBar className="text-purple-600" />
              Subject Statistics
            </h2>
            <div className="text-center py-8 sm:py-12">
              <FaChartBar className="text-3xl sm:text-4xl text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">No topic statistics yet. Attempt quizzes to see your performance.</p>
              <button
                onClick={() => navigate('/quiz')}
                className="btn-full-mobile px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all text-sm min-h-[44px]"
              >
                Take Your First Quiz
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default Progress;
