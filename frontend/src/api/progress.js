import api from '../services/axios';

/**
 * Get user progress stats from backend
 */
export const getProgress = async () => {
  try {
    const response = await api.get('/progress/stats');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Save quiz result to backend
 */
export const saveQuizResult = async (resultData) => {
  const response = await api.post('/progress/save-result', resultData);
  return response.data;
};
