import { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaDownload, FaExpand, FaCompress } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './Loader';
import toast from 'react-hot-toast';

const PDFViewerModal = ({ isOpen, onClose, fileUrl, fileName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Validate fileUrl on mount
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError("");

      const timer = setTimeout(() => {
        setLoading(false);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [isOpen, fileUrl, fileName]);

  const handleDownload = () => {
    if (!fileUrl) {
      toast.error('File URL not available');
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const handleOpenInNewTab = () => {
    if (!fileUrl) {
      toast.error('File URL not available');
      return;
    }
    window.open(fileUrl, '_blank');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleIframeLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError("Unable to load PDF. Try opening in new tab.");
    toast.error("Failed to load PDF in viewer");
  };

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isFullscreen ? 'bg-black' : 'bg-black/60 backdrop-blur-sm'}`}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`${isFullscreen ? 'w-full h-full' : 'bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden'} relative`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${isFullscreen ? 'bg-gray-900' : 'bg-gradient-to-r from-purple-50 to-pink-50'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">PDF</span>
              </div>
              <div>
                <h3 className={`font-bold ${isFullscreen ? 'text-white' : 'text-gray-900'}`}>
                  {fileName || 'Document Viewer'}
                </h3>
                <p className={`text-sm ${isFullscreen ? 'text-gray-300' : 'text-gray-500'}`}>
                  {loading ? 'Loading...' : 'Ready'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFullscreen}
                className={`p-2 rounded-lg ${isFullscreen ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'} transition-colors`}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDownload}
                className={`p-2 rounded-lg ${isFullscreen ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'} transition-colors`}
                title="Download"
              >
                <FaDownload />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`p-2 rounded-lg ${isFullscreen ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'} transition-colors`}
                title="Close"
              >
                <FaTimes />
              </motion.button>
            </div>
          </div>

          {/* PDF Content - IFRAME AS PRIMARY VIEWER */}
          <div className={`${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[600px]'} overflow-auto ${isFullscreen ? 'bg-gray-900' : 'bg-gray-100'} relative`}>
            
            {/* Show loader initially but don't block iframe */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <Loader size="lg" text="Loading PDF..." />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-red-500 text-2xl">⚠️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Open PDF</h3>
                <p className="text-gray-600 mb-4 max-w-md">{error}</p>
                <div className="flex gap-3 flex-wrap justify-center">
                  <button
                    onClick={handleOpenInNewTab}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Open in New Tab
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 border border-gray-300 transition-all"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            )}

            {/* IFRAME - Always render, even if loading is true */}
            {fileUrl && !error && (
              <iframe
                src={fileUrl}
                title={fileName || 'PDF Viewer'}
                className="w-full h-full border-0 bg-white"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{ display: loading ? 'none' : 'block' }}
              />
            )}

            {!fileUrl && !error && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-gray-400 text-2xl">📄</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No PDF Available</h3>
                <p className="text-gray-600">The file URL is not available.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {!isFullscreen && (
            <div className="p-4 border-t bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>
                  <span className="font-medium">Keyboard shortcuts:</span>
                  <span className="ml-2">Esc Close</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleOpenInNewTab}
                    className="text-purple-600 hover:underline font-medium"
                  >
                    Open in New Tab
                  </button>
                  <button
                    onClick={handleDownload}
                    className="text-purple-600 hover:underline font-medium"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PDFViewerModal;
