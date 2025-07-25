import axios from 'axios';

// API Configuration
const API_URL = 'http://localhost:5000/api';

export interface OrderItem {
  courseId: string;
  quantity: number;
}

export interface CreateOrderData {
  items: OrderItem[];
  voucherCode?: string;
  paymentMethod?: 'bank_transfer' | 'momo' | 'vnpay' | 'zalopay';
  shippingInfo?: {
    fullName: string;
    phone: string;
    email: string;
  };
  notes?: string;
}


export interface Order {
  shippingAddress: any;
  id: string;
  items: Array<{
    courseId: {
      _id: string;
      title: string;
      thumbnail: string;
      price: number;
      discount?: number;
    };
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  voucher?: {
    _id: string;
    code: string;
    title: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
  };
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'bank_transfer' | 'momo' | 'vnpay' | 'zalopay';
  fullName?: string;
  phone?: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: {
    current: number;
    total: number;
    pageSize: number;
  };
}

class OrderService {
  // Tạo đơn hàng mới
  async createOrder(data: CreateOrderData, token: string): Promise<{ order: Order }> {
    try {
      const response = await axios.post(`${API_URL}/orders`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi tạo đơn hàng');
    }
  }

  // Lấy danh sách đơn hàng của user
  async getUserOrders(token: string, page: number = 1, limit: number = 10, status?: string): Promise<OrderListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (status) {
        params.append('status', status);
      }

      const response = await axios.get(`${API_URL}/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng');
    }
  }

  // Lấy chi tiết đơn hàng
  async getOrderDetail(orderId: string, token: string): Promise<{ order: Order }> {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy chi tiết đơn hàng');
    }
  }

  // Hủy đơn hàng
  async cancelOrder(orderId: string, token: string): Promise<void> {
    try {
      await axios.put(`${API_URL}/orders/${orderId}/cancel`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi hủy đơn hàng');
    }
  }

  // Hoàn thành thanh toán (admin)
  async completePayment(orderId: string, paymentMethod: string, token: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/orders/${orderId}/complete-payment`, 
        { paymentMethod },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi hoàn thành thanh toán');
    }
  }

  // Hoàn tiền đơn hàng cho một khóa học
  async refundOrder(orderId: string, courseId: string, token: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/orders/${orderId}/refund`, { courseId }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi hoàn tiền');
    }
  }
}

export default new OrderService(); 