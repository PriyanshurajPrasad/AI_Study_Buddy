import api from '../services/axios';

/**
 * Check backend health
 */
export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Register a new user
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Login user
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Get user profile
 */
export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};
