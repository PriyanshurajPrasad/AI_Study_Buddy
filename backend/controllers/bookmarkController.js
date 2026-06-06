const BookmarkNote = require('../models/BookmarkNote');
const fs = require('fs');
const path = require('path');

/**
 * Upload a new bookmark note
 * POST /api/bookmarks/upload
 */
const uploadBookmark = async (req, res, next) => {
  try {
    const { title, description, subject, tags } = req.body;

    console.log('=== BOOKMARK UPLOAD START ===');
    console.log('User ID:', req.user.id);
    console.log('User Email:', req.user.email);
    console.log('Bookmark data:', { title, description, subject, tags });

    // Validate required fields
    if (!title || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Title and file are required'
      });
    }

    // Parse tags if sent as string
    let parsedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        parsedTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    // Determine file type
    const fileExt = req.file.originalname.split('.').pop().toLowerCase();
    const fileTypeMap = {
      'pdf': 'pdf',
      'docx': 'docx',
      'doc': 'docx',
      'txt': 'txt',
      'png': 'png',
      'jpg': 'jpg',
      'jpeg': 'jpeg'
    };
    const fileType = fileTypeMap[fileExt] || 'txt';

    // Create bookmark note
    const bookmarkNote = await BookmarkNote.create({
      userId: req.user.id,
      title: title.trim(),
      description: description?.trim(),
      subject: subject?.trim(),
      tags: parsedTags,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileType,
      fileSize: req.file.size
    });

    console.log('✅ Bookmark note saved successfully to MongoDB');
    console.log('   Bookmark ID:', bookmarkNote._id);
    console.log('   User ID:', bookmarkNote.userId);
    console.log('   File Name:', bookmarkNote.fileName);
    console.log('   File Size:', bookmarkNote.fileSize, 'bytes');

    // Construct file URL for frontend
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/bookmarks/${req.file.filename}`;

    return res.status(201).json({
      success: true,
      message: 'Note uploaded successfully',
      note: {
        ...bookmarkNote.toObject(),
        fileUrl
      }
    });
  } catch (error) {
    console.error('Error uploading bookmark:', error);
    next(error);
  }
};

/**
 * Get all bookmark notes for current user
 * GET /api/bookmarks
 */
const getBookmarks = async (req, res, next) => {
  try {
    const { search, fileType, sort } = req.query;

    console.log('=== FETCHING BOOKMARKS FROM MONGODB ===');
    console.log('User ID:', req.user.id);
    console.log('User Email:', req.user.email);
    console.log('Filters:', { search, fileType, sort });

    // Build query
    const query = { userId: req.user.id };

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Add file type filter
    if (fileType) {
      query.fileType = fileType;
    }

    // Sort order
    const sortOrder = sort === 'oldest' ? { uploadedAt: 1 } : { uploadedAt: -1 };

    const bookmarks = await BookmarkNote.find(query).sort(sortOrder);

    // Add fileUrl to each bookmark
    const bookmarksWithUrls = bookmarks.map(bookmark => ({
      ...bookmark.toObject(),
      fileUrl: `${req.protocol}://${req.get('host')}/uploads/bookmarks/${bookmark.fileName}`
    }));

    console.log('✅ Bookmarks fetched successfully from MongoDB');
    console.log('   Count:', bookmarksWithUrls.length);
    console.log('   User ID:', req.user.id);

    return res.status(200).json({
      success: true,
      data: bookmarksWithUrls,
      count: bookmarksWithUrls.length
    });
  } catch (error) {
    console.error('❌ Error fetching bookmarks from MongoDB:', error);
    next(error);
  }
};

/**
 * Get single bookmark note by ID
 * GET /api/bookmarks/:id
 */
const getBookmarkById = async (req, res, next) => {
  try {
    const bookmark = await BookmarkNote.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    // Add fileUrl to bookmark
    const bookmarkWithUrl = {
      ...bookmark.toObject(),
      fileUrl: `${req.protocol}://${req.get('host')}/uploads/bookmarks/${bookmark.fileName}`
    };

    return res.status(200).json({
      success: true,
      data: bookmarkWithUrl
    });
  } catch (error) {
    console.error('Error fetching bookmark:', error);
    next(error);
  }
};

/**
 * Get bookmark file content
 * GET /api/bookmarks/file/:id
 */
const getBookmarkFile = async (req, res, next) => {
  try {
    const bookmark = await BookmarkNote.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    // Check if file exists
    if (!fs.existsSync(bookmark.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Set Content-Type based on file type
    if (bookmark.fileType === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    }

    console.log('Serving file:', bookmark.filePath);
    console.log('File type:', bookmark.fileType);

    // Send file
    res.sendFile(bookmark.filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        return res.status(500).json({
          success: false,
          message: 'Error sending file'
        });
      }
    });
  } catch (error) {
    console.error('Error fetching bookmark file:', error);
    next(error);
  }
};

/**
 * Delete bookmark note
 * DELETE /api/bookmarks/:id
 */
const deleteBookmark = async (req, res, next) => {
  try {
    const bookmark = await BookmarkNote.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(bookmark.filePath)) {
      fs.unlinkSync(bookmark.filePath);
      console.log('File deleted:', bookmark.filePath);
    }

    // Delete from database
    await BookmarkNote.findByIdAndDelete(req.params.id);

    console.log('Bookmark deleted:', req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Bookmark deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    next(error);
  }
};

module.exports = {
  uploadBookmark,
  getBookmarks,
  getBookmarkById,
  getBookmarkFile,
  deleteBookmark
};