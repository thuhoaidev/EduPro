import axiosClient from './axiosClient';

export const blogAPI = {
  getAll() {
    return axiosClient.get('/blogs');
  },

  getDetail(blogId: string) {
    return axiosClient.get(`/blogs/${blogId}`);
  },

  getComments(blogId: string) {
    return axiosClient.get(`/blogs/${blogId}/comments`);
  },

  comment(blogId: string, content: string) {
    return axiosClient.post(`/blogs/${blogId}/comment`, { content });
  },

  reply(commentId: string, content: string) {
    return axiosClient.post(`/blogs/comment/${commentId}/reply`, { content });
  },

  like(blogId: string) {
    return axiosClient.post(`/blogs/${blogId}/like`);
  },

  unlike(blogId: string) {
    return axiosClient.post(`/blogs/${blogId}/unlike`);
  }
};
