import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookmarks } from '../services/bookmark';
import BookmarkUploadModal from '../components/BookmarkUploadModal';
import BookmarkCard from '../components/BookmarkCard';
import PDFViewerModal from '../components/PDFViewerModal';
import Loader from '../components/Loader';
import MainLayout from '../layouts/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaSearch, FaFilter, FaSort, FaFolderOpen, FaFilePdf, FaFileWord, FaFileAlt, FaSpinner, FaBug } from 'react-icons/fa';
import { IoSparkles } from 'react-icons/io5';
import toast from 'react-hot-toast';

const Bookmarks = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to safely construct PDF URL
  const getPdfUrl = (note) => {
    const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
    
    console.log("=== PDF URL CONSTRUCTION ===");
    console.log("Note:", note);
    console.log("API_BASE:", API_BASE);
    
    if (note.fileUrl?.startsWith("http")) {
      console.log("Using fileUrl (starts with http):", note.fileUrl);
      return note.fileUrl;
    }
    if (note.fileUrl) {
      const url = `${API_BASE}${note.fileUrl}`;
      console.log("Using fileUrl with API_BASE:", url);
      return url;
    }
    if (note.filePath?.startsWith("http")) {
      console.log("Using filePath (starts with http):", note.filePath);
      return note.filePath;
    }
    if (note.fileName) {
      const url = `${API_BASE}/uploads/bookmarks/${note.fileName}`;
      console.log("Using fileName with API_BASE:", url);
      return url;
    }
    console.log("No valid URL found");
    return "";
  };
  
  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // PDF viewer state
  const [selectedBookmark, setSelectedBookmark] = useState(null);
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching bookmarks from MongoDB");
      const response = await getBookmarks();
      
      console.log("FETCH BOOKMARKS RESPONSE:", response);
      
      // Normalize response keys - backend returns { success: true, data: [...], count: n }
      const fetchedNotes =
        response.notes ||
        response.bookmarks ||
        response.data ||
        response.note ||
        [];
      
      console.log("PARSED BOOKMARKS:", fetchedNotes);
      console.log("Number of bookmarks:", fetchedNotes.length);
      
      setBookmarks(Array.isArray(fetchedNotes) ? fetchedNotes : [fetchedNotes]);
    } catch (err) {
      console.error('Error loading bookmarks from MongoDB:', err);
      setError('Failed to load bookmarks');
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load bookmarks on mount - only once when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Loading bookmarks on mount - isAuthenticated:", isAuthenticated);
      loadBookmarks();
    }
  }, [isAuthenticated, loadBookmarks]);

  // Apply filters when bookmarks or filters change
  useEffect(() => {
    let filtered = [...bookmarks];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bookmark =>
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.subject?.toLowerCase().includes(query) ||
        bookmark.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // File type filter
    if (fileTypeFilter !== 'all') {
      filtered = filtered.filter(bookmark => bookmark.fileType === fileTypeFilter);
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredBookmarks(filtered);
  }, [bookmarks, searchQuery, fileTypeFilter, sortBy]);

  const handleUploadSuccess = (uploadedNote) => {
    console.log("UPLOAD SUCCESS CALLBACK CALLED WITH:", uploadedNote);
    
    // Close modal and refetch bookmarks from backend to ensure data persistence
    setIsUploadModalOpen(false);
    toast.success('Note uploaded successfully to MongoDB');
    
    // Refetch bookmarks from MongoDB
    loadBookmarks();
  };

  const handleViewNote = (bookmark) => {
    console.log("Viewing bookmark:", bookmark);
    setSelectedBookmark(bookmark);
    setIsPDFViewerOpen(true);
  };

  const handleDownload = (bookmark) => {
    console.log("Downloading bookmark:", bookmark);
    
    if (!bookmark.fileName) {
      toast.error('File information missing');
      return;
    }

    const fileUrl = `http://localhost:5000/uploads/bookmarks/${bookmark.fileName}`;
    console.log("Download URL:", fileUrl);
    
    try {
      // Create download link
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = bookmark.originalName || bookmark.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDeleteSuccess = () => {
    loadBookmarks();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFileTypeFilter('all');
    setSortBy('newest');
  };

  const getFileTypeCount = (type) => {
    return bookmarks.filter(b => b.fileType === type).length;
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <Loader size="lg" text="Loading..." />
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <FaFolderOpen className="text-3xl text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 text-center max-w-md">
            Please login to access your saved notes.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 spacing-responsive">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 sm:mb-6 lg:mb-8"
        >
          <div className="glass-enhanced rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 right-0 w-24 h-24 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full blur-3xl opacity-20"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-0 left-0 w-20 h-20 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full blur-3xl opacity-20"
            />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/20"
                >
                  <FaFolderOpen className="text-xl sm:text-2xl lg:text-3xl text-white" />
                </motion.div>
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="inline-flex items-center px-2.5 sm:px-3 py-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50 rounded-full mb-1.5 sm:mb-2"
                  >
                    <IoSparkles className="text-purple-500 mr-1 sm:mr-1.5 text-xs sm:text-sm" />
                    <span className="text-xs font-semibold text-purple-700">Personal Library</span>
                  </motion.div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                    Saved <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">Notes</span>
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl">
                    Upload, organize, and access your study materials anytime
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUploadModalOpen(true)}
                className="btn-full-mobile flex items-center space-x-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all text-sm min-h-[44px]"
              >
                <FaUpload />
                <span>Upload Notes</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-4 sm:mb-6"
        >
          <div className="glass-enhanced rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              {/* Search */}
              <div className="flex-1 relative w-full">
                <FaSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by title, subject, or tag..."
                  className="input-modern w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm sm:text-base"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-modern flex items-center justify-center space-x-2 px-3 sm:px-4 py-3 sm:py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm sm:text-base min-h-[44px]"
              >
                <FaFilter />
                <span className="hidden sm:inline">Filters</span>
              </button>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-modern px-3 sm:px-4 py-3 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm sm:text-base min-h-[44px]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">By Title</option>
              </select>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="md:hidden mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFileTypeFilter('all')}
                    className={`px-4 py-3 rounded-lg transition-all min-h-[44px] ${
                      fileTypeFilter === 'all' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFileTypeFilter('pdf')}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all min-h-[44px] ${
                      fileTypeFilter === 'pdf' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaFilePdf /> PDF
                  </button>
                  <button
                    onClick={() => setFileTypeFilter('docx')}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all min-h-[44px] ${
                      fileTypeFilter === 'docx' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaFileWord /> DOCX
                  </button>
                  <button
                    onClick={() => setFileTypeFilter('txt')}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all min-h-[44px] ${
                      fileTypeFilter === 'txt' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaFileAlt /> TXT
                  </button>
                </div>
              </motion.div>
            )}

            {/* Desktop Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden md:flex items-center space-x-2"
              >
                <div className="h-px bg-gray-200 flex-1"></div>
                <button
                  onClick={() => setFileTypeFilter('all')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    fileTypeFilter === 'all' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({bookmarks.length})
                </button>
                <button
                  onClick={() => setFileTypeFilter('pdf')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    fileTypeFilter === 'pdf' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaFilePdf /> PDF ({getFileTypeCount('pdf')})
                </button>
                <button
                  onClick={() => setFileTypeFilter('docx')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    fileTypeFilter === 'docx' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaFileWord /> DOCX ({getFileTypeCount('docx')})
                </button>
                <button
                  onClick={() => setFileTypeFilter('txt')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    fileTypeFilter === 'txt' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaFileAlt /> TXT ({getFileTypeCount('txt')})
                </button>
                <div className="h-px bg-gray-200 flex-1"></div>
                {(searchQuery || fileTypeFilter !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="text-purple-600 hover:underline text-sm"
                  >
                    Clear filters
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader size="lg" text="Loading notes..." />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FaBug className="text-3xl text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Notes</h3>
              <p className="text-gray-600 text-center max-w-md mb-4">{error}</p>
              <button
                onClick={loadBookmarks}
                className="text-purple-600 hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="empty-notes-card" style={{
              maxWidth: '520px',
              margin: '80px auto',
              padding: '48px 32px',
              borderRadius: '28px',
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
              textAlign: 'center'
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mx-auto mb-8"
                style={{
                  width: '96px',
                  height: '96px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)'
                }}
              >
                <FaFolderOpen className="text-4xl text-white" />
              </motion.div>
              
              <h3 style={{
                fontSize: '28px',
                fontWeight: '800',
                color: '#0f172a',
                marginBottom: '16px'
              }}>
                No saved notes yet
              </h3>
              
              <p style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#64748b',
                maxWidth: '420px',
                margin: '0 auto 24px auto'
              }}>
                Upload your first note to get started with your AI-powered learning journey. Save and organize your study materials in one place.
              </p>
              
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsUploadModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                  borderRadius: '16px',
                  padding: '16px 28px',
                  fontWeight: '700',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '16px'
                }}
              >
                <FaUpload />
                <span>Upload Your First Note</span>
              </motion.button>
              
              <p style={{
                fontSize: '13px',
                color: '#94a3b8',
                marginTop: '16px',
                fontWeight: '500'
              }}>
                Supported: PDF, DOCX, TXT, PNG, JPG
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 grid-responsive-4">
              {filteredBookmarks.length === 0 && (searchQuery || fileTypeFilter !== 'all') ? (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaSearch className="text-2xl text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    No notes match your search criteria
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-purple-600 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filteredBookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark._id}
                    bookmark={bookmark}
                    onView={handleViewNote}
                    onDownload={handleDownload}
                    onDelete={handleDeleteSuccess}
                  />
                ))
              )}
            </div>
          )}
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {isUploadModalOpen && (
            <BookmarkUploadModal
              isOpen={isUploadModalOpen}
              onClose={() => setIsUploadModalOpen(false)}
              onSuccess={handleUploadSuccess}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isPDFViewerOpen && selectedBookmark && (
            <PDFViewerModal
              isOpen={isPDFViewerOpen}
              onClose={() => {
                setIsPDFViewerOpen(false);
                setSelectedBookmark(null);
              }}
              fileUrl={getPdfUrl(selectedBookmark)}
              fileName={selectedBookmark.originalName || selectedBookmark.title}
            />
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};

export default Bookmarks;