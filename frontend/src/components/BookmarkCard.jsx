import { useState } from 'react';
import { FaFilePdf, FaFileWord, FaFileAlt, FaEye, FaDownload, FaTrash, FaFolderOpen, FaCalendar, FaTag, FaFileImage, FaFileCode } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const BookmarkCard = ({ bookmark, onView, onDelete, onDownload }) => {
  const [deleting, setDeleting] = useState(false);

  // Get file icon and gradient based on type
  const getFileIcon = () => {
    const iconSize = "text-3xl";
    
    switch (bookmark.fileType) {
      case 'pdf':
        return {
          icon: <FaFilePdf className={iconSize} />,
          gradient: 'from-red-500 to-orange-500',
          bgClass: 'bg-red-50'
        };
      case 'docx':
        return {
          icon: <FaFileWord className={iconSize} />,
          gradient: 'from-blue-500 to-cyan-500',
          bgClass: 'bg-blue-50'
        };
      case 'txt':
        return {
          icon: <FaFileAlt className={iconSize} />,
          gradient: 'from-gray-500 to-slate-500',
          bgClass: 'bg-gray-50'
        };
      case 'png':
      case 'jpg':
      case 'jpeg':
        return {
          icon: <FaFileImage className={iconSize} />,
          gradient: 'from-purple-500 to-pink-500',
          bgClass: 'bg-purple-50'
        };
      default:
        return {
          icon: <FaFileCode className={iconSize} />,
          gradient: 'from-gray-400 to-gray-600',
          bgClass: 'bg-gray-100'
        };
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Get subject color
  const getSubjectColor = (subject) => {
    if (!subject) return 'bg-gray-100 text-gray-700';
    
    const subjectColors = {
      'mathematics': 'bg-blue-100 text-blue-700',
      'physics': 'bg-green-100 text-green-700',
      'chemistry': 'bg-purple-100 text-purple-700',
      'biology': 'bg-pink-100 text-pink-700',
      'computer science': 'bg-cyan-100 text-cyan-700',
      'english': 'bg-orange-100 text-orange-700',
      'history': 'bg-yellow-100 text-yellow-700',
      'geography': 'bg-teal-100 text-teal-700',
    };
    
    const lowerSubject = subject.toLowerCase();
    return subjectColors[lowerSubject] || 'bg-indigo-100 text-indigo-700';
  };

  // Handle delete
  const handleDelete = async (e) => {
    e.stopPropagation();

    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      setDeleting(true);

      try {
        const { deleteBookmark } = await import('../services/bookmark');
        await deleteBookmark(bookmark._id);
        toast.success('Note deleted successfully');
        if (onDelete) onDelete();
      } catch (error) {
        console.error('Delete error:', error);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.message.includes('ERR_CONNECTION_REFUSED') || error.code === 'ECONNREFUSED') {
          toast.error('Backend server is not running. Please start backend.');
        } else {
          toast.error('Failed to delete note');
        }
      } finally {
        setDeleting(false);
      }
    }
  };

  // Handle open with error handling
  const handleOpen = (e) => {
    e.stopPropagation();
    
    if (!bookmark.fileName) {
      console.error('Missing fileName in bookmark:', bookmark);
      toast.error('File information missing');
      return;
    }

    console.log("Opening bookmark:", bookmark);
    
    // Call parent's onView handler (which opens PDF viewer modal)
    if (onView) {
      onView(bookmark);
    } else {
      console.error('onView handler not provided');
      toast.error('Preview not available');
    }
  };

  // Handle download with error handling
  const handleDownload = (e) => {
    e.stopPropagation();
    
    if (!bookmark.fileName) {
      console.error('Missing fileName in bookmark:', bookmark);
      toast.error('File information missing');
      return;
    }

    console.log("Downloading bookmark:", bookmark);
    
    // Call parent's download handler
    if (onDownload) {
      onDownload(bookmark);
    } else {
      console.error('onDownload handler not provided');
      toast.error('Download not available');
    }
  };

  const { icon, gradient, bgClass } = getFileIcon();

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="card-modern bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
    >
      {/* Card Content */}
      <div className="p-4 sm:p-6">
        {/* Header Section */}
        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
          {/* File Icon */}
          <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:shadow-xl transition-all duration-300`}>
            <div className="text-white text-lg sm:text-2xl">
              {icon}
            </div>
          </div>

          {/* Title and Subject */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-1 truncate group-hover:text-purple-600 transition-colors">
              {bookmark.title}
            </h3>
            {bookmark.subject && (
              <span className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${getSubjectColor(bookmark.subject)}`}>
                {bookmark.subject}
              </span>
            )}
          </div>

          {/* Delete Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 sm:p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-all duration-200 disabled:opacity-50 flex-shrink-0"
            title="Delete"
          >
            {deleting ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-red-500/30 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaTrash className="text-base sm:text-lg" />
            )}
          </motion.button>
        </div>

        {/* Description */}
        {bookmark.description && (
          <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
            {bookmark.description}
          </p>
        )}

        {/* Tags */}
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {bookmark.tags.slice(0, 4).map((tag, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-xl text-xs font-semibold border border-purple-100 hover:border-purple-200 transition-all"
              >
                <FaTag className="text-xs" />
                <span className="text-xs">{tag}</span>
              </motion.span>
            ))}
            {bookmark.tags.length > 4 && (
              <span className="text-xs text-gray-500 font-medium px-2 py-1">
                +{bookmark.tags.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Metadata Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-2.5 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-4 text-xs">
            <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600">
              <FaCalendar className="text-gray-400 text-xs sm:text-sm" />
              <span className="font-medium text-xs">{formatDate(bookmark.uploadedAt)}</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600">
              <span className="font-medium text-xs">{formatFileSize(bookmark.fileSize)}</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-white rounded-lg text-xs font-bold text-gray-700 uppercase shadow-sm">
              {bookmark.fileType}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpen}
            className="btn-full-mobile flex-1 flex items-center justify-center gap-2 py-3 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 group-hover:from-purple-500 group-hover:to-pink-500 text-sm"
          >
            <FaEye className="text-sm" />
            <span className="text-sm">Open</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="btn-full-mobile flex items-center justify-center gap-2 py-3 sm:py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300 text-sm"
          >
            <FaDownload className="text-sm" />
            <span className="text-sm">Download</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default BookmarkCard;