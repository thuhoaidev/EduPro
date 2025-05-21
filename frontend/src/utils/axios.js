import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Token hết hạn hoặc không hợp lệ
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
      
      // Lỗi server
      if (error.response.status === 500) {
        console.error('Lỗi server:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 