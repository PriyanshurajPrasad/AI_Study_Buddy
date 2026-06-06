import { useState, useEffect, useRef } from 'react';
import { explainConcept, askDoubt } from '../api/ai';
import MainLayout from '../layouts/MainLayout';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRobot, 
  FaLightbulb, 
  FaQuestionCircle, 
  FaCopy, 
  FaClock, 
  FaRedo, 
  FaDownload, 
  FaVolumeUp,
  FaHistory,
  FaBook,
  FaBrain,
  FaDatabase,
  FaFlask,
  FaChartBar,
  FaCode,
  FaSave,
  FaMicrophone,
  FaCheckCircle,
  FaTrash
} from 'react-icons/fa';
import { IoSparkles, IoClose } from 'react-icons/io5';
import ReactMarkdown from 'react-markdown';
import { saveAIHistory, getAIHistory, deleteAIHistory } from '../services/aiHistory';

const AIAssistant = () => {
  const [activeTab, setActiveTab] = useState('explain');
  const [concept, setConcept] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const explanationRef = useRef(null);
  const answerRef = useRef(null);

  // AI History from backend + localStorage fallback
  const [aiHistory, setAIHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  // Load history on mount from MongoDB
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      console.log('Loading AI history from MongoDB on mount');
      const result = await getAIHistory({ limit: 20 });
      console.log('AI history loaded from MongoDB:', result.data?.length, 'entries');
      setAIHistory(result.data || []);
    } catch (error) {
      console.error('Error loading history from MongoDB:', error);
      setAIHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Safe date formatter
  const formatDate = (date) => {
    if (!date) return "Just now";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Just now";
    return d.toLocaleString();
  };

  // Format time for display (relative time)
  const formatTime = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Just now';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Helper to get history response with multiple field fallbacks
  const getHistoryResponse = (item) => {
    console.log("Getting response for history item:", item);
    return (
      item.response ||
      item.answer ||
      item.aiResponse ||
      item.explanation ||
      item.result ||
      item.content ||
      ""
    );
  };

  // Check if history item has a valid response
  const hasValidResponse = (item) => {
    const response = getHistoryResponse(item);
    return response && response.trim().length > 0;
  };

  // Regenerate response for history item
  const regenerateHistoryResponse = async (item) => {
    if (!hasValidResponse(item)) {
      if (item.type === 'explanation') {
        setActiveTab('explain');
        setConcept(item.query || item.question || "");
        // Trigger explanation generation
        await handleExplain({ preventDefault: () => {} });
      } else if (item.type === 'doubt') {
        setActiveTab('ask');
        setQuestion(item.query || item.question || "");
        // Trigger doubt generation
        await handleAsk({ preventDefault: () => {} });
      }
    }
  };

  // Load history item when clicked
  const loadHistoryItem = (item) => {
    console.log("Clicked history item:", item);
    const savedResponse = getHistoryResponse(item);

    if (!savedResponse) {
      console.error("History item missing response:", item);
      toast.error("This history item has no saved response. Please regenerate it.");
      return;
    }

    setActiveHistoryId(item._id || item.id);
    
    if (item.type === 'explanation') {
      setActiveTab('explain');
      setConcept(item.query || item.question || "");
      setExplanation(savedResponse);
      setLoadingExplanation(false);
    } else if (item.type === 'doubt') {
      setActiveTab('ask');
      setQuestion(item.query || item.question || "");
      setAnswer(savedResponse);
      setLoadingAnswer(false);
    }
  };

  // Helper to check if ID is a valid MongoDB ObjectId
  const isMongoId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Delete history item
  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    
    if (!id) {
      toast.error('Invalid history item ID');
      return;
    }

    try {
      // Check if it's a MongoDB ObjectId or localStorage timestamp ID
      if (!isMongoId(id)) {
        // localStorage item - delete locally only
        const { deleteHistoryFromLocal } = await import('../services/aiHistory');
        deleteHistoryFromLocal(id);
        
        // Update local state instantly
        setAIHistory(prev => prev.filter(item => (item._id || item.id) !== id));
        toast.success('History deleted');
      } else {
        // MongoDB ID - delete from backend
        await deleteAIHistory(id);
        
        // Update local state instantly
        setAIHistory(prev => prev.filter(item => (item._id || item.id) !== id));
        toast.success('History deleted');
      }
    } catch (error) {
      console.error('Error deleting history:', error);
      // Show specific error message from backend if available
      const errorMessage = error.response?.data?.message || 'Failed to delete history';
      toast.error(errorMessage);
    }
  };

  // Cleanup speech synthesis on component unmount
  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  const promptSuggestions = {
    programming: [
      { label: 'Explain React Hooks', icon: FaCode },
      { label: 'What is Binary Search?', icon: FaCode },
      { label: 'Java OOPs concepts', icon: FaCode },
    ],
    ai_ml: [
      { label: 'Machine Learning basics', icon: FaBrain },
      { label: 'Neural Networks explained', icon: FaBrain },
      { label: 'Deep Learning vs ML', icon: FaBrain },
    ],
    dbms: [
      { label: 'DBMS normalization', icon: FaDatabase },
      { label: 'SQL JOIN operations', icon: FaDatabase },
      { label: 'ACID properties in DB', icon: FaDatabase },
    ],
    science: [
      { label: 'Photosynthesis process', icon: FaFlask },
      { label: 'Newton\'s laws of motion', icon: FaFlask },
      { label: 'Thermodynamics basics', icon: FaFlask },
    ],
    aptitude: [
      { label: 'Time complexity analysis', icon: FaChartBar },
      { label: 'Data structures explained', icon: FaBook },
      { label: 'Algorithm design patterns', icon: FaChartBar },
    ],
  };

  const handleExplain = async (e) => {
    e.preventDefault();
    if (!concept.trim()) {
      toast.error('Please enter a concept to explain');
      return;
    }

    setLoadingExplanation(true);
    setExplanation(''); // Clear previous explanation

    try {
      const response = await explainConcept(concept, 'english');
      if (response.success) {
        const explanation = response.data?.explanation || response.explanation || '';
        setExplanation(explanation);
        
        // Save to history with fallback
        await saveAIHistory({
          type: 'explanation',
          query: concept,
          response: explanation,
          createdAt: new Date().toISOString()
        });
        
        // Reload history
        await loadHistory();
        
        toast.success('Explanation generated successfully');
      } else {
        toast.error(response.message || 'Failed to generate explanation');
      }
    } catch (error) {
      toast.error('AI service failed. Please check backend API key.');
      console.error('Explanation error:', error);
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoadingAnswer(true);
    setAnswer(''); // Clear previous answer

    try {
      const response = await askDoubt(question);
      if (response.success) {
        const answer = response.data?.answer || response.answer || '';
        setAnswer(answer);
        
        // Save to history with fallback
        await saveAIHistory({
          type: 'doubt',
          query: question,
          response: answer,
          createdAt: new Date().toISOString()
        });
        
        // Reload history
        await loadHistory();
        
        toast.success('Answer generated successfully');
      } else {
        toast.error(response.message || 'Failed to generate answer');
      }
    } catch (error) {
      toast.error('AI service failed. Please check backend API key.');
      console.error('Answer error:', error);
    } finally {
      setLoadingAnswer(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const downloadAsText = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded successfully');
  };

  const speakText = (text, type) => {
    if (!text) {
      toast.error('No text to speak');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    // Clean the text by removing markdown syntax
    const plainText = text
      .replace(/[#_*`>-]/g, "") // Remove markdown characters
      .replace(/\n+/g, " ") // Replace newlines with spaces
      .replace(/\s+/g, " ") // Remove extra spaces
      .trim();

    if (!plainText) {
      toast.error('No text to speak after cleaning');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
      toast.error('Failed to speak text');
    };

    window.speechSynthesis.speak(utterance);
  };

  const regenerateResponse = () => {
    if (activeTab === 'explain' && concept) {
      handleExplain(new Event('submit'));
    } else if (activeTab === 'ask' && question) {
      handleAsk(new Event('submit'));
    }
  };

  const handlePromptClick = (prompt) => {
    if (activeTab === 'explain') {
      setConcept(prompt);
    } else {
      setQuestion(prompt);
    }
  };

  // Auto-scroll to top when explanation updates
  useEffect(() => {
    if (explanation && explanationRef.current) {
      explanationRef.current.scrollTop = 0;
    }
  }, [explanation]);

  useEffect(() => {
    if (answer && answerRef.current) {
      answerRef.current.scrollTop = 0;
    }
  }, [answer]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 spacing-responsive">
        {/* Premium Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 sm:mb-6 md:mb-8"
        >
          <div className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-purple-100/50 p-4 sm:p-6 md:p-8 relative overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-0 left-0 w-24 h-24 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full blur-3xl opacity-20"
            />

            <div className="relative">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 md:gap-8">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/20"
                  >
                    <FaRobot className="text-xl sm:text-2xl md:text-3xl text-white" />
                  </motion.div>
                  <div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="inline-flex items-center px-2.5 sm:px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-purple-200/50 rounded-full mb-1.5 sm:mb-2"
                    >
                      <IoSparkles className="text-purple-500 mr-1 sm:mr-1.5 text-xs sm:text-sm" />
                      <span className="text-xs font-semibold text-purple-700">Powered by AI</span>
                    </motion.div>
                    <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-900">
                      AI <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">Study Assistant</span>
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-4 sm:mb-6 md:mb-8"
        >
          <div className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('explain')}
              className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap text-xs sm:text-sm md:text-base ${
                activeTab === 'explain'
                  ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <FaLightbulb className={activeTab === 'explain' ? 'text-white' : 'text-gray-400'} />
              <span>Explain Concept</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('ask')}
              className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap text-xs sm:text-sm md:text-base ${
                activeTab === 'ask'
                  ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <FaQuestionCircle className={activeTab === 'ask' ? 'text-white' : 'text-gray-400'} />
              <span>Ask Doubt</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Input Section */}
          <div className="lg:col-span-1 space-y-3 sm:space-y-4 md:space-y-6 order-1 lg:order-1">
            {/* AI Prompt Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="glass-enhanced rounded-2xl border border-gray-200/50 p-5 md:p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 rounded-xl ${activeTab === 'explain' ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}>
                    {activeTab === 'explain' ? <FaLightbulb className="w-5 h-5 text-white" /> : <FaQuestionCircle className="w-5 h-5 text-white" />}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{activeTab === 'explain' ? 'AI Explanation' : 'Ask a Question'}</h2>
                </div>

                <form onSubmit={activeTab === 'explain' ? handleExplain : handleAsk} className="space-y-4">
                  <div>
                    <textarea
                      value={activeTab === 'explain' ? concept : question}
                      onChange={(e) => activeTab === 'explain' ? setConcept(e.target.value) : setQuestion(e.target.value)}
                      placeholder={activeTab === 'explain' ? 'Enter a topic to explain (e.g., DBMS Normalization, React Hooks)...' : 'Ask your doubt here...'}
                      className="input-modern w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-500/10 transition-all resize-none h-32 md:h-40"
                      rows={4}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loadingExplanation || loadingAnswer || !(activeTab === 'explain' ? concept.trim() : question.trim())}
                    className={`btn-full-mobile w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-medium transition-all duration-200 min-h-[44px] ${
                      loadingExplanation || loadingAnswer
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30'
                    }`}
                  >
                    {loadingExplanation || loadingAnswer ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></div>
                        <span>AI is thinking...</span>
                      </>
                    ) : (
                      <>
                        <IoSparkles className="w-5 h-5" />
                        <span>{activeTab === 'explain' ? 'Generate Explanation' : 'Get Answer'}</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>

            {/* Recent History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-5 md:p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                    <FaHistory className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">AI History</h2>
                </div>

                {loadingHistory ? (
                  <div className="text-center py-4 text-gray-500">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin mx-auto mb-2"></div>
                    <p>Loading history...</p>
                  </div>
                ) : aiHistory.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <FaClock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No history yet. Start asking questions!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {aiHistory.map((item) => (
                      <motion.div
                        key={item._id || item.id}
                        whileHover={{ x: 4 }}
                        role="button"
                        tabIndex={0}
                        className={`w-full flex items-center space-x-3 p-3 bg-white border rounded-xl hover:shadow-md transition-all text-left relative group cursor-pointer ${
                          hasValidResponse(item) ? 'border-gray-200 hover:border-purple-200' : 'border-yellow-200 hover:border-yellow-300 bg-yellow-50/50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${item.type === 'explanation' ? 'bg-blue-100 text-blue-600' : 'bg-cyan-100 text-cyan-600'}`}>
                          {item.type === 'explanation' ? <FaLightbulb className="w-4 h-4" /> : <FaQuestionCircle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0" onClick={() => loadHistoryItem(item)}>
                          <p className="text-sm font-medium text-gray-900 truncate">{item.query}</p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${item.type === 'explanation' ? 'bg-blue-100 text-blue-600' : 'bg-cyan-100 text-cyan-600'}`}>
                              {item.type === 'explanation' ? 'Explanation' : 'Doubt'}
                            </span>
                            <span className="text-xs text-gray-500">{formatTime(item.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {!hasValidResponse(item) && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                regenerateHistoryResponse(item);
                              }}
                              className="p-2 hover:bg-green-100 rounded-lg transition-all"
                              title="Regenerate"
                            >
                              <FaRedo className="w-3 h-3 text-green-600" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteHistory(item._id || item.id, e);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-100 rounded-lg transition-all"
                            title="Delete"
                          >
                            <FaTrash className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Prompt Suggestions by Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="glass-enhanced rounded-2xl border border-gray-200/50 p-5 md:p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
                    <FaSave className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Try These Prompts</h2>
                </div>

                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {Object.entries(promptSuggestions).map(([category, prompts]) => (
                    <div key={category} className="space-y-2">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide capitalize">{category.replace('_', ' ')}</h3>
                      {prompts.map((prompt, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ x: 2, scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handlePromptClick(prompt.label)}
                          className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:border-purple-200 hover:shadow-md transition-all text-left min-h-[44px]"
                        >
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <prompt.icon className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="text-sm text-gray-700">{prompt.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Response Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 sm:p-5 md:p-6 shadow-sm h-auto lg:h-[calc(100vh-200px)] lg:overflow-y-auto"
            >
              {/* Response Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${loadingExplanation || loadingAnswer ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}>
                    {loadingExplanation || loadingAnswer ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <IoSparkles className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {loadingExplanation || loadingAnswer ? 'AI is thinking...' : activeTab === 'explain' ? 'AI Explanation' : 'AI Response'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {loadingExplanation || loadingAnswer ? 'Generating detailed response...' : 'Powered by Groq AI'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {(explanation || answer) && (
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyToClipboard(activeTab === 'explain' ? explanation : answer)}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Copy"
                    >
                      <FaCopy className="w-4 h-4 text-gray-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => downloadAsText(activeTab === 'explain' ? explanation : answer, activeTab === 'explain' ? 'explanation' : 'answer')}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Download"
                    >
                      <FaDownload className="w-4 h-4 text-gray-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => speakText(activeTab === 'explain' ? explanation : answer, activeTab)}
                      className={`p-2 rounded-lg transition-colors ${isSpeaking ? 'bg-purple-100 hover:bg-purple-200' : 'bg-gray-100 hover:bg-gray-200'}`}
                      title={isSpeaking ? "Stop speaking" : "Read aloud"}
                    >
                      <FaVolumeUp className={`w-4 h-4 ${isSpeaking ? 'text-purple-600' : 'text-gray-600'}`} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={regenerateResponse}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Regenerate"
                    >
                      <FaRedo className="w-4 h-4 text-gray-600" />
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Response Content */}
              {loadingExplanation || loadingAnswer ? (
                <div className="min-h-64 md:min-h-80 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse mx-auto">
                      <FaRobot className="text-3xl text-white" />
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">AI is generating your response</p>
                      <p className="text-sm text-gray-400">This may take a few seconds...</p>
                    </div>
                    <div className="flex justify-center space-x-1">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                          className="w-2 h-2 bg-purple-500 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  ref={activeTab === 'explain' ? explanationRef : answerRef}
                  className="h-auto min-h-fit max-h-[70vh] overflow-y-auto pr-2"
                >
                  {explanation ? (
                    <div className="prose prose-sm md:prose-base max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-6 mb-3">{children}</h2>,
                          h3: ({ children }) => <h3 className="font-semibold text-slate-800 mt-5 mb-3">{children}</h3>,
                          h4: ({ children }) => <h4 className="font-semibold text-slate-700 mt-4 mb-2">{children}</h4>,
                          p: ({ children }) => <p className="text-slate-700 leading-relaxed mb-4">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-5 space-y-2 mb-4">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-2 mb-4">{children}</ol>,
                          li: ({ children }) => <li className="text-slate-700">{children}</li>,
                          code: ({ inline, children }) => 
                            inline 
                              ? <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm text-purple-700">{children}</code>
                              : <code className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto block text-sm">{children}</code>,
                          pre: ({ children }) => <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto mb-4">{children}</pre>,
                          blockquote: ({ children }) => <blockquote className="border-l-4 border-purple-500 pl-4 italic text-slate-600 mb-4">{children}</blockquote>,
                          strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                        }}
                      >
                        {explanation}
                      </ReactMarkdown>
                    </div>
                  ) : answer ? (
                    <div className="prose prose-sm md:prose-base max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-6 mb-3">{children}</h2>,
                          h3: ({ children }) => <h3 className="font-semibold text-slate-800 mt-5 mb-3">{children}</h3>,
                          h4: ({ children }) => <h4 className="font-semibold text-slate-700 mt-4 mb-2">{children}</h4>,
                          p: ({ children }) => <p className="text-slate-700 leading-relaxed mb-4">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-5 space-y-2 mb-4">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-2 mb-4">{children}</ol>,
                          li: ({ children }) => <li className="text-slate-700">{children}</li>,
                          code: ({ inline, children }) => 
                            inline 
                              ? <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm text-purple-700">{children}</code>
                              : <code className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto block text-sm">{children}</code>,
                          pre: ({ children }) => <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto mb-4">{children}</pre>,
                          blockquote: ({ children }) => <blockquote className="border-l-4 border-purple-500 pl-4 italic text-slate-600 mb-4">{children}</blockquote>,
                          strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                        }}
                      >
                        {answer}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
                        <IoSparkles className="text-4xl text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium">No response yet</p>
                      <p className="text-sm text-gray-400 max-w-sm">Enter a topic or question and click generate to see AI-powered response</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </MainLayout>
  );
};

export default AIAssistant;
