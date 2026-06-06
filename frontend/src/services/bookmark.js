import api from '../services/axios';

/**
 * Upload a new bookmark note (MongoDB only)
 */
export const uploadBookmark = async (formData) => {
  const response = await api.post('/bookmarks/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Get all bookmark notes for current user (MongoDB only)
 */
export const getBookmarks = async (filters = {}) => {
  const { search, fileType, sort } = filters;
  const params = new URLSearchParams();
  
  if (search) params.append('search', search);
  if (fileType) params.append('fileType', fileType);
  if (sort) params.append('sort', sort);
  
  const response = await api.get(`/bookmarks?${params.toString()}`);
  return response.data;
};

/**
 * Get single bookmark note by ID
 */
export const getBookmarkById = async (id) => {
  const response = await api.get(`/bookmarks/${id}`);
  return response.data;
};

/**
 * Get bookmark file URL
 */
export const getBookmarkFileUrl = (id) => {
  return `/api/bookmarks/file/${id}`;
};

/**
 * Delete bookmark note
 */
export const deleteBookmark = async (id) => {
  const response = await api.delete(`/bookmarks/${id}`);
  return response.data;
};
