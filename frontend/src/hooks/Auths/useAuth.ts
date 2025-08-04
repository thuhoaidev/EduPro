import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../api/axios';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUserData = async (authToken: string) => {
    try {
      const response = await config.get('/users/me');
      console.log('API Response from /users/me:', response.data);
      const userData = response.data.data;
      console.log('User data to be stored:', userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Nếu lỗi 401, có thể token đã hết hạn, nhưng không logout ở đây
      // để tránh redirect không mong muốn
    }
  };

  useEffect(() => {
    // Check if user is logged in by looking for token in localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      
      // First set user from localStorage for immediate display
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      
      // Then fetch fresh data from API
      fetchUserData(storedToken);
    }
  }, []);

  const login = (newToken: string, userData: any) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    setUser(userData);
    
    // Fetch complete user data after login
    fetchUserData(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  return {
    isAuthenticated,
    user,
    token,
    login,
    logout
  };
};

export default useAuth; 