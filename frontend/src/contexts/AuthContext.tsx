// Tạo file contexts/AuthContext.tsx
import { createContext, useContext } from 'react';

interface AuthContextType {
  authToken: string | null;
}

export const AuthContext = createContext<AuthContextType>(null!);

export function useAuth() {
  return useContext(AuthContext);
}