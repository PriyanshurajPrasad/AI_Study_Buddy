import { useState } from 'react';
import { FaUpload, FaFilePdf, FaFileWord, FaFileAlt, FaTimes, FaTags, FaBookOpen, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const BookmarkUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    tags: ''
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      tags: ''
    });
    setFile(null);
    setPreview(null);
    setErrors({});
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/png', 'image/jpeg', 'image/jpg'];
    const allowedExtensions = ['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg'];
    const fileExt = '.' + selectedFile.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExt) && !allowedTypes.includes(selectedFile.type)) {
      toast.error('Only PDF, DOCX, TXT, PNG, and JPG files are allowed');
      return;
    }

    // Validate file size (25MB limit)
    if (selectedFile.size > 25 * 1024 * 1024) {
      toast.error('File size must be less than 25MB');
      return;
    }

    setFile(selectedFile);
    setErrors({ ...errors, file: null });

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!file) {
      newErrors.file = 'File is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setUploading(true);

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('title', formData.title.trim());
      if (formData.description) data.append('description', formData.description.trim());
      if (formData.subject) data.append('subject', formData.subject.trim());
      if (formData.tags) data.append('tags', formData.tags);

      const { uploadBookmark } = await import('../services/bookmark');
      const response = await uploadBookmark(data);

      if (response.success) {
        resetForm();
        onClose();
        // Pass the uploaded note to parent for optimistic update
        if (onSuccess) onSuccess(response.note || response.data);
      } else {
        toast.error(response.message || 'Failed to upload note');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message.includes('ERR_CONNECTION_REFUSED') || error.code === 'ECONNREFUSED') {
        toast.error('Backend server is not running. Please start backend.');
      } else {
        toast.error('Failed to upload note');
      }
    } finally {
      setUploading(false);
    }
  };

  // Get file icon based on type
  const getFileIcon = () => {
    if (!file) return <FaUpload className="text-4xl text-gray-300" />;

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      return <FaFilePdf className="text-4xl text-red-500" />;
    } else if (fileType.includes('word') || fileName.endsWith('.docx')) {
      return <FaFileWord className="text-4xl text-blue-500" />;
    } else if (fileType.includes('text') || fileName.endsWith('.txt')) {
      return <FaFileAlt className="text-4xl text-gray-500" />;
    } else if (fileType.includes('image')) {
      return preview ? (
        <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
      ) : (
        <FaUpload className="text-4xl text-purple-500" />
      );
    }
    return <FaUpload className="text-4xl text-gray-300" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <FaUpload className="text-xl text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upload Note</h2>
              <p className="text-sm text-gray-500">Add a new bookmark note</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File <span className="text-red-500">*</span>
            </label>
            <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${uploading ? 'border-gray-200 cursor-not-allowed opacity-50' : 'border-gray-300 hover:border-purple-400'}`}>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label htmlFor="file-upload" className={`cursor-pointer ${uploading ? 'pointer-events-none' : ''}`}>
                <div className="flex flex-col items-center space-y-3">
                  {getFileIcon()}
                  {file ? (
                    <div className="text-center">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="font-medium text-gray-700">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500">PDF, DOCX, TXT, PNG, JPG</p>
                    </div>
                  )}
                </div>
              </label>
            </div>
            {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter note title"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={200}
              disabled={uploading}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g., Physics, Mathematics, Chemistry"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              maxLength={100}
              disabled={uploading}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the note (optional)"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
              maxLength={1000}
              disabled={uploading}
            />
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="relative">
              <div className="flex items-center space-x-2">
                <FaTags className="text-gray-400" />
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g., chapter1, important, exam"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  disabled={uploading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
            <FaInfoCircle className="text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Supported file types:</p>
              <p>PDF, DOCX, TXT, PNG, JPG (Max 25MB)</p>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={uploading}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              <span>Upload Note</span>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default BookmarkUploadModal;