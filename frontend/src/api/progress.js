import api from '../services/axios';

/**
 * Get user progress stats from backend
 */
export const getProgress = async () => {
  try {
    console.log('Fetching progress stats from MongoDB');
    const response = await api.get('/progress/stats');
    console.log('Progress API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching progress from MongoDB:', error);
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
