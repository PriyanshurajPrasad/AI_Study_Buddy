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
      const response = await getAllNotes();
      if (response.success) {
        setNotes(response.data.notes);
      }
    } catch (error) {
      setError(error.message);
      toast.error('Failed to fetch notes');
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
