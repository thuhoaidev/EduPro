import { config } from '../api/axios';
import axios from 'axios';
import sha256 from 'js-sha256';

export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return null;
    }

    const response = await config.post('/auth/refresh-token', { refresh_token: refreshToken });
    
    if (response.data.success) {
      const newToken = response.data.data.token;
      localStorage.setItem('token', newToken);
      return newToken;
    } else {
      return null;
    }
  } catch (error: any) {
    return null;
  }
};

// Xác minh email
export const verifyEmail = async (token: string) => {
  try {
    const response = await config.get(`/auth/verify-email/${token}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi xác minh email');
  }
};

// Gửi lại email xác minh
export const resendVerificationEmail = async (email: string) => {
  try {
    const response = await config.post('/auth/resend-verification', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Kiểm tra trạng thái xác minh email
export const checkEmailVerification = async (email: string) => {
  try {
    const response = await config.get(`/auth/check-verification/${email}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Xác minh email giảng viên
export const verifyInstructorEmail = async (token: string) => {
  try {
    // Gửi token gốc lên backend, backend sẽ tự hash
    const response = await config.get(`/auth/verify-instructor-email/${token}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi xác minh email giảng viên');
  }
};
