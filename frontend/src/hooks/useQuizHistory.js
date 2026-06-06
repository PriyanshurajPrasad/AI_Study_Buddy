import { useState, useEffect } from 'react';
import { getQuizHistory } from '../api/quiz';
import toast from 'react-hot-toast';

export const useQuizHistory = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuizHistory = async () => {
    try {
      setLoading(true);
      console.log('Fetching quiz history from MongoDB');
      const response = await getQuizHistory();
      console.log('Quiz history fetched from MongoDB:', response);
      if (response.success) {
        setQuizzes(response.data.quizzes);
      }
    } catch (error) {
      console.error('Error fetching quiz history from MongoDB:', error);
      setError(error.message);
      toast.error('Failed to fetch quiz history from MongoDB');
      setQuizzes([]); // Use empty array instead of fallback data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const refetchQuizHistory = () => {
    fetchQuizHistory();
  };

  return { quizzes, loading, error, refetchQuizHistory };
};
