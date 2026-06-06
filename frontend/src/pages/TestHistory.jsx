import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Loader from '../components/Loader';
import { FaArrowLeft, FaSearch, FaFilter, FaSort, FaTrophy, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaBookOpen, FaBrain } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getPercentageColor, getPercentageBgColor } from '../utils/helpers';
import api from '../services/axios';

const TestHistory = () => {
  const navigate = useNavigate();
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTestHistory();
  }, []);

  const loadTestHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/progress/history');
      console.log('Test History API response:', res.data);
      
      if (res.data.success && res.data.results) {
        setTestHistory(res.data.results);
        console.log('Test history loaded:', res.data.results.length);
      }
    } catch (error) {
      console.error('Error loading test history:', error);
      toast.error('Failed to load test history');
      setTestHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result) => {
    const resultId = result._id || result.id;
    if (resultId) {
      navigate(`/quiz-result/${resultId}`);
    } else {
      console.error('Quiz result missing ID:', result);
      toast.error('Invalid quiz result');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSubjectFilter('all');
    setSortBy('newest');
  };

  const getFilteredHistory = () => {
    let filtered = [...testHistory];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(test =>
        test.title?.toLowerCase().includes(query) ||
        test.topic?.toLowerCase().includes(query) ||
        test.subject?.toLowerCase().includes(query)
      );
    }

    // Subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(test => test.subject === subjectFilter);
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'highest') {
      filtered.sort((a, b) => (b.scorePercentage || 0) - (a.scorePercentage || 0));
    } else if (sortBy === 'lowest') {
      filtered.sort((a, b) => (a.scorePercentage || 0) - (b.scorePercentage || 0));
    }

    return filtered;
  };

  const getUniqueSubjects = () => {
    const subjects = new Set(testHistory.map(t => t.subject));
    return Array.from(subjects).filter(Boolean);
  };

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
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader size="lg" text="Loading test history..." />
        </div>
      </MainLayout>
    );
  }

  const filteredHistory = getFilteredHistory();

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate('/progress')}
            className="flex items-center text-slate-600 hover:text-slate-900 transition-colors text-sm sm:text-base mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Progress
          </button>

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
            
            <div className="relative">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/20"
                >
                  <FaTrophy className="text-xl sm:text-2xl md:text-3xl text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                    Test History
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    View and track all your previous quiz attempts
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm sm:text-base text-gray-500">
                  {testHistory.length} test{testHistory.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-4 sm:mb-6"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by topic or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-500/10 transition-all"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-500/10 transition-all"
                >
                  <option value="all">All Subjects</option>
                  {getUniqueSubjects().map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-500/10 transition-all"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest Score</option>
                  <option value="lowest">Lowest Score</option>
                </select>

                {(searchQuery || subjectFilter !== 'all' || sortBy !== 'newest') && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Test History List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-enhanced rounded-2xl sm:rounded-3xl border border-gray-200/50 p-4 sm:p-6"
        >
          {filteredHistory.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {filteredHistory.map((test, index) => (
                <motion.div
                  key={test._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4 sm:p-6 hover:border-purple-200/50 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl">
                          <FaTrophy className="text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate mb-1">
                            {test.title || test.topic || 'Untitled Quiz'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {test.subject || 'General'}
                            {test.difficulty && (
                              <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                                {test.difficulty}
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center">
                              <FaCheckCircle className="text-green-500 mr-1" />
                              {test.correctAnswers || 0} correct
                            </span>
                            <span className="flex items-center">
                              <FaTimesCircle className="text-red-500 mr-1" />
                              {test.wrongAnswers || 0} wrong
                            </span>
                            <span className="flex items-center">
                              {test.totalQuestions || 0} total
                            </span>
                            <span className="flex items-center">
                              <FaCalendarAlt className="mr-1" />
                              {formatDate(test.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`px-4 py-2 rounded-xl text-sm sm:text-base font-bold ${getPercentageBgColor(test.scorePercentage)}`}
                      >
                        <span className={getPercentageColor(test.scorePercentage)}>
                          {test.scorePercentage || 0}%
                        </span>
                      </div>
                      <button
                        onClick={() => handleResultClick(test)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm"
                      >
                        View Result
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaTrophy className="text-4xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No tests found</h3>
              <p className="text-gray-600 mb-4">
                {testHistory.length === 0
                  ? "You haven't taken any quizzes yet"
                  : "No tests match your search criteria"}
              </p>
              {testHistory.length === 0 && (
                <button
                  onClick={() => navigate('/quiz')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Take Your First Quiz
                </button>
              )}
              {(searchQuery || subjectFilter !== 'all' || sortBy !== 'newest') && (
                <button
                  onClick={clearFilters}
                  className="ml-4 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default TestHistory;
