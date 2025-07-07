// Utility functions để xử lý token

export const isTokenValid = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }
  
  try {
    // Decode JWT token để kiểm tra thời gian hết hạn
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Kiểm tra xem token có hết hạn chưa (trừ đi 5 phút để đảm bảo an toàn)
    return payload.exp > currentTime + 300;
  } catch (error) {
    console.error('Lỗi khi decode token:', error);
    return false;
  }
};

export const getToken = (): string | null => {
  if (isTokenValid()) {
    return localStorage.getItem('token');
  }
  return null;
};

export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export const redirectToLogin = (): void => {
  clearAuthData();
  window.location.href = '/login';
};

export const checkAuthAndRedirect = (): boolean => {
  if (!isTokenValid()) {
    redirectToLogin();
    return false;
  }
  return true;
}; 