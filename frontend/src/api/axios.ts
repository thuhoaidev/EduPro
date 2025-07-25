import axios from "axios";
import { refreshAccessToken } from '../services/authService';
import { clearAuthData, redirectToLogin } from '../utils/tokenUtils';

// Cấu hình API
const API_URL = 'http://localhost:5000/api';
// const API_URL = '';

export const config = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Thêm để hỗ trợ CORS với credentials
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000 // timeout sau 10 giây
});

// Biến để theo dõi việc refresh token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });

    failedQueue = [];
};

// Thêm interceptor để tự động gắn token vào header
config.interceptors.request.use(
    (request) => {
        const token = localStorage.getItem('token');
        if (token) {
            request.headers['Authorization'] = `Bearer ${token}`;
        }
        return request;
    },
    (error) => Promise.reject(error)
);

// Xử lý response
config.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            // Nếu đang ở trang login thì chỉ xóa token, không redirect
            if (window.location.pathname === '/login') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('refresh_token');
                return Promise.reject(error);
            }
            originalRequest._retry = true;
            isRefreshing = true;
            try {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    localStorage.setItem('token', newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    processQueue(null, newToken);
                    return config(originalRequest);
                } else {
                    processQueue(error, null);
                    redirectToLogin();
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                redirectToLogin();
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default config;
