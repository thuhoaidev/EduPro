
import axios from "axios";

// Cấu hình API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const config = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
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
        console.log('Request:', req.url);
        return req;
    },
    (err) => {
        console.error('Request error:', err);
        return Promise.reject(err);
    }
);

// Xử lý response
config.interceptors.response.use(
    (response) => {
        console.log('Response:', response.config.url);
        return response;
    },
    (error) => {
        console.error('Response error:', error);
        if (error.response) {
            // Server trả về lỗi
            console.error('Server error:', error.response.data);
        } else if (error.request) {
            // Không có phản hồi từ server
            console.error('No response:', error.request);
        } else {
            // Lỗi trong cấu hình request
            console.error('Error in request config:', error.message);
        }
        return Promise.reject(error);
    }
);
