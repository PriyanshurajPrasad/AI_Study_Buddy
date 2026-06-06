import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Loader from '../components/Loader';
import { FaArrowLeft, FaSearch, FaFilter, FaSort, FaChartBar, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaBookOpen, FaTrophy, FaBrain, FaMedal, FaFire, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getPercentageColor, getPercentageBgColor } from '../utils/helpers';
import api from '../services/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SubjectStatistics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('attempts');
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);

  useEffect(() => {
    loadSubjectStatistics();
  }, []);

  const loadSubjectStatistics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/progress/subject-statistics');
      console.log('Subject Statistics API response:', res.data);
      
      if (res.data.success && res.data.stats) {
        setStats(res.data.stats);
        console.log('Subject statistics loaded:', res.data.stats);
      }
    } catch (error) {
      console.error('Error loading subject statistics:', error);
      toast.error('Failed to load subject statistics');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSubjectFilter('all');
    setSortBy('attempts');
  };

  const getFilteredSubjects = () => {
    if (!stats || !stats.subjects) return [];

    let filtered = [...stats.subjects];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(subject =>
        subject.subject?.toLowerCase().includes(query) ||
        subject.topics.some(topic => topic.topic?.toLowerCase().includes(query))
      );
    }

    // Subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(subject => subject.subject === subjectFilter);
    }

    // Sort
    if (sortBy === 'attempts') {
      filtered.sort((a, b) => b.attempts - a.attempts);
    } else if (sortBy === 'average') {
      filtered.sort((a, b) => b.averageScore - a.averageScore);
    } else if (sortBy === 'best') {
      filtered.sort((a, b) => b.bestScore - a.bestScore);
    }

    return filtered;
  };

  const getFilteredTopics = (topics) => {
    if (!searchQuery && subjectFilter === 'all') return topics;

    let filtered = [...topics];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(topic => topic.topic?.toLowerCase().includes(query));
    }

    return filtered;
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

  const toggleSubjectExpand = (subject) => {
    setExpandedSubject(expandedSubject === subject ? null : subject);
    setExpandedTopic(null);
  };

  const toggleTopicExpand = (topic) => {
    setExpandedTopic(expandedTopic === topic ? null : topic);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader size="lg" text="Loading subject statistics..." />
        </div>
      </MainLayout>
    );
  }

  if (!stats || stats.subjects.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <button
            onClick={() => navigate('/progress')}
            className="flex items-center text-slate-600 hover:text-slate-900 transition-colors text-sm sm:text-base mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Progress
          </button>

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/50 p-4 sm:p-6 md:p-8 shadow-lg">
            <div className="text-center py-8 sm:py-12">
              <FaChartBar className="text-3xl sm:text-4xl text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No subject statistics yet</h3>
              <p className="text-gray-600 mb-4">Attempt quizzes to see your subject-wise performance</p>
              <button
                onClick={() => navigate('/quiz')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Take Your First Quiz
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const filteredSubjects = getFilteredSubjects();

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

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-purple-100/50 p-4 sm:p-6 md:p-8 shadow-xl shadow-purple-500/10 relative overflow-hidden">
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
                  <FaChartBar className="text-xl sm:text-2xl md:text-3xl text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                    Subject Statistics
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Detailed performance analysis across all subjects and topics
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100/50">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Subjects</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.totalSubjects}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100/50">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Topics</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalTopics}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100/50">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Average Score</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.averageScore}%</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100/50">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Best Topic</p>
                  <p className="text-sm sm:text-base font-semibold text-orange-600 truncate">
                    {stats.bestTopic || 'N/A'}
                  </p>
                </div>
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
                  placeholder="Search by subject or topic..."
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
                  {stats.subjects.map(subject => (
                    <option key={subject.subject} value={subject.subject}>{subject.subject}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-500/10 transition-all"
                >
                  <option value="attempts">Most Attempts</option>
                  <option value="average">Highest Average</option>
                  <option value="best">Best Score</option>
                </select>

                {(searchQuery || subjectFilter !== 'all' || sortBy !== 'attempts') && (
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

        {/* Subject Statistics List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject, index) => {
              const filteredTopics = getFilteredTopics(subject.topics);
              if (filteredTopics.length === 0) return null;

              return (
                <motion.div
                  key={subject.subject}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-200/50 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all"
                >
                  {/* Subject Header */}
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSubjectExpand(subject.subject)}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl">
                        <FaBookOpen className="text-purple-600 text-lg sm:text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{subject.subject}</h3>
                        <p className="text-sm text-gray-500">{subject.attempts} attempt{subject.attempts !== 1 ? 's' : ''} • {subject.topics.length} topic{subject.topics.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-4 py-2 rounded-xl text-sm sm:text-base font-bold ${getPercentageBgColor(subject.averageScore)}`}
                      >
                        <span className={getPercentageColor(subject.averageScore)}>
                          {subject.averageScore}%
                        </span>
                      </div>
                      <FaChevronRight className={`transition-transform ${expandedSubject === subject.subject ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {/* Subject Details */}
                  {expandedSubject === subject.subject && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 pt-6 border-t border-gray-200/50"
                    >
                      {/* Subject Bar Chart */}
                      <div className="w-full h-48 sm:h-56 md:h-64 lg:h-80 min-h-[192px] sm:min-h-[224px] md:min-h-[256px] lg:min-h-[320px] mb-6">
                        <ResponsiveContainer width="100%" height={192}>
                          <BarChart data={filteredTopics}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis 
                              dataKey="topic" 
                              tick={{ fill: '#6b7280', fontSize: 10 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} width={40} domain={[0, 100]} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1e293b', 
                                border: 'none', 
                                borderRadius: '8px',
                                fontSize: '12px'
                              }}
                              formatter={(value) => [`${value}%`, 'Average Score']}
                            />
                            <Bar dataKey="averageScore" fill="url(#gradientBar)" radius={[8, 8]} />
                            <defs>
                              <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3B82F6" />
                                <stop offset="100%" stopColor="#8B5CF6" />
                              </linearGradient>
                            </defs>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Topics List */}
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-gray-900">Topic Breakdown</h4>
                        {filteredTopics.map((topic, topicIndex) => (
                          <motion.div
                            key={topic.topic}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: topicIndex * 0.05 }}
                            className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-gray-800 text-sm sm:text-base truncate">{topic.topic}</h5>
                                <p className="text-xs text-gray-500">{topic.attempts} attempt{topic.attempts !== 1 ? 's' : ''} • Best: {topic.bestScore}%</p>
                              </div>
                              <div className="text-right ml-4">
                                <div className={`text-lg sm:text-xl font-bold ${
                                  topic.averageScore >= 80 ? 'text-green-600' :
                                  topic.averageScore >= 50 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {topic.averageScore}%
                                </div>
                                <div className="text-xs text-gray-500">avg score</div>
                              </div>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${topic.averageScore}%` }}
                                transition={{ duration: 1 }}
                                className={`h-full rounded-full ${
                                  topic.averageScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                  topic.averageScore >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                  'bg-gradient-to-r from-red-500 to-red-600'
                                }`}
                              />
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                              <span className="flex items-center">
                                <FaCheckCircle className="text-green-500 mr-1" />
                                {topic.correctAnswers} correct
                              </span>
                              <span className="flex items-center">
                                {topic.totalQuestions} total
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200/50 p-4 sm:p-6 shadow-sm">
              <div className="text-center py-8 sm:py-12">
                <FaChartBar className="text-3xl sm:text-4xl text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-4">
                  {stats.subjects.length === 0
                    ? "You haven't taken any quizzes yet"
                    : "No subjects match your search criteria"}
                </p>
                {(searchQuery || subjectFilter !== 'all' || sortBy !== 'attempts') && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default SubjectStatistics;
