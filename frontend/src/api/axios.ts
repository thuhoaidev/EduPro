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
            // Kiểm tra token có hợp lệ không
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Date.now() / 1000;
                if (payload.exp < currentTime) {
                    // Token đã hết hạn, xóa khỏi localStorage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('refresh_token');
                    console.log('⚠️ Token expired, removed from localStorage');
                } else {
                    request.headers['Authorization'] = `Bearer ${token}`;
                }
            } catch (error) {
                // Token không hợp lệ, xóa khỏi localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('refresh_token');
                console.log('⚠️ Invalid token, removed from localStorage');
            }
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
        
        // Danh sách các route public không cần authentication
        const publicRoutes = [
            '/courses',
            '/courses/slug/',
            '/categories',
            '/blogs',
            '/users/verify-instructor-email/',
            '/auth/verify-email/'
        ];
        
        // Kiểm tra xem request có phải là route public không
        const requestUrl = originalRequest.url || '';
        const isPublicRoute = publicRoutes.some(route => 
            requestUrl.includes(route) || 
            (requestUrl.includes('/courses/') && !requestUrl.includes('/courses/instructor'))
        );
        
        // Thêm kiểm tra cụ thể cho route chi tiết khóa học và các route liên quan
        const isCourseDetailRoute = requestUrl.includes('/courses/') && 
            (requestUrl.match(/\/courses\/[^\/]+$/) || 
             requestUrl.match(/\/courses\/[^\/]+\/content$/) ||
             requestUrl.match(/\/courses\/[^\/]+\/reviews$/) ||
             requestUrl.match(/\/courses\/[^\/]+\/sections$/) ||
             requestUrl.match(/\/courses\/[^\/]+\/stats$/));
        
        console.log('🔍 Request URL:', requestUrl);
        console.log('🔍 Is public route:', isPublicRoute);
        console.log('🔍 Is course detail route:', isCourseDetailRoute);
        console.log('🔍 Error status:', error.response?.status);
        
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            // Nếu đang ở trang login thì chỉ xóa token, không redirect
            if (window.location.pathname === '/login') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('refresh_token');
                return Promise.reject(error);
            }
            
            // Nếu là route public hoặc route chi tiết khóa học, không redirect, chỉ reject error
            if (isPublicRoute || isCourseDetailRoute) {
                console.log('✅ Public route or course detail route detected, not redirecting to login');
                return Promise.reject(error);
            }
            
            console.log('🔒 Protected route detected, attempting refresh token');
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
