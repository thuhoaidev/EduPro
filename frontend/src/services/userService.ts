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
export const createUser = async (
  userData: object | FormData
): Promise<ApiResponse<ApiUser>> => {
  const headers = userData instanceof FormData 
    ? { 'Content-Type': 'multipart/form-data' }
    : {};
  const response = await config.post('/users', userData, { headers });
  return response.data;
};

// Update user
export const updateUser = async (
  id: string, 
  userData: object | FormData
): Promise<ApiResponse<ApiUser>> => {
  const headers = userData instanceof FormData 
    ? { 'Content-Type': 'multipart/form-data' }
    : {};
  
  // Using POST with method override for better compatibility with multipart/form-data
  if (userData instanceof FormData) {
    const response = await config.post(`/users/${id}?_method=PUT`, userData, { headers });
    return response.data;
  }

  const response = await config.put(`/users/${id}`, userData, { headers });
  return response.data;
};

// Delete user
export const deleteUser = async (id: string): Promise<ApiResponse<void>> => {
  const response = await config.delete(`/users/${id}`);
  return response.data;
}; 