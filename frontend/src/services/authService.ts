import { config } from '../api/axios';
import axios from 'axios';

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
    }
    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

// Xác minh email
export const verifyEmail = async (token: string) => {
  try {
    const response = await axios.get(`/auth/verify-email/${token}`);
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
