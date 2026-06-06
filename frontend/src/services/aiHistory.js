import api from './axios';

/**
 * Save AI interaction to history (MongoDB only)
 * @param {Object} data - { type, query, response, topic, tags }
 * @returns {Promise<Object>} - Saved history entry
 */
export const saveAIHistory = async (data) => {
  try {
    const response = await api.post('/ai-history', data);
    return response.data;
  } catch (error) {
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
    const response = await api.get('/ai-history', { params });
    return response.data;
  } catch (error) {
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
    const response = await api.delete(`/ai-history/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Clear all AI history for current user
 * @returns {Promise<Object>} - Success message
 */
export const clearAIHistory = async () => {
  try {
    const response = await api.delete('/ai-history');
    return response.data;
  } catch (error) {
    throw error;
  }
};
