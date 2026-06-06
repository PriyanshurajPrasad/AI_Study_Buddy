import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Loader from '../components/Loader';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaBook, FaCalendarAlt, FaTrophy, FaBrain, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const QuizResultDetail = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to normalize options to always be an array
  const normalizeOptions = (options) => {
    if (Array.isArray(options)) return options;

    if (typeof options === "string") {
      return options
        .split(/\n|,|(?=[A-D][).])/)
        .map(opt => opt.trim())
        .filter(Boolean);
    }

    if (options && typeof options === "object") {
      return Object.values(options).filter(Boolean);
    }

    return [];
  };

  useEffect(() => {
    loadQuizResult();
  }, [resultId]);

  const loadQuizResult = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if it's a local result (from localStorage)
      if (resultId === 'local') {
        const localResult = JSON.parse(localStorage.getItem('currentQuizResult') || 'null');
        if (localResult) {
          setResult(localResult);
        } else {
          setError('No local quiz result found');
        }
      } else {
        // Try to fetch from backend first
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/quiz/results/${resultId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          
          if (data.success && data.result) {
            setResult(data.result);
          } else {
            throw new Error('Result not found in backend');
          }
        } catch (backendError) {
          // Fallback to localStorage
          const localResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
          const foundResult = localResults.find(r => r._id === resultId || r.id === resultId);
          
          if (foundResult) {
            setResult(foundResult);
          } else {
            setError('Quiz result not found');
          }
        }
      }
    } catch (err) {
      setError('Failed to load quiz result');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FaExclamationTriangle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Result Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/progress')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Back to Progress
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!result) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FaExclamationTriangle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Result Data</h2>
            <p className="text-gray-600 mb-6">Quiz result data is missing or incomplete.</p>
            <button
              onClick={() => navigate('/progress')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Back to Progress
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const percentage = result?.scorePercentage || result?.percentage || 0;
  const isHighScore = percentage >= 80;
  const isMediumScore = percentage >= 60 && percentage < 80;
  const questions = Array.isArray(result?.questions) ? result.questions : [];
  const selectedAnswers = result?.selectedAnswers || {};

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/progress')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Progress</span>
          </button>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-purple-100/50 p-8 shadow-xl shadow-purple-500/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{result?.topic || result?.title || 'Quiz Review'}</h1>
                <p className="text-gray-600">{result?.subject || 'General'}</p>
              </div>
              <div className="text-right">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                  isHighScore ? 'bg-gradient-to-br from-green-500 to-teal-500' :
                  isMediumScore ? 'bg-gradient-to-br from-blue-500 to-purple-500' :
                  'bg-gradient-to-br from-orange-500 to-red-500'
                }`}>
                  <span className="text-white text-2xl font-bold">{Math.round(percentage)}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Score</p>
                <p className="text-2xl font-bold text-indigo-600">{Math.round(percentage)}%</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Correct</p>
                <p className="text-2xl font-bold text-green-600">{result?.correctAnswers || 0}</p>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Wrong</p>
                <p className="text-2xl font-bold text-red-600">{result?.wrongAnswers || 0}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-2xl font-bold text-purple-600">{result?.totalQuestions || 0}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center space-x-2 text-sm text-gray-500">
              <FaCalendarAlt />
              <span>Completed on {new Date(result?.completedAt || result?.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </motion.div>

        {/* Questions Review */}
        {questions.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <FaBrain className="text-purple-500" />
              <span>Question Review</span>
            </h2>

            {questions.map((question, index) => {
              const options = normalizeOptions(question.options);
              const userAnswer = selectedAnswers[index] || question.userAnswer || question.selectedAnswer;
              const correctAnswer = question.correctAnswer;
              const isCorrect = userAnswer === correctAnswer;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white/80 backdrop-blur-sm rounded-2xl border-2 p-6 shadow-lg ${
                    isCorrect ? 'border-green-200' : 'border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {isCorrect ? <FaCheckCircle /> : <FaTimesCircle />}
                      </div>
                      <span className="text-sm text-gray-500">Question {index + 1}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{question.question || 'Question not available'}</h3>

                  {options.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {options.map((option, optIndex) => {
                        const isSelected = option === userAnswer;
                        const isCorrectOption = option === correctAnswer;
                        
                        return (
                          <div
                            key={optIndex}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              isCorrectOption
                                ? 'border-green-500 bg-green-50'
                                : isSelected && !isCorrect
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-600">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <span className="text-sm text-gray-900">{option}</span>
                              {isCorrectOption && <FaCheckCircle className="ml-auto text-green-500" />}
                              {isSelected && !isCorrect && <FaTimesCircle className="ml-auto text-red-500" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">No options available</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-2">Your Answer</p>
                      <p className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {userAnswer || 'Not answered'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-2">Correct Answer</p>
                      <p className="font-semibold text-green-600">
                        {correctAnswer || 'Correct answer not available'}
                      </p>
                    </div>
                  </div>

                  {question?.explanation ? (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center space-x-2">
                        <FaBook />
                        <span>Explanation</span>
                      </p>
                      <div className="text-sm text-blue-800 prose prose-sm max-w-none">
                        <ReactMarkdown>{question.explanation}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">No explanation available</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-yellow-50 rounded-2xl border border-yellow-200 p-8"
          >
            <div className="text-center">
              <FaExclamationTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Question Details Not Available</h3>
              <p className="text-gray-600 mb-4">
                This quiz result was saved without question details. You can see your score but cannot review individual questions.
              </p>
              <button
                onClick={() => navigate('/quiz')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Take a New Quiz
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default QuizResultDetail;
