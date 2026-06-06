import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../hooks/useProgress';
import { useQuizHistory } from '../hooks/useQuizHistory';
import { useNotes } from '../hooks/useNotes';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaFire,
  FaBook,
  FaTrophy,
  FaChartLine,
  FaUpload,
  FaBrain,
  FaArrowRight,
  FaPlus,
  FaFilePdf,
  FaFileWord,
  FaLightbulb,
} from 'react-icons/fa';
import { IoSparkles } from 'react-icons/io5';

const Dashboard = () => {
  const { user } = useAuth();
  const { progress, loading: progressLoading } = useProgress();
  const { quizzes, loading: quizzesLoading } = useQuizHistory();
  const { notes, loading: notesLoading } = useNotes();

  
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const statCards = [
    {
      icon: <FaFire className="text-xl" />,
      label: 'Learning Streak',
      value: progress?.learningStreak || 0,
      subtitle: 'Days',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200',
    },
    {
      icon: <FaBook className="text-xl" />,
      label: 'Notes Uploaded',
      value: notes.length || 0,
      subtitle: 'Notes',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
    },
    {
      icon: <FaTrophy className="text-xl" />,
      label: 'Quizzes Attempted',
      value: progress?.totalQuizzes || 0,
      subtitle: 'Quizzes',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200',
    },
    {
      icon: <FaChartLine className="text-xl" />,
      label: 'Average Score',
      value: `${progress?.averageScore || 0}%`,
      subtitle: 'Score',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
    },
  ];

  const quickActions = [
    {
      icon: <FaUpload className="text-2xl" />,
      title: 'Upload Notes',
      description: 'Add your study materials',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      gradient: 'from-purple-500 to-purple-600',
      link: '/notes',
    },
    {
      icon: <FaBrain className="text-2xl" />,
      title: 'AI Assistant',
      description: 'Get help with concepts',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      gradient: 'from-green-500 to-green-600',
      link: '/ai-assistant',
    },
    {
      icon: <FaTrophy className="text-2xl" />,
      title: 'Take Quiz',
      description: 'Test your knowledge',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      gradient: 'from-pink-500 to-pink-600',
      link: '/quiz',
    },
    {
      icon: <FaChartLine className="text-2xl" />,
      title: 'View Progress',
      description: 'Track your learning',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      gradient: 'from-orange-500 to-orange-600',
      link: '/progress',
    },
  ];

  const recentNotes = notes.slice(0, 3);
  const recentQuizzes = quizzes.slice(0, 3);

  if (progressLoading || quizzesLoading || notesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 spacing-responsive">
      {/* Greeting Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 sm:mb-6 lg:mb-8"
      >
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          {greeting}, {user?.name}! 👋
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600">
          Ready to continue your AI-powered learning journey?
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-4 sm:mb-6 lg:mb-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 grid-responsive-4">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="card-modern bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className={`p-2.5 sm:p-3 rounded-xl ${stat.bgColor} ${stat.borderColor} border`}>
                  <div className="text-sm sm:text-base">{stat.icon}</div>
                </div>
                <div className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
              <h3 className="text-gray-600 font-medium mb-1 text-sm sm:text-base">{stat.label}</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-500">{stat.subtitle}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
        {/* Left Column - Main Content */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 grid-responsive-4">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.link}>
                  <div className="card-modern bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className={`p-2.5 sm:p-3 rounded-xl ${action.bgColor} ${action.borderColor} border`}>
                        <div className="text-lg sm:text-2xl">{action.icon}</div>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FaArrowRight className="text-gray-700 text-sm sm:text-base" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{action.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Bottom Section - Recent Notes & Quizzes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
          >
            {/* Recent Notes */}
            <div className="glass-enhanced rounded-2xl p-4 sm:p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Notes</h2>
                <Link to="/notes" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All →
                </Link>
              </div>
              {recentNotes.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {recentNotes.map((note, index) => (
                    <Link key={note.id} to={`/notes/${note.id}`}>
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="p-2 bg-white rounded-lg group-hover:bg-purple-50 transition-colors">
                            {note.originalFileName.endsWith('.pdf') ? (
                              <FaFilePdf className="text-red-500 text-sm sm:text-base" />
                            ) : (
                              <FaFileWord className="text-blue-500 text-sm sm:text-base" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors text-sm sm:text-base truncate">
                              {note.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">{note.originalFileName}</p>
                          </div>
                        </div>
                        <FaArrowRight className="text-gray-400 group-hover:text-purple-600 transition-colors text-sm sm:text-base flex-shrink-0 ml-2" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-200 rounded-xl">
                  <FaBook className="text-3xl sm:text-4xl text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">No notes uploaded yet</p>
                  <Link to="/notes">
                    <button className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all text-sm sm:text-base">
                      Upload Your First Note
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Quizzes */}
            <div className="glass-enhanced rounded-2xl p-4 sm:p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Quizzes</h2>
                <Link to="/quiz" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All →
                </Link>
              </div>
              {recentQuizzes.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {recentQuizzes.map((quiz, index) => (
                    <div key={quiz.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <div className="p-2 bg-purple-50 rounded-lg flex-shrink-0">
                          <FaTrophy className="text-purple-600 text-sm sm:text-base" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-800 text-sm sm:text-base truncate">{quiz.noteTitle}</h4>
                          <p className="text-xs sm:text-sm text-gray-500">{quiz.score}/{quiz.totalQuestions} questions</p>
                        </div>
                      </div>
                      <div
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex-shrink-0 ml-2 ${
                          parseFloat(quiz.percentage) >= 70
                            ? 'bg-green-100 text-green-700'
                            : parseFloat(quiz.percentage) >= 50
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {quiz.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 border-2 border-dashed border-gray-200 rounded-xl">
                  <FaTrophy className="text-3xl sm:text-4xl text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">No quizzes attempted yet</p>
                  <Link to="/quiz">
                    <button className="btn-full-mobile px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all text-sm min-h-[44px]">
                      Take Your First Quiz
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - AI Tip Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="hidden xl:block"
        >
          <div className="glass-enhanced bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden">
            {/* Floating decorative elements */}
            <div className="absolute top-4 right-4 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 sm:w-20 sm:h-20 bg-white/10 rounded-full blur-xl"></div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <IoSparkles className="text-yellow-200 text-sm sm:text-base" />
                </div>
                <span className="font-semibold text-sm sm:text-base">AI Study Tip 💡</span>
              </div>
              <p className="text-white/90 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                Break your study sessions into 25-minute focused blocks for better retention.
              </p>
              {/* Carousel indicators */}
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                <div className="w-2 h-2 bg-white/50 rounded-full"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
