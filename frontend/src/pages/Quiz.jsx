import { useState } from 'react';
import { useQuizHistory } from '../hooks/useQuizHistory';
import { generateTopicQuiz } from '../services/quiz';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { FaTrophy, FaBrain, FaBookOpen } from 'react-icons/fa';
import { IoSparkles } from 'react-icons/io5';
import MainLayout from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Quiz = () => {
  const navigate = useNavigate();
  const { quizzes, loading, refetchQuizHistory } = useQuizHistory();
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  
  // Topic-based quiz form state
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('Mixed');

  const handleGenerateQuiz = async () => {
    // Validate form fields
    if (!subject.trim() || !topic.trim()) {
      toast.error('Please enter both subject and topic');
      return;
    }

    // Validate numberOfQuestions
    const validQuestionCounts = [5, 10, 15, 20, 30];
    if (!validQuestionCounts.includes(questionCount)) {
      toast.error('Question count must be 5, 10, 15, 20, or 30');
      return;
    }

    // Validate difficulty
    const validDifficulties = ['Easy', 'Medium', 'Hard', 'Mixed'];
    if (!validDifficulties.includes(difficulty)) {
      toast.error('Difficulty must be Easy, Medium, Hard, or Mixed');
      return;
    }

    const payload = {
      subject: subject.trim(),
      topic: topic.trim(),
      numberOfQuestions: Number(questionCount),
      difficulty
    };

    setGeneratingQuiz(true);
    toast.loading(`Generating ${questionCount} questions...`, { id: 'quiz-generation' });
    
    try {
      const response = await generateTopicQuiz(payload);

      const quiz = response.quiz;

      if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
        toast.error("No questions generated.");
        return;
      }

      toast.dismiss('quiz-generation');
      toast.success(`Quiz generated successfully with ${quiz.questions.length} questions.`);

      navigate("/quiz/attempt", {
        state: { quiz },
        replace: false
      });
      
    } catch (error) {
      toast.dismiss('quiz-generation');
      
      toast.error(error.response?.data?.message || "Failed to generate quiz");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader size="lg" text="Loading quiz center..." />
        </div>
      </MainLayout>
    );
  }

  // Calculate stats
  const averageScore = quizzes.length > 0 
    ? Math.round(quizzes.reduce((acc, quiz) => acc + parseFloat(quiz.percentage), 0) / quizzes.length)
    : 0;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 spacing-responsive">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 sm:mb-8"
        >
          <div className="bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-purple-100/50 p-4 sm:p-6 md:p-8 relative overflow-hidden">
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
                    <FaTrophy className="text-xl sm:text-2xl md:text-3xl text-white" />
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
                  Quiz <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">Center</span>
                </h1>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl">
                  Challenge yourself with AI-generated quizzes on any subject and topic.
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
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="card-modern bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100/50 p-4 sm:p-6 shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg shadow-purple-500/20">
                <FaBookOpen className="text-xl sm:text-2xl text-white" />
              </div>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Topic Quiz</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">AI-powered generation</p>
            <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
              Any Topic
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="card-modern bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100/50 p-4 sm:p-6 shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/20">
                <FaTrophy className="text-xl sm:text-2xl text-white" />
              </div>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Quizzes Taken</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">Total completed</p>
            <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
              {quizzes.length}
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="card-modern bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-100/50 p-4 sm:p-6 shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="p-2.5 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg shadow-purple-500/20">
                <FaBrain className="text-xl sm:text-2xl text-white" />
              </div>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Avg Score</h3>
            <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">Overall performance</p>
            <div className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">
              {averageScore}%
            </div>
          </motion.div>
        </motion.div>

        {/* Quiz Generation Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-purple-100/50 p-4 sm:p-6 md:p-8 shadow-xl shadow-purple-500/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Create AI Quiz</h2>
                <p className="text-gray-600 text-sm sm:text-base">Generate intelligent quizzes from any subject and topic</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
                <FaBrain className="text-lg sm:text-xl text-white" />
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Subject Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Physics, Mathematics, Chemistry"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                  disabled={generatingQuiz}
                />
              </div>

              {/* Topic Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Newton's Laws, Calculus, Organic Chemistry"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                  disabled={generatingQuiz}
                />
              </div>

              {/* Question Count and Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                    disabled={generatingQuiz}
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                    disabled={generatingQuiz}
                  >
                    <option value="Mixed">Mixed</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateQuiz}
                disabled={generatingQuiz}
                className={`w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all flex items-center justify-center space-x-2 sm:space-x-3 text-sm sm:text-base ${
                  generatingQuiz ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {generatingQuiz ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <FaBrain className="text-base sm:text-lg" />
                    </motion.div>
                    <span>Generating Quiz...</span>
                  </>
                ) : (
                  <>
                    <IoSparkles className="text-base sm:text-lg" />
                    <span>Generate Quiz</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Quiz;
