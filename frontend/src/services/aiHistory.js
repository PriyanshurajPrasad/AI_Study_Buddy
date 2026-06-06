import api from './axios';

/**
 * Save AI interaction to history (MongoDB only)
 * @param {Object} data - { type, query, response, topic, tags }
 * @returns {Promise<Object>} - Saved history entry
 */
export const saveAIHistory = async (data) => {
  try {
    console.log('Saving AI history to MongoDB for user:', data);
    const response = await api.post('/ai-history', data);
    console.log('AI history saved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving AI history to MongoDB:', error);
    throw error;
  }
};

/**
 * Get all AI history for current user (MongoDB only)
 * @param {Object} params - { type, search, limit }
 * @returns {Promise<Object>} - History entries
 */
export const getAIHistory = async (params = {}) => {
  try {
    console.log('Fetching AI history from MongoDB with params:', params);
    const response = await api.get('/ai-history', { params });
    console.log('AI history fetched successfully:', response.data.count, 'entries');
    return response.data;
  } catch (error) {
    console.error('Error fetching AI history from MongoDB:', error);
    throw error;
  }
};

/**
 * Delete single AI history entry
 * @param {String} id - History entry ID
 * @returns {Promise<Object>} - Success message
 */
export const deleteAIHistory = async (id) => {
  try {
    console.log('Deleting AI history entry:', id);
    const response = await api.delete(`/ai-history/${id}`);
    console.log('AI history entry deleted successfully');
    return response.data;
  } catch (error) {
    console.error('Error deleting AI history:', error);
    throw error;
  }
};

/**
 * Clear all AI history for current user
 * @returns {Promise<Object>} - Success message
 */
export const clearAIHistory = async () => {
  try {
    console.log('Clearing all AI history for current user');
    const response = await api.delete('/ai-history');
    console.log('AI history cleared successfully');
    return response.data;
  } catch (error) {
    console.error('Error clearing AI history:', error);
    throw error;
  }
};
