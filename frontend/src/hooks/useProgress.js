import { useState, useEffect } from 'react';
import { getProgress } from '../api/progress';
import toast from 'react-hot-toast';

export const useProgress = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      console.log('Fetching progress from MongoDB');
      const response = await getProgress();
      console.log('Progress data from MongoDB:', response);
      if (response.success) {
        setProgress(response.data);
      }
    } catch (error) {
      console.error('Error fetching progress from MongoDB:', error);
      setError(error.message);
      toast.error('Failed to fetch progress from MongoDB');
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const refetchProgress = () => {
    fetchProgress();
  };

  return { progress, loading, error, refetchProgress };
};
