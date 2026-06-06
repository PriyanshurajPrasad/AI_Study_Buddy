import api from '../services/axios';

/**
 * Upload a new bookmark note (MongoDB only)
 */
export const uploadBookmark = async (formData) => {
  console.log('Uploading bookmark to MongoDB');
  const response = await api.post('/bookmarks/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  console.log('Bookmark uploaded successfully to MongoDB:', response.data);
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
  
  console.log('Fetching bookmarks from MongoDB with filters:', filters);
  const response = await api.get(`/bookmarks?${params.toString()}`);
  console.log('Bookmarks fetched successfully from MongoDB:', response.data.count, 'entries');
  return response.data;
};

/**
 * Get single bookmark note by ID
 */
export const getBookmarkById = async (id) => {
  console.log('Fetching bookmark from MongoDB:', id);
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
  console.log('Deleting bookmark from MongoDB:', id);
  const response = await api.delete(`/bookmarks/${id}`);
  console.log('Bookmark deleted successfully from MongoDB');
  return response.data;
};
