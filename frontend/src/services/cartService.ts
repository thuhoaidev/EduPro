import { config } from '../api/axios';

export interface CartItem {
  _id: string;
  course: {
    _id: string;
    title: string;
    price: number;
    thumbnail: string;
    discount?: number;
    instructor?: {
      name?: string;
    };
    slug: string;
  };
  addedAt: string;
}

export interface CartResponse {
  success: boolean;
  items: CartItem[];
  message?: string;
}

export const cartService = {
  // Lấy danh sách giỏ hàng
  getCart: async (): Promise<CartResponse> => {
    try {
      const response = await config.get('/carts');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Thêm khóa học vào giỏ hàng
  addToCart: async (courseId: string): Promise<boolean> => {
    try {
      await config.post('/carts', { courseId });
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  },

  // Xóa khóa học khỏi giỏ hàng
  removeFromCart: async (cartItemId: string): Promise<boolean> => {
    try {
      await config.delete(`/carts/${cartItemId}`);
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  },

  // Xóa nhiều khóa học khỏi giỏ hàng
  removeMultipleFromCart: async (cartItemIds: string[]): Promise<boolean> => {
    try {
      await Promise.all(
        cartItemIds.map(id => config.delete(`/carts/${id}`))
      );
      return true;
    } catch (error) {
      console.error('Error removing multiple items from cart:', error);
      return false;
    }
  }
}; 