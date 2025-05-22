// Custom hook xử lý logic authentication
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authService } from '@services/authService';
import { loginStart, loginSuccess, loginFailure, logout } from '@store/slices/authSlice';
import { RootState } from '@store/index';
import { LoginRequest } from '@interfaces/auth';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  // Xử lý đăng nhập
  const handleLogin = useCallback(async (data: LoginRequest) => {
    try {
      dispatch(loginStart());
      const response = await authService.login(data);
      dispatch(loginSuccess(response));
      navigate('/dashboard'); // Chuyển hướng sau khi đăng nhập thành công
      return true;
    } catch (error: any) {
      dispatch(loginFailure(error.response?.data?.message || 'Đăng nhập thất bại'));
      return false;
    }
  }, [dispatch, navigate]);

  // Xử lý đăng xuất
  const handleLogout = useCallback(() => {
    authService.logout();
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  // Kiểm tra trạng thái đăng nhập
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      try {
        const response = await authService.getCurrentUser();
        dispatch(loginSuccess(response));
      } catch (error) {
        handleLogout();
      }
    }
  }, [dispatch, user, handleLogout]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    handleLogin,
    handleLogout,
    checkAuth
  };
}; 