import { useState } from 'react';
import { useNotes } from '../hooks/useNotes';
import { uploadNote, deleteNote } from '../api/notes';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import FileUpload from '../components/FileUpload';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { FaBook, FaTrash, FaEye, FaPlus, FaFilePdf, FaFileAlt, FaCloudUploadAlt, FaFileWord, FaEllipsisV, FaTag, FaCalendar, FaFile, FaDownload } from 'react-icons/fa';
import MainLayout from '../layouts/MainLayout';
import toast from 'react-hot-toast';
import { formatDate, truncateText } from '../utils/helpers';
import { motion } from 'framer-motion';

const Notes = () => {
  const { notes, loading, error, refetchNotes } = useNotes();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', file: null });
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (file) => {
    setUploadData({ ...uploadData, file });
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadData.title || !uploadData.file) {
      toast.error('Please provide title and file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadData.title);
      formData.append('file', uploadData.file);

      const response = await uploadNote(formData);
      if (response.success) {
        toast.success('Note uploaded successfully');
        setShowUploadModal(false);
        setUploadData({ title: '', file: null });
        refetchNotes();
      }
    } catch (error) {
      // Error handled by axios interceptor
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await deleteNote(noteId);
      if (response.success) {
        toast.success('Note deleted successfully');
        refetchNotes();
      }
    } catch (error) {
      // Error handled by axios interceptor
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension === 'pdf') return FaFilePdf;
    if (extension === 'doc' || extension === 'docx') return FaFileWord;
    return FaFile;
  };

  const getFileColor = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension === 'pdf') return 'from-red-500 to-pink-500';
    if (extension === 'doc' || extension === 'docx') return 'from-blue-500 to-cyan-500';
    return 'from-gray-500 to-slate-500';
  };

  const getFileBgColor = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension === 'pdf') return 'bg-red-50';
    if (extension === 'doc' || extension === 'docx') return 'bg-blue-50';
    return 'bg-gray-50';
  };

  const getFileTextColor = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension === 'pdf') return 'text-red-600';
    if (extension === 'doc' || extension === 'docx') return 'text-blue-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <Loader size="lg" text="Loading notes..." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
        {/* Page Header with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                My <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">Notes</span>
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Upload and manage your AI-powered study materials.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUploadModal(true)}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300 flex items-center space-x-2 text-sm sm:text-base"
            >
              <FaCloudUploadAlt className="text-base sm:text-lg" />
              <span>Upload Notes</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Upload Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 sm:mb-8 bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 border border-purple-100 rounded-2xl p-3 sm:p-4 flex items-center justify-between"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <FaCloudUploadAlt className="text-purple-500 text-sm sm:text-base sm:text-lg" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-800">Supported file formats</p>
              <p className="text-xs text-gray-500">PDF, DOCX, TXT - Max 10MB per file</p>
            </div>
          </div>
        </motion.div>

        {/* Notes Grid or Empty State */}
        {notes.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {notes.map((note, index) => {
                const FileIcon = getFileIcon(note.originalFileName);
                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ 
                      y: -6,
                      boxShadow: '0 20px 40px -12px rgba(139, 92, 246, 0.25)',
                      borderColor: 'rgba(139, 92, 246, 0.3)'
                    }}
                    className="relative group"
                  >
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 p-5 sm:p-6 transition-all duration-300 h-full flex flex-col shadow-lg shadow-gray-200/50 hover:shadow-xl">
                      {/* Top Section */}
                      <div className="flex items-start justify-between mb-4 sm:mb-5">
                        {/* Left: PDF Icon Container */}
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
                            <FileIcon className="text-white text-xl sm:text-2xl" />
                          </div>
                          
                          {/* Center: Title and Subject Badge */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                              {note.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-xs font-medium">
                                <FaBook className="mr-1.5 text-xs" />
                                Study Material
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: 3-dot Action Menu */}
                        <div className="relative flex-shrink-0 ml-2">
                          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <FaEllipsisV className="text-gray-400" />
                          </button>
                        </div>
                      </div>

                      {/* Description Preview */}
                      {note.summary && (
                        <p className="text-sm text-gray-600 mb-4 sm:mb-5 line-clamp-2 min-h-[2.5rem]">
                          {note.summary}
                        </p>
                      )}

                      {/* File Info Section */}
                      <div className="flex items-center space-x-3 mb-4 sm:mb-5 bg-gray-50/80 rounded-xl px-3 py-2">
                        <span className="flex items-center text-xs text-gray-500 space-x-1.5">
                          <FaCalendar className="text-gray-400" />
                          <span>{formatDate(note.createdAt)}</span>
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{(note.fileSize || 0) / 1024 < 1024 ? `${Math.round((note.fileSize || 0) / 1024)} KB` : `${Math.round((note.fileSize || 0) / 1024 / 1024)} MB`}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">PDF</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3 mt-auto">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => window.location.href = `/notes/${note.id}`}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/35 transition-all duration-300"
                        >
                          <FaEye className="text-sm" />
                          <span>Open Note</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center justify-center space-x-2 px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold text-sm hover:border-purple-300 hover:text-purple-600 transition-all duration-300"
                        >
                          <FaDownload className="text-sm" />
                          <span className="hidden sm:inline">Download</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200/50 p-12 md:p-20 text-center relative overflow-hidden">
              {/* Decorative Background */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1.2, 1, 1.2],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-full blur-3xl"
              />

              {/* Main Content */}
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-8 inline-block"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                    <FaBook className="text-3xl text-white" />
                  </div>
                </motion.div>

                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Your Knowledge Library is Empty
                </h2>
                <p className="text-gray-600 text-base mb-8 max-w-md mx-auto">
                  Upload notes, PDFs, and study materials to build your personal learning library.
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUploadModal(true)}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white rounded-2xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 transition-all duration-300 inline-flex items-center space-x-2"
                >
                  <FaCloudUploadAlt className="text-lg" />
                  <span>+ Upload Note</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Premium Upload Modal */}
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">Upload New Note</h2>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadData({ title: '', file: null });
                    }}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-gray-500 text-sm">Upload your study materials to get AI-powered insights</p>
              </div>

              <form onSubmit={handleUpload} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    placeholder="Enter note title"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    File <span className="text-red-500">*</span>
                  </label>
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    acceptedTypes={['.pdf', '.docx', '.txt']}
                  />
                  <p className="text-xs text-gray-400 mt-2">Supported formats: PDF, DOCX, TXT (Max 10MB)</p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadData({ title: '', file: null });
                    }}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <FaCloudUploadAlt />
                        <span>Upload</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default Notes;
