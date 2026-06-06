import { useState, useEffect } from 'react';
import { getAllNotes } from '../api/notes';
import toast from 'react-hot-toast';

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      console.log('Fetching notes from MongoDB');
      const response = await getAllNotes();
      console.log('Notes fetched from MongoDB:', response);
      if (response.success) {
        setNotes(response.data.notes);
      }
    } catch (error) {
      console.error('Error fetching notes from MongoDB:', error);
      setError(error.message);
      toast.error('Failed to fetch notes from MongoDB');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const refetchNotes = () => {
    fetchNotes();
  };

  return { notes, loading, error, refetchNotes };
};
