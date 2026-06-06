import api from '../services/axios';

/**
 * Create a new quiz
 */
export const createQuiz = async (quizData) => {
  const response = await api.post('/quiz/create', quizData);
  return response.data;
};

/**
 * Generate quiz from note using AI
 */
export const generateQuizFromNote = async (noteId) => {
  const response = await api.post(`/quiz/generate/${noteId}`);
  console.log("API RESPONSE:", response);
  console.log("API RESPONSE DATA:", response.data);
  return response.data;
};

/**
 * Generate quiz from subject and topic using AI
 */
export const generateQuizFromTopic = async (quizData) => {
  const response = await api.post('/quiz/generate-topic', quizData);
  console.log("TOPIC QUIZ API RESPONSE:", response);
  console.log("TOPIC QUIZ API RESPONSE DATA:", response.data);
  return response.data;
};

/**
 * Submit quiz answers
 */
export const submitQuiz = async (quizData) => {
  const response = await api.post('/quiz/submit', quizData);
  return response.data;
};

/**
 * Get quiz history
 */
export const getQuizHistory = async () => {
  const response = await api.get('/quiz/history');
  return response.data;
};
