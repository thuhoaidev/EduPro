import axios from 'axios';
import type { Category } from '../interfaces/Category.interface';

const API_URL = 'http://localhost:5000/api/categories';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface CategoryResponse {
  success: boolean;
  message?: string;
  data: Category[];
}

export const getAllCategories = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<CategoryResponse> => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 100,
        search: params?.search,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Lỗi khi lấy danh sách danh mục',
      data: [],
    };
  }
};

export const createCategory = async (data: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>): Promise<CategoryResponse> => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Lỗi khi tạo danh mục',
      data: [],
    };
  }
};

export const updateCategory = async (id: string, data: Partial<Category>): Promise<CategoryResponse> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Lỗi khi cập nhật danh mục',
      data: [],
    };
  }
};

export const deleteCategory = async (id: string): Promise<CategoryResponse> => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Lỗi khi xóa danh mục',
      data: [],
    };
  }
};
