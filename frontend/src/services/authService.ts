// Service xử lý các API call liên quan đến authentication
import axios from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse } from '@interfaces/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const authService = {
  // Đăng nhập
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/login`, data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refresh_token);
    }
    return response.data;
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async (): Promise<AuthResponse> => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Làm mới token
  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  }
}; 