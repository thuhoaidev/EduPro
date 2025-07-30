import { config } from '../api/axios';

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
}

// Lấy danh sách roles
export const getRoles = async () => {
  const response = await config.get('/roles');
  return response.data;
};

// Lấy role theo ID
export const getRoleById = async (id: string) => {
  const response = await config.get(`/roles/${id}`);
  return response.data;
};

// Cập nhật role
export const updateRole = async (id: string, data: UpdateRoleData) => {
  console.log('roleService - updateRole called with:', { id, data });
  const response = await config.put(`/roles/${id}`, data);
  console.log('roleService - updateRole response:', response.data);
  return response.data;
};

// Xóa role
export const deleteRole = async (id: string) => {
  const response = await config.delete(`/roles/${id}`);
  return response.data;
};

// Tạo role mới
export const createRole = async (data: UpdateRoleData) => {
  const response = await config.post('/roles', data);
  return response.data;
}; 