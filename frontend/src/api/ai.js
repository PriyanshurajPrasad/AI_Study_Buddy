import api from '../services/axios';

/**
 * Summarize notes using AI
 */
export const summarizeNotes = async (noteId) => {
  const response = await api.post('/ai/summarize', { noteId });
  return response.data;
};

/**
 * Explain a concept using AI
 */
export const explainConcept = async (question, language = 'english') => {
  const response = await api.post('/ai/explain', { question, language });
  return response.data;
};

/**
 * Generate MCQ quiz from notes
 */
export const generateQuiz = async (noteId) => {
  const response = await api.post('/ai/generate-quiz', { noteId });
  return response.data;
};

/**
 * Generate viva questions from notes
 */
export const generateViva = async (noteId) => {
  const response = await api.post('/ai/generate-viva', { noteId });
  return response.data;
};

/**
 * Ask a study doubt/question
 */
export const askDoubt = async (question) => {
  const response = await api.post('/ai/ask', { question });
  return response.data;
};
