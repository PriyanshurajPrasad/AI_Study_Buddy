import api from './axios';

/**
 * Generate quiz from subject and topic using AI
 */
export const generateTopicQuiz = async (data) => {
  const response = await api.post('/quiz/generate-topic', data);
  console.log("TOPIC QUIZ API RESPONSE:", response);
  console.log("TOPIC QUIZ API RESPONSE DATA:", response.data);
  return response.data;
};

/**
 * Submit topic quiz answers
 */
export const submitQuiz = async (quizData) => {
  console.log('=== SUBMITTING QUIZ TO BACKEND ===');
  console.log('SUBMIT PAYLOAD:', quizData);
  console.log('Quiz ID:', quizData.quizId);
  console.log('Subject:', quizData.subject);
  console.log('Topic:', quizData.topic);
  console.log('Total Questions:', quizData.totalQuestions);
  console.log('Correct Answers:', quizData.correctAnswers);
  console.log('Score Percentage:', quizData.scorePercentage + '%');
  try {
    const response = await api.post('/quiz/submit-topic', quizData);
    console.log('Submit result response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Submit quiz error:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

/**
 * Submit quiz answers for note-based quizzes
 */
export const submitNoteQuiz = async (quizData) => {
  console.log('=== SUBMITTING NOTE QUIZ TO BACKEND ===');
  console.log('Quiz Data:', quizData);
  const response = await api.post('/quiz/submit', quizData);
  console.log('Submit result response:', response.data);
  return response.data;
};
