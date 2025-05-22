// Định nghĩa các interface cho authentication
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role_id: number;
  is_verified: boolean;
  status: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
} 