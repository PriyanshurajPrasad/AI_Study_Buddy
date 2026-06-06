const AIHistory = require('../models/AIHistory');
const mongoose = require('mongoose');

/**
 * Save AI interaction to history
 * POST /api/ai-history
 */
const saveAIHistory = async (req, res, next) => {
  try {
    const { type, query, response, topic, tags } = req.body;

    // Validate required fields
    if (!type || !query || !response) {
      return res.status(400).json({
        success: false,
        message: 'Type, query, and response are required'
      });
    }

    // Validate type
    if (!['explanation', 'doubt'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "explanation" or "doubt"'
      });
    }

    // Create history entry
    const historyEntry = await AIHistory.create({
      userId: req.user.id,
      type,
      query: query.trim(),
      response: response.trim(),
      topic: topic?.trim() || '',
      tags: tags || []
    });

    return res.status(201).json({
      success: true,
      message: 'History saved successfully',
      data: historyEntry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all AI history for current user
 * GET /api/ai-history
 */
const getAIHistory = async (req, res, next) => {
  try {
    const { type, search, limit = 50 } = req.query;

    // Build query
    const query = { userId: req.user.id };

    // Filter by type
    if (type && ['explanation', 'doubt'].includes(type)) {
      query.type = type;
    }

    // Search in query and response
    if (search) {
      query.$or = [
        { query: { $regex: search, $options: 'i' } },
        { response: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } }
      ];
    }

    // Get history
    const history = await AIHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete single AI history entry
 * DELETE /api/ai-history/:id
 */
const deleteAIHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid history id format'
      });
    }

    // Delete only current user's history
    const deleted = await AIHistory.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'History item not found or you do not have permission to delete it'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'History entry deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete history item'
    });
  }
};

/**
 * Clear all AI history for current user
 * DELETE /api/ai-history
 */
const clearAIHistory = async (req, res, next) => {
  try {
    const result = await AIHistory.deleteMany({ userId: req.user.id });

    return res.status(200).json({
      success: true,
      message: `Successfully cleared ${result.deletedCount} history entries`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveAIHistory,
  getAIHistory,
  deleteAIHistory,
  clearAIHistory
};
