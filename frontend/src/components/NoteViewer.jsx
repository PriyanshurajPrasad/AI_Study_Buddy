import { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaExternalLinkAlt, FaFilePdf, FaFileWord, FaFileAlt, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const NoteViewer = ({ isOpen, bookmark, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && bookmark) {
      loadContent();
    }
  }, [isOpen, bookmark]);

  const loadContent = async () => {
    setLoading(true);
    setError(null);

    try {
      const { getBookmarkFileUrl } = require('../services/bookmark');
      const fileUrl = getBookmarkFileUrl(bookmark._id);

      // Determine how to handle based on file type
      if (bookmark.fileType === 'pdf') {
        // PDF can be displayed in iframe
        setContent({ type: 'pdf', url: fileUrl });
      } else if (bookmark.fileType === 'txt') {
        // TXT needs to be fetched and displayed
        const response = await fetch(fileUrl);
        const text = await response.text();
        setContent({ type: 'text', data: text });
      } else if (bookmark.fileType === 'docx') {
        // DOCX cannot be previewed directly
        setContent({ type: 'unsupported', url: fileUrl });
      } else if (bookmark.fileType === 'png' || bookmark.fileType === 'jpg' || bookmark.fileType === 'jpeg') {
        // Images can be displayed
        setContent({ type: 'image', url: fileUrl });
      } else {
        setContent({ type: 'unsupported', url: fileUrl });
      }
    } catch (err) {
      console.error('Error loading content:', err);
      setError('Failed to load note content');
      toast.error('Failed to load note content');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const { getBookmarkFileUrl } = require('../services/bookmark');
    const fileUrl = getBookmarkFileUrl(bookmark._id);
    
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = bookmark.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              {bookmark.fileType === 'pdf' && <FaFilePdf className="text-xl text-white" />}
              {bookmark.fileType === 'docx' && <FaFileWord className="text-xl text-white" />}
              {bookmark.fileType === 'txt' && <FaFileAlt className="text-xl text-white" />}
              {(bookmark.fileType === 'png' || bookmark.fileType === 'jpg' || bookmark.fileType === 'jpeg') && <FaFileAlt className="text-xl text-white" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{bookmark.title}</h2>
              <p className="text-sm text-gray-500">{bookmark.originalName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse mx-auto">
                  <FaSpinner className="text-2xl text-white animate-spin" />
                </div>
                <p className="text-gray-600 font-medium">Loading note...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <FaTimes className="text-2xl text-red-500" />
                </div>
                <p className="text-gray-600 font-medium">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    loadContent();
                  }}
                  className="text-purple-600 hover:underline"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : content?.type === 'pdf' ? (
            <iframe
              src={`${content.url}#toolbar=0`}
              className="w-full h-full border rounded-xl"
              style={{ minHeight: '600px' }}
            />
          ) : content?.type === 'text' ? (
            <div className="h-full overflow-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono bg-gray-50 p-4 rounded-xl">
                {content.data}
              </pre>
            </div>
          ) : content?.type === 'image' ? (
            <div className="flex items-center justify-center h-full">
              <img
                src={content.url}
                alt={bookmark.title}
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            </div>
          ) : content?.type === 'unsupported' ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <FaExternalLinkAlt className="text-4xl text-white" />
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-xl font-bold text-gray-900">Preview Not Available</h3>
                <p className="text-gray-600 max-w-sm">
                  {bookmark.fileType === 'docx' ? 'DOCX files cannot be previewed directly.' : 'This file type cannot be previewed directly.'}
                </p>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium"
                  >
                    <FaDownload />
                    <span>Download</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(content.url, '_blank')}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                  >
                    <FaExternalLinkAlt />
                    <span>Open in New Tab</span>
                  </motion.button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            <span className="font-medium">File:</span> {bookmark.originalName}
          </div>
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
            >
              <FaDownload />
              <span>Download</span>
            </motion.button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NoteViewer;