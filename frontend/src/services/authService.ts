import { config } from '../api/axios';

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
