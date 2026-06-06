import api from './axios';

/**
 * Generate quiz from subject and topic using AI
 */
export const generateTopicQuiz = async (data) => {
  const response = await api.post('/quiz/generate-topic', data);
  return response.data;
};

/**
 * Submit topic quiz answers
 */
export const submitQuiz = async (quizData) => {
  try {
    const response = await api.post('/quiz/submit-topic', quizData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Submit quiz answers for note-based quizzes
 */
export const submitNoteQuiz = async (quizData) => {
  const response = await api.post('/quiz/submit', quizData);
  return response.data;
};
