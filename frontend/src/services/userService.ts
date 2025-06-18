import { config } from '../api/axios';
import type { UserRole, UserStatus, ApiResponse, PaginatedResponse, ApiUser } from '../interfaces/Admin.interface';

// Get all users with pagination and filters
export const getAllUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}): Promise<ApiResponse<PaginatedResponse<ApiUser>>> => {
  const response = await config.get('/users', { params });
  return response.data;
};

// Get user by ID
export const getUserById = async (id: string): Promise<ApiResponse<ApiUser>> => {
  const response = await config.get(`/users/${id}`);
  return response.data;
};

// Create new user
export const createUser = async (userData: {
  email: string;
  password: string;
  name: string;
  role_id: string;
  status?: UserStatus;
  phone?: string;
  address?: string;
  dob?: string | null;
  gender?: string;
  approval_status?: string;
  nickname?: string;
}): Promise<ApiResponse<ApiUser>> => {
  const response = await config.post('/users', userData);
  return response.data;
};

// Update user
export const updateUser = async (id: string, userData: {
  name?: string;
  role_id?: string;
  status?: UserStatus;
  email?: string;
  phone?: string;
  address?: string;
  dob?: string | null;
  gender?: string;
  approval_status?: string;
  email_verified?: boolean;
}): Promise<ApiResponse<ApiUser>> => {
  const response = await config.put(`/users/${id}`, userData);
  return response.data;
};

// Delete user
export const deleteUser = async (id: string): Promise<ApiResponse<void>> => {
  const response = await config.delete(`/users/${id}`);
  return response.data;
}; 