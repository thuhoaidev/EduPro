// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { config } from '../api/axios';

interface User {
  _id: string;
  fullname: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
}

interface AuthContextType {
  authToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: () => Promise<void>;
  token?: string | null;
}

const AuthContext = createContext<AuthContextType>({
  authToken: null,
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  updateUser: async () => {}
});

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const updateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Không có token, reset user');
        setUser(null);
        setIsAuthenticated(false);
        setAuthToken(null);
        return;
      }

      const response = await config.get('/auth/me');
      const userData = response.data.user;
      setUser(userData);
      setIsAuthenticated(true);
      setAuthToken(token);
    } catch (error: any) {
      console.error('Error fetching user:', error);
      
      if (error.response?.status === 401) {
        console.log('Token không hợp lệ, logout user');
        setUser(null);
        setIsAuthenticated(false);
        setAuthToken(null);
        localStorage.removeItem('token');
      }
    }
  };

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setAuthToken(token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      updateUser();
    }
  }, []);

  const value = {
    authToken,
    user,
    isAuthenticated,
    login,
    logout,
    updateUser,
    token: authToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;