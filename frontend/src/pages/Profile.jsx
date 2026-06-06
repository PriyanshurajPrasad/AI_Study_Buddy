import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Clock, 
  BookOpen, 
  Trophy, 
  Target, 
  Brain,
  Flame,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  Download,
  LogOut,
  Trash2,
  Zap,
  Award,
  Sparkles,
  ChevronRight,
  Camera,
  Edit3,
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { PieChart, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Pie } from 'recharts';
import MainLayout from '../layouts/MainLayout';
import toast from 'react-hot-toast';
import api from '../services/axios';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Demo user data
  const user = {
    name: 'Priyanshuraj',
    email: 'priyanshuraj@gmail.com',
    username: '@priyanshuraj',
    role: 'Student',
    joinedDate: 'December 2023',
    bio: 'Computer Science student passionate about AI, Machine Learning, and Web Development. Always learning and exploring new technologies.',
    avatar: 'PR',
    verified: true,
    subscription: 'Free',
    memberSince: '2023-12-15'
  };

  // Demo stats
  const stats = [
    { icon: Flame, label: 'Learning Streak', value: 12, trend: '+2', trendUp: true, color: 'from-orange-500 to-red-500' },
    { icon: BookOpen, label: 'Notes Uploaded', value: 24, trend: '+5', trendUp: true, color: 'from-blue-500 to-purple-500' },
    { icon: Trophy, label: 'Quizzes Taken', value: 18, trend: '+3', trendUp: true, color: 'from-purple-500 to-pink-500' },
    { icon: Target, label: 'Average Score', value: '85%', trend: '+5%', trendUp: true, color: 'from-green-500 to-teal-500' },
  ];

  // Demo activities
  const activities = [
    { id: 1, icon: BookOpen, title: 'Uploaded "Data Structures Notes"', time: '2 hours ago', status: 'completed' },
    { id: 2, icon: Brain, title: 'Generated AI explanation for React Hooks', time: '5 hours ago', status: 'completed' },
    { id: 3, icon: Trophy, title: 'Completed DBMS Quiz - Score: 90%', time: '1 day ago', status: 'completed' },
    { id: 4, icon: BookOpen, title: 'Bookmarked "Machine Learning Basics"', time: '2 days ago', status: 'completed' },
  ];

  // Demo achievements
  const achievements = [
    { id: 1, icon: Zap, title: 'Fast Learner', description: 'Complete 10 notes in 1 week', unlocked: true, color: 'from-yellow-400 to-orange-500' },
    { id: 2, icon: Award, title: 'Quiz Master', description: 'Score 90+ on 5 quizzes', unlocked: true, color: 'from-purple-500 to-pink-500' },
    { id: 3, icon: Flame, title: 'Consistent Student', description: '7-day learning streak', unlocked: true, color: 'from-orange-500 to-red-500' },
    { id: 4, icon: Sparkles, title: 'AI Explorer', description: 'Use 20 AI explanations', unlocked: false, color: 'from-gray-400 to-gray-500' },
  ];

  // Fetch profile analytics from backend
  const fetchProfileAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const res = await api.get('/profile/analytics');
      
      if (res.data.success && res.data.analytics) {
        setAnalytics(res.data.analytics);
      }
    } catch (error) {
      // If no analytics available, set empty analytics
      setAnalytics({
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
      });
    } finally {
      setAnalyticsLoading(false);
      setChartsLoaded(true);
    }
  };


  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleDeleteAccount = () => {
    toast.success('Account deletion initiated');
    setShowDeleteModal(false);
  };

  const handleLogout = () => {
    toast.success('Logged out successfully');
  };

  useEffect(() => {
    fetchProfileAnalytics();
  }, []);

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        {/* Hero Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <div className="relative bg-gradient-to-br from-white via-slate-50 to-blue-50/30 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/20 p-6 sm:p-6 md:p-8 lg:p-12 overflow-visible">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0"></div>
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-gradient-to-br from-cyan-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-3xl" style={{ animation: 'pulse 3s infinite' }}></div>

            <div className="relative">
              {/* Mobile: Center aligned layout */}
              <div className="flex flex-col items-center gap-3 text-center">
                {/* Avatar Section */}
                <div className="relative mb-3 overflow-visible">
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-24 h-24 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-white text-2xl sm:text-2xl md:text-4xl lg:text-5xl font-bold shadow-2xl shadow-purple-500/30 overflow-hidden">
                      {user.avatar}
                    </div>
                    {/* Camera Button - Bottom Right */}
                    <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center z-10">
                      <Camera className="w-4 h-4 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors" />
                    </div>
                    {/* Verification Badge - Bottom Left */}
                    {user.verified && (
                      <div className="absolute -bottom-2 -left-2 bg-blue-500 rounded-full shadow-lg z-10">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                  {/* Student Badge - Below Avatar */}
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-medium">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Student
                    </span>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 w-full space-y-2">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900"
                  >
                    {user.name}
                  </motion.h1>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2 text-gray-500 text-sm sm:text-base"
                  >
                    <span className="flex items-center">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                      {user.email}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                      {user.username}
                    </span>
                  </motion.div>
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(!isEditing)}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-sm font-medium"
                  >
                    <Edit3 className="w-4 h-4 text-gray-600" />
                    <span>Edit Profile</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bio Section - Separate Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/50 p-4 sm:p-6 md:p-8 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 text-center sm:text-left">
              About Me
            </h2>
            <p className="text-gray-600 text-sm sm:text-base text-center sm:text-left leading-relaxed">
              {user.bio}
            </p>
          </div>
        </motion.div>

        {/* Member Info Section - Stacked vertically on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-6 sm:mb-8"
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/50 p-4 sm:p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-sm sm:text-base text-gray-700">
                  Member since {user.memberSince}
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <Shield className="w-5 h-5 text-purple-600" />
                <span className="text-sm sm:text-base text-gray-700">
                  {user.subscription} Plan
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="relative group"
            >
              <div className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 sm:p-6 h-[130px] shadow-lg shadow-gray-500/10 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 flex flex-col items-center justify-center text-center`}>
                {/* Background glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 rounded-2xl group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative">
                  {/* Icon */}
                  <div className={`p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl mb-2 sm:mb-4`}>
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  {/* Number */}
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-white"
                  >
                    {stat.value}
                  </motion.div>
                  {/* Label */}
                  <p className="text-xs sm:text-sm text-white/80 mt-1">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:flex sm:space-x-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 sm:p-1.5 border border-gray-200/50 shadow-sm">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'activity', label: 'Activity', icon: Activity },
              { id: 'achievements', label: 'Achievements', icon: Award },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 px-3 py-3 sm:py-2.5 rounded-xl sm:rounded-xl font-medium transition-all duration-200 min-h-[56px] sm:h-12 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Account Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2 text-purple-500" />
                  Account Information
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="relative">
                        {isEditing ? (
                          <input
                            type="text"
                            defaultValue={user.name}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-500/10 transition-all"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900">
                            {user.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="relative">
                        {isEditing ? (
                          <input
                            type="email"
                            defaultValue={user.email}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-500/10 transition-all"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900">
                            {user.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <div className="relative">
                        {isEditing ? (
                          <input
                            type="text"
                            defaultValue={user.username}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-500/10 transition-all"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900">
                            {user.username}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <div className="relative">
                        {isEditing ? (
                          <input
                            type="text"
                            defaultValue={user.role}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-500/10 transition-all"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900">
                            {user.role}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio / About</label>
                    <div className="relative">
                      {isEditing ? (
                        <textarea
                          defaultValue={user.bio}
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-500/10 transition-all resize-none"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 min-h-[100px]">
                          {user.bio}
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveProfile}
                        className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Save Changes</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsEditing(false)}
                        className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all"
                      >
                        <XCircle className="w-5 h-5 text-gray-400" />
                        <span>Cancel</span>
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Performance Analytics */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="space-y-6"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                    Performance Analytics
                  </h2>
                  
                  <div className="w-full h-72 sm:h-80 md:h-96 lg:h-[320px] min-h-[240px] sm:min-h-[288px] md:min-h-[320px] lg:min-h-[320px]">
                    {analyticsLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-500 mt-2 text-sm">Loading analytics...</p>
                        </div>
                      </div>
                    ) : analytics && analytics.weeklyPerformance && analytics.weeklyPerformance.length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={analytics.weeklyPerformance}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis 
                            dataKey="day" 
                            tick={{ fill: '#6b7280', fontSize: 10 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} width={40} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1e293b', 
                              border: 'none', 
                              borderRadius: '8px',
                              fontSize: '12px'
                            }} 
                          />
                          <Bar dataKey="score" fill="url(#gradientBar)" radius={[8, 8]} />
                          <defs>
                            <linearGradient id="gradientBar" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3B82F6" />
                              <stop offset="100%" stopColor="#8B5CF6" />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">No quiz data yet</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Topic Progress</h3>
                    <div className="w-full h-56 sm:h-64 md:h-72 lg:h-80 min-h-[200px] sm:min-h-[224px] md:min-h-[256px] lg:min-h-[280px]">
                      {analyticsLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 mt-2 text-sm">Loading chart...</p>
                          </div>
                        </div>
                      ) : analytics && analytics.topicProgress && analytics.topicProgress.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={analytics.topicProgress}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={60}
                              paddingAngle={5}
                              dataKey="averageScore"
                              stroke="#f3f4f6"
                              strokeWidth={2}
                              label={{
                                value: (entry) => entry.topic,
                                fontSize: 10
                              }}
                              labelLine={false}
                            >
                              {analytics.topicProgress.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3B82F6' : '#8B5CF6'} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500">No quiz data yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Performance</h3>
                    <div className="space-y-4">
                      {analytics && analytics.quizPerformance && analytics.quizPerformance.length > 0 ? (
                        analytics.quizPerformance.map((topic) => (
                          <div key={topic.topic}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">{topic.topic}</span>
                              <span className="text-sm font-bold text-purple-600">{topic.averageScore}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${topic.averageScore}%` }}
                                transition={{ duration: 1 }}
                                className={`h-full rounded-full ${
                                  topic.averageScore >= 85 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                  topic.averageScore >= 70 ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                                  'bg-gradient-to-r from-orange-500 to-red-500'
                                }`}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-40">
                          <p className="text-gray-500">No quiz data yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-purple-500" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className={`p-3 rounded-xl ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      <activity.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {activity.status}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="w-5 h-5 mr-2 text-purple-500" />
                Achievements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                      achievement.unlocked
                        ? `bg-gradient-to-br ${achievement.color} border-transparent`
                        : 'bg-gray-50 border-gray-200 opacity-50'
                    }`}
                  >
                    {!achievement.unlocked && (
                      <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Lock className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className={`p-3 rounded-xl mb-3 ${
                      achievement.unlocked
                        ? 'bg-white/20 backdrop-blur-sm'
                        : 'bg-gray-200'
                    }`}>
                      <achievement.icon className={`w-8 h-8 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <h3 className={`font-bold mb-1 ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
                      {achievement.title}
                    </h3>
                    <p className={`text-sm ${achievement.unlocked ? 'text-white/90' : 'text-gray-400'}`}>
                      {achievement.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm"
            >
              <h2 className="text xl font-bold text-gray-900 mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-purple-500" />
                Settings
              </h2>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Edit3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-900">Edit Profile Information</span>
                  </div>
                  <ChevronRight className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                </motion.button>
                <motion.button
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Lock className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">Change Password</span>
                  </div>
                  <ChevronRight className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </motion.button>
                <motion.button
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <Download className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-900">Export Data</span>
                  </div>
                  <ChevronRight className="text-gray-400 group-hover:text-green-500 transition-colors" />
                </motion.button>
                <motion.button
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="font-medium text-gray-900">Delete Account</span>
                  </div>
                  <ChevronRight className="text-gray-400 group-hover:text-red-500 transition-colors" />
                </motion.button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};

export default Profile;
