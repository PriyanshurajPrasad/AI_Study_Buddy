import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { submitQuiz } from '../services/quiz';
import Button from '../components/Button';
import { FaArrowLeft, FaCheck, FaTimes, FaTrophy, FaBrain } from 'react-icons/fa';
import MainLayout from '../layouts/MainLayout';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const QuizAttempt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const locationQuiz = location.state?.quiz;
    const finalQuiz = locationQuiz;

    console.log("QUIZ ATTEMPT QUIZ:", finalQuiz);
    console.log("QUIZ ID:", finalQuiz?._id || finalQuiz?.id);

    if (!finalQuiz) {
      setLoading(false);
      toast.error('No quiz data found');
      navigate('/quiz');
      return;
    }

    const questions = Array.isArray(finalQuiz.questions) ? finalQuiz.questions : [];
    console.log("QUIZ ATTEMPT QUESTIONS:", questions);
    console.log("QUESTIONS COUNT:", questions.length);

    if (questions.length > 0) {
      setQuiz(finalQuiz);
      setAnswers(new Array(questions.length).fill(null));
    } else {
      console.error("No quiz questions found");
      toast.error('No quiz questions found');
    }

    setLoading(false);
  }, [location.state, navigate]);

  const handleSelectAnswer = (questionIndex, optionKey) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionKey;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredCount = answers.filter(a => a === null).length;
    if (unansweredCount > 0) {
      toast.error(`Please answer all ${unansweredCount} remaining questions`);
      return;
    }

    setSubmitting(true);

    try {
      // Calculate score locally
      let correctCount = 0;
      const questionResults = quiz.questions.map((question, index) => {
        const userAnswer = answers[index];
        const correctAnswer = question.correctAnswer;

        // Compare answers (case-insensitive)
        const isCorrect = userAnswer?.toUpperCase() === correctAnswer?.toUpperCase();

        if (isCorrect) correctCount++;

        return {
          question: question.question,
          userAnswer: userAnswer,
          correctAnswer: correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty,
          isCorrect,
        };
      });

      // Calculate all values before sending to backend
      const correctAnswers = correctCount;
      const totalQuestions = quiz.questions.length;
      const wrongAnswers = totalQuestions - correctAnswers;
      const percentage = totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

      // Set results for UI display
      setResults({
        score: correctAnswers,
        totalQuestions,
        percentage: percentage.toFixed(2),
        results: questionResults,
      });

      // Prepare result payload for backend
      const quizId = quiz._id || quiz.id;
      if (!quizId) {
        console.error('Quiz ID is missing, cannot save to backend');
        toast.error('Quiz ID is missing, cannot save result');
        setSubmitting(false);
        return;
      }

      const payload = {
        quizId: quiz?._id || quiz?.id || null,
        subject: quiz?.subject || "General",
        topic: quiz?.topic || quiz?.title || "Untitled Topic",
        title: quiz?.title || `${quiz?.topic || "Topic"} Quiz`,
        questions: quiz?.questions || [],
        selectedAnswers: answers || {},
        totalQuestions: quiz?.questions?.length || 0,
        correctAnswers: Number(correctAnswers) || 0,
        wrongAnswers: (quiz?.questions?.length || 0) - (Number(correctAnswers) || 0),
        scorePercentage: Number(percentage) || 0
      };

      console.log("FINAL SUBMIT PAYLOAD:", payload);

      // Submit quiz to backend
      const response = await submitQuiz(payload);
      console.log('Quiz submission response:', response);

      // Navigate to result page
      if (response.success) {
        toast.success("Quiz submitted successfully");
        navigate(`/quiz-result/${response.result._id}`, {
          state: { result: response.result }
        });
      } else {
        console.error('Quiz submission failed:', response);
        toast.error('Failed to submit quiz');
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Quiz submission error:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    localStorage.removeItem('currentQuiz');
    navigate('/quiz');
  };

  const handleRetry = () => {
    setAnswers(new Array(quiz.questions.length).fill(null));
    setSubmitted(false);
    setResults(null);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <FaBrain className="text-6xl text-purple-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Loading quiz...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="secondary" onClick={handleBack}>
              <FaArrowLeft className="mr-2" />
              Back to Quiz Center
            </Button>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-purple-100/50 p-8 shadow-xl shadow-purple-500/5">
            <div className="text-center py-12">
              <FaBrain className="text-6xl text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No quiz questions found</h3>
              <p className="text-gray-600 mb-6">
                Please generate a quiz again to attempt it.
              </p>
              <Button variant="primary" onClick={handleBack}>
                Go to Quiz Center
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show results after submission
  if (submitted && results) {
    const percentage = parseFloat(results.percentage);
    const isPassing = percentage >= 70;
    const scoreColor = isPassing ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600';
    const progressColor = isPassing ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';

    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8">
          {/* Back Button */}
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="flex items-center text-slate-600 hover:text-slate-900 transition-colors text-sm sm:text-base"
            >
              <FaArrowLeft className="mr-2 text-sm sm:text-base" />
              Back to Quiz Center
            </button>
          </div>

          {/* Result Hero Card */}
          <div className="max-w-2xl sm:max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-purple-500/10 p-4 sm:p-6 md:p-8 lg:p-10"
            >
              {/* Trophy Icon */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20"
                >
                  <FaTrophy className="text-3xl sm:text-4xl text-white" />
                </motion.div>
              </div>

              {/* Title */}
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-1 sm:mb-2">Quiz Completed!</h1>
                <p className="text-slate-500 text-base sm:text-lg">Here's how you performed</p>
              </div>

              {/* Score Percentage */}
              <div className="text-center mb-6 sm:mb-8">
                <div className={`text-5xl sm:text-6xl md:text-7xl font-bold ${scoreColor} mb-2`}>
                  {results.percentage}%
                </div>
                <p className="text-slate-500 text-sm sm:text-base">Overall Score</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6 sm:mb-8">
                <div className="w-full bg-slate-100 rounded-full h-2 sm:h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${results.percentage}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full ${progressColor}`}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 border border-green-100">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mb-1">
                    {results.score}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 font-medium">Correct</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-4 sm:p-6 border border-red-100">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600 mb-1">
                    {results.totalQuestions - results.score}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 font-medium">Incorrect</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-1">
                    {results.totalQuestions}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 font-medium">Total Questions</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRetry}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <FaBrain />
                  <span>Try Again</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBack}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <FaArrowLeft />
                  <span>Back to Quiz Center</span>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Question Review Section */}
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">Question Review</h2>
              <p className="text-slate-500 text-base sm:text-lg">Review your answers and explanations</p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {quiz.questions.map((question, index) => {
                const result = results.results?.[index];
                const isCorrect = result?.isCorrect;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`rounded-2xl border p-4 sm:p-6 shadow-sm ${
                      isCorrect
                        ? 'bg-green-50/50 border-green-200'
                        : 'bg-red-50/50 border-red-200'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <span className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-sm sm:text-lg ${
                          isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {index + 1}
                        </span>
                        <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                          isCorrect
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                        isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {isCorrect ? <FaCheck /> : <FaTimes />}
                      </div>
                    </div>

                    {/* Question Text */}
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
                      {question.question}
                    </h3>

                    {/* Answer Details */}
                    <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                      <div className="flex flex-col sm:flex-row items-start space-y-1 sm:space-y-0 sm:space-x-3">
                        <span className="text-slate-500 font-medium text-xs sm:text-sm">Your Answer:</span>
                        <span className={`font-semibold text-sm sm:text-base ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {result?.userAnswer}
                        </span>
                      </div>

                      {!isCorrect && (
                        <div className="flex flex-col sm:flex-row items-start space-y-1 sm:space-y-0 sm:space-x-3">
                          <span className="text-slate-500 font-medium text-xs sm:text-sm">Correct Answer:</span>
                          <span className="font-semibold text-green-600 text-sm sm:text-base">
                            {result?.correctAnswer}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Explanation */}
                    {result?.explanation && (
                      <div className="bg-white/80 rounded-xl p-3 sm:p-4 border border-slate-200">
                        <div className="flex flex-col sm:flex-row items-start space-y-1 sm:space-y-0 sm:space-x-2">
                          <span className="text-slate-500 font-medium text-xs sm:text-sm">Explanation:</span>
                          <span className="text-slate-700 text-sm sm:text-base">{result.explanation}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show quiz questions
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Button variant="secondary" onClick={handleBack}>
            <FaArrowLeft className="mr-2" />
            Back to Quiz Center
          </Button>
          <div className="text-xs sm:text-sm text-gray-600">
            Answered: {answers.filter(a => a !== null).length} / {quiz.questions.length}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-purple-100/50 p-4 sm:p-6 md:p-8 shadow-xl shadow-purple-500/5">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{quiz.title}</h2>
            <p className="text-gray-600 text-sm sm:text-base">{quiz.questions.length} Questions</p>
          </div>

          {quiz.questions.map((q, index) => {
            const options = q.options || {};
            const isSelected = answers[index];

            return (
              <div key={index} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4">
                  Q{index + 1}. {q.question}
                </h3>

                <div className="space-y-2 sm:space-y-3">
                  {['A', 'B', 'C', 'D'].map((key) => {
                    const optionText = options[key];
                    const isOptionSelected = isSelected === key;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectAnswer(index, key)}
                        className={`w-full text-left rounded-xl border px-3 sm:px-4 py-2.5 sm:py-3 transition text-sm sm:text-base ${
                          isOptionSelected
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-slate-200 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        <span className="font-semibold mr-1.5 sm:mr-2">{key}.</span>
                        {optionText}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={submitting || answers.filter(a => a !== null).length < quiz.questions.length}
            className={`w-full px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all text-sm sm:text-base ${
              submitting || answers.filter(a => a !== null).length < quiz.questions.length
                ? 'opacity-70 cursor-not-allowed'
                : ''
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </motion.button>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuizAttempt;
