import { config } from '../api/axios';
import type { UserRole, UserStatus, ApiResponse, PaginatedResponse, ApiUser } from '../interfaces/Admin.interface';

// Get all users with pagination and filters
export const getAllUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}): Promise<ApiResponse<PaginatedResponse>> => {
  console.log('Making API call to /admin/users with params:', params);
  
  try {
    const response = await config.get('/users', { 
      params: {
        ...params,
        role: 'admin'
      }
    });
    console.log('API response:', response);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (id: string): Promise<ApiResponse<ApiUser>> => {
  const response = await config.get(`/admin/users/${id}`);
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
}): Promise<ApiResponse<ApiUser>> => {
  const response = await config.post('/admin/users', userData);
  return response.data;
};

// Update user
export const updateUser = async (id: string, userData: {
  name?: string;
  role_id?: string;
  status?: UserStatus;
  email_verified?: boolean;
}): Promise<ApiResponse<ApiUser>> => {
  const response = await config.put(`/admin/users/${id}`, userData);
  return response.data;
};

// Delete user
export const deleteUser = async (id: string): Promise<ApiResponse<void>> => {
  const response = await config.delete(`/admin/users/${id}`);
  return response.data;
}; 