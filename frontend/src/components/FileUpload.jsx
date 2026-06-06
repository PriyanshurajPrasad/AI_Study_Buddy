import React, { useState } from 'react';
import { FaUpload, FaFilePdf, FaFileAlt, FaTimes } from 'react-icons/fa';

const FileUpload = ({ onFileSelect, acceptedTypes = ['.pdf', '.txt'], maxSize = 10 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setError('');

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      setError(`Only ${acceptedTypes.join(', ')} files are allowed`);
      return;
    }

    // Check file size (maxSize is in MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError('');
    onFileSelect(null);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return extension === 'pdf' ? FaFilePdf : FaFileAlt;
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            onChange={handleChange}
            accept={acceptedTypes.join(',')}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop your file here, or{' '}
            <span className="text-primary-600 font-medium">browse</span>
          </p>
          <p className="text-xs text-gray-400">
            Accepted: {acceptedTypes.join(', ')} (Max {maxSize}MB)
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-3">
            {selectedFile && (
              <>
                {React.createElement(getFileIcon(selectedFile.name), {
                  className: 'text-2xl text-primary-600',
                })}
                <div>
                  <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleRemove}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default FileUpload;
