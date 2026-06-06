import api from '../services/axios';

/**
 * Upload a new note (PDF or TXT)
 */
export const uploadNote = async (formData) => {
  const response = await api.post('/notes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Get all notes for the user
 */
export const getAllNotes = async () => {
  const response = await api.get('/notes/all');
  return response.data;
};

/**
 * Get all notes (simplified endpoint)
 */
export const getNotes = async () => {
  const response = await api.get('/notes');
  return response.data;
};

/**
 * Get a single note by ID
 */
export const getNoteById = async (id) => {
  const response = await api.get(`/notes/${id}`);
  return response.data;
};

/**
 * Delete a note
 */
export const deleteNote = async (id) => {
  const response = await api.delete(`/notes/${id}`);
  return response.data;
};
