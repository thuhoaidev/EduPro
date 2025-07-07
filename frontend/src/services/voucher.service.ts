import axios from 'axios';

// API Configuration
const API_URL = 'http://localhost:5000/api';

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount: number;
  minOrderValue: number;
  usageLimit: number;
  usedCount: number;
  categories: string[];
  tags: string[];
  isNew: boolean;
  isHot: boolean;
  isVipOnly: boolean;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVoucherData {
  code: string;
  title: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  usageLimit: number;
  usedCount?: number;
  categories?: string[];
  tags?: string[];
  isNew?: boolean;
  isHot?: boolean;
  isVipOnly?: boolean;
  startDate: string;
  endDate?: string;
}

export interface UpdateVoucherData extends Partial<CreateVoucherData> {}

const voucherService = {
  // Lấy danh sách voucher
  getAll: async () => {
    const response = await axios.get(`${API_URL}/vouchers`);
    return response.data;
  },

  // Lấy chi tiết một voucher
  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/vouchers/${id}`);
    return response.data;
  },

  // Tạo voucher mới
  create: async (data: CreateVoucherData) => {
    const response = await axios.post(`${API_URL}/vouchers`, data);
    return response.data;
  },

  // Cập nhật voucher
  update: async (id: string, data: UpdateVoucherData) => {
    const response = await axios.put(`${API_URL}/vouchers/${id}`, data);
    return response.data;
  },

  // Xóa voucher
  delete: async (id: string) => {
    const response = await axios.delete(`${API_URL}/vouchers/${id}`);
    return response.data;
  }
};

export default voucherService; 