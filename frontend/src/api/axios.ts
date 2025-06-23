import axios from "axios";
import { refreshAccessToken } from '../services/authService';

// Cấu hình API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const config = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Thêm để hỗ trợ CORS với credentials
    headers: {
        "Content-Type": "application/json",
        // "Access-Control-Allow-Origin": "*",
        // "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        // "Access-Control-Allow-Headers": "Content-Type, Authorization"
    },
    timeout: 10000 // timeout sau 10 giây
});

// Xử lý request
config.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem('token');
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  }
);

// Xử lý response
config.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    localStorage.setItem('token', newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return config(originalRequest);
                }
            } catch (refreshError) {
                console.error('Failed to refresh token:', refreshError);
                // Xóa token và redirect đến trang login
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);
