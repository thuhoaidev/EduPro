// src/services/blogService.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const blogService = {
  fetchSavedPosts: async () => {
    const res = await apiClient.get('/blogs/saved-posts');
    return res.data;
  },

  likePost: async (postId: string) => {
    const res = await apiClient.post(`/blogs/${postId}/like`);
    return res.data;
  },

  unlikePost: async (postId: string) => {
    const res = await apiClient.delete(`/blogs/${postId}/unlike`);
    return res.data;
  },

  addComment: async (postId: string, content: string) => {
    const res = await apiClient.post(`/blogs/${postId}/comment`, { content });
    return res.data;
  },

  replyToComment: async (commentId: string, content: string) => {
    const res = await apiClient.post(`/blogs/comment/${commentId}/reply`, { content });
    return res.data;
  },

  fetchComments: async (postId: string, page = 1, limit = 10) => {
    const res = await apiClient.get(`/blogs/${postId}/comments?page=${page}&limit=${limit}`);
    return res.data;
  },

  unsavePost: async (savedPostId: string) => {
    const res = await apiClient.delete(`/blogs/saved-posts/${savedPostId}`);
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await apiClient.get('/users/me');
    return res.data;
  }
};
