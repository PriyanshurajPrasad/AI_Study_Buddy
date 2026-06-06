import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import { getAIHistory, deleteAIHistory, clearAIHistory } from '../services/aiHistory';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHistory, 
  FaSearch, 
  FaFilter, 
  FaTrash, 
  FaLightbulb, 
  FaQuestionCircle,
  FaArrowLeft,
  FaCopy,
  FaDownload,
  FaExclamationTriangle
} from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { FaMicrophone } from 'react-icons/fa';

const AIHistory = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Load history from MongoDB
  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAIHistory({ 
        limit: 100,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchQuery || undefined
      });
      setHistory(result.data || []);
      setError(null);
    } catch (error) {
      setError('Failed to load history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, searchQuery]);

  // Load history on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated, loadHistory]);

  // Filter history based on search and type
  const filteredHistory = history.filter(item => {
    const matchesSearch = !searchQuery || 
      item.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.response.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Delete single history item from MongoDB
  const handleDeleteItem = async (id) => {
    try {
      await deleteAIHistory(id);
      toast.success('History deleted');
      loadHistory();
    } catch (error) {
      toast.error('Failed to delete history');
    }
  };

  // Clear all history from MongoDB
  const handleClearAll = async () => {
    try {
      await clearAIHistory();
      toast.success('All history cleared');
      loadHistory();
    } catch (error) {
      toast.error('Failed to clear history');
    }
    setShowDeleteConfirm(false);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Download as text
  const downloadAsText = (item) => {
    const text = `Query: ${item.query}\n\nResponse:\n${item.response}\n\nType: ${item.type}\nDate: ${new Date(item.createdAt).toLocaleString()}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.type}-${item.query.substring(0, 20)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded successfully');
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
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

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FaHistory className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">Please login to view your AI history</h2>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-xl">
                <FaHistory className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI History</h1>
                <p className="text-gray-500">View your past AI interactions</p>
              </div>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <FaArrowLeft className="text-gray-600" />
              <span className="text-gray-600">Back</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search queries or responses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-500/10"
                />
              </div>

              {/* Type Filter */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`flex-1 px-4 py-2 rounded-xl transition-colors ${
                    typeFilter === 'all'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTypeFilter('explanation')}
                  className={`flex-1 px-4 py-2 rounded-xl transition-colors ${
                    typeFilter === 'explanation'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaLightbulb className="inline mr-1" />
                  Explanations
                </button>
                <button
                  onClick={() => setTypeFilter('doubt')}
                  className={`flex-1 px-4 py-2 rounded-xl transition-colors ${
                    typeFilter === 'doubt'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaQuestionCircle className="inline mr-1" />
                  Doubts
                </button>
              </div>

              {/* Clear All */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
              >
                <FaTrash />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredHistory.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <FaHistory className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No history found</h3>
            <p className="text-gray-500">
              {searchQuery || typeFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start asking questions to build your history'}
            </p>
          </div>
        )}

        {/* History List */}
        {!loading && !error && filteredHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filteredHistory.map((item) => (
              <motion.div
                key={item._id || item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      item.type === 'explanation' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-cyan-100 text-cyan-600'
                    }`}>
                      {item.type === 'explanation' 
                        ? <FaLightbulb className="w-4 h-4" /> 
                        : <FaQuestionCircle className="w-4 h-4" />
                      }
                    </div>
                    <div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.type === 'explanation'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-cyan-100 text-cyan-600'
                      }`}>
                        {item.type === 'explanation' ? 'Explanation' : 'Doubt'}
                      </span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-sm text-gray-500">{formatTime(item.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(item.response)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy response"
                    >
                      <FaCopy className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => downloadAsText(item)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Download"
                    >
                      <FaDownload className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => {
                        setItemToDelete(item);
                        setShowDeleteConfirm(true);
                      }}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Query */}
                <div 
                  onClick={() => setSelectedItem(item)}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    <span className="text-gray-400">Query:</span> {item.query}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {item.response.substring(0, 200)}...
                  </p>
                  <p className="text-xs text-purple-600 mt-2">Click to view full response</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Selected Item Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      selectedItem.type === 'explanation' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-cyan-100 text-cyan-600'
                    }`}>
                      {selectedItem.type === 'explanation' 
                        ? <FaLightbulb className="w-4 h-4" /> 
                        : <FaQuestionCircle className="w-4 h-4" />
                      }
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {selectedItem.type === 'explanation' ? 'Explanation' : 'Doubt'}
                      </h3>
                      <p className="text-sm text-gray-500">{formatTime(selectedItem.createdAt)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ×
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Query:</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{selectedItem.query}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Response:</p>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{selectedItem.response}</ReactMarkdown>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t flex items-center justify-end space-x-2">
                  <button
                    onClick={() => copyToClipboard(selectedItem.response)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <FaCopy />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => downloadAsText(selectedItem)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <FaDownload />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => {
                      setItemToDelete(selectedItem);
                      setSelectedItem(null);
                      setShowDeleteConfirm(true);
                    }}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors flex items-center space-x-2"
                  >
                    <FaTrash />
                    <span>Delete</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaExclamationTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {itemToDelete ? 'Delete this item?' : 'Clear all history?'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {itemToDelete 
                      ? 'This action cannot be undone.'
                      : 'This will delete all your AI history. This action cannot be undone.'
                    }
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setItemToDelete(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (itemToDelete) {
                          handleDeleteItem(itemToDelete._id || itemToDelete.id);
                        } else {
                          handleClearAll();
                        }
                        setShowDeleteConfirm(false);
                        setItemToDelete(null);
                      }}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    >
                      {itemToDelete ? 'Delete' : 'Clear All'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};

export default AIHistory;
