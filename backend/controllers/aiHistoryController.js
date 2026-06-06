const AIHistory = require('../models/AIHistory');
const mongoose = require('mongoose');

/**
 * Save AI interaction to history
 * POST /api/ai-history
 */
const saveAIHistory = async (req, res, next) => {
  try {
    const { type, query, response, topic, tags } = req.body;

    console.log('=== SAVING AI HISTORY TO MONGODB ===');
    console.log('User ID:', req.user.id);
    console.log('User Email:', req.user.email);
    console.log('Type:', type);
    console.log('Topic:', topic);
    console.log('Query Length:', query?.length || 0);
    console.log('Response Length:', response?.length || 0);

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

    console.log('✅ AI History saved successfully to MongoDB');
    console.log('   History ID:', historyEntry._id);
    console.log('   User ID:', historyEntry.userId);
    console.log('   Type:', historyEntry.type);
    console.log('   Topic:', historyEntry.topic);

    return res.status(201).json({
      success: true,
      message: 'History saved successfully',
      data: historyEntry
    });
  } catch (error) {
    console.error('Error saving AI history:', error);
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

    console.log('=== FETCHING AI HISTORY FROM MONGODB ===');
    console.log('User ID:', req.user.id);
    console.log('User Email:', req.user.email);
    console.log('Filters:', { type, search, limit });

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

    console.log('✅ AI History fetched successfully from MongoDB');
    console.log('   Count:', history.length);
    console.log('   User ID:', req.user.id);

    return res.status(200).json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('Error fetching AI history:', error);
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

    console.log('AI History deleted:', id);

    return res.status(200).json({
      success: true,
      message: 'History entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting AI history:', error);
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

    console.log('Cleared AI history for user:', req.user.id, 'Deleted:', result.deletedCount);

    return res.status(200).json({
      success: true,
      message: `Successfully cleared ${result.deletedCount} history entries`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing AI history:', error);
    next(error);
  }
};

module.exports = {
  saveAIHistory,
  getAIHistory,
  deleteAIHistory,
  clearAIHistory
};
