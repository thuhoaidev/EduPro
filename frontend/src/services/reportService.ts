import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Đúng port backend của bạn
  // Nếu cần gửi token:
  // headers: { Authorization: `Bearer ${token}` }
});

export const reportService = {
  create: (data: any) => api.post('/reports', data),
  getUserReports: (userId: any) => api.get(`/reports/my-reports/${userId}`),
  getAll: () => api.get('/reports'),
  reply: (id: any, adminReply: any) => api.put(`/reports/${id}/reply`, { adminReply }),
};
