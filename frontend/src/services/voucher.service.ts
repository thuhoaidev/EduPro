import axios from 'axios';

// API Configuration
const API_URL = 'http://localhost:5000/api';

export interface Voucher {
  _id: string;
  code: string;
  course: string | null;
  type: 'percentage' | 'amount';
  value: number;
  quantity: number;
  used: number;
  status: 'active' | 'expired';
  createdAt: string;
  expiresAt: string | null;
}

export interface CreateVoucherData {
  code: string;
  course?: string;
  type: 'percentage' | 'amount';
  value: number;
  quantity: number;
  expiresAt?: string;
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