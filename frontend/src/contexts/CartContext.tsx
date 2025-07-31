import React, { createContext, useContext, useState, useEffect } from 'react';
import { config } from '../api/axios';

interface CartContextType {
  cartCount: number;
  cartItems: any[];
  updateCartCount: () => Promise<void>;
  addToCart: (courseId: string) => Promise<boolean>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  isInCart: (courseId: string) => boolean;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<any[]>([]);

  const updateCartCount = async () => {
    try {
      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Không có token, bỏ qua cập nhật giỏ hàng');
        setCartCount(0);
        setCartItems([]);
        return;
      }

      const response = await config.get('/carts');
      const items = response.data.items || [];
      setCartCount(items.length);
      setCartItems(items);
    } catch (error: any) {
      console.error('Error fetching cart count:', error);
      
      // Nếu lỗi 401, có thể token đã hết hạn
      if (error.response?.status === 401) {
        console.log('Token không hợp lệ, reset giỏ hàng');
        setCartCount(0);
        setCartItems([]);
        // Không xóa token ở đây vì axios interceptor sẽ xử lý
      } else {
        // Các lỗi khác, giữ nguyên trạng thái
        console.log('Lỗi khác khi lấy giỏ hàng:', error.message);
      }
    }
  };

  const addToCart = async (courseId: string): Promise<boolean> => {
    console.log('addToCart - courseId:', courseId);
    try {
      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Không có token, không thể thêm vào giỏ hàng');
        return false;
      }

      await config.post('/carts', { courseId });
      await updateCartCount();
      return true;
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      if (error.response) {
        console.error('Backend response:', error.response.data);
        
        // Hiển thị thông báo lỗi cụ thể từ backend
        if (error.response.data?.error) {
          // Sử dụng message từ antd để hiển thị thông báo
          const { message } = await import('antd');
          message.error(error.response.data.error);
        }
      }
      if (error.response?.status === 401) {
        console.log('Token không hợp lệ khi thêm vào giỏ hàng');
        return false;
      }
      return false;
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Không có token, không thể xóa khỏi giỏ hàng');
        return;
      }

      await config.delete(`/carts/${cartItemId}`);
      await updateCartCount();
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      
      if (error.response?.status === 401) {
        console.log('Token không hợp lệ khi xóa khỏi giỏ hàng');
      }
    }
  };

  const isInCart = (courseId: string): boolean => {
    return cartItems.some(item => item.course?._id === courseId);
  };

  // Hàm xóa giỏ hàng
  const clearCart = async () => {
    try {
      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Không có token, chỉ xóa local state');
        setCartCount(0);
        setCartItems([]);
        return;
      }

      // Gọi API để xóa tất cả items trong giỏ hàng
      await config.delete('/carts');
      
      // Cập nhật state local
      setCartCount(0);
      setCartItems([]);
      console.log('✅ Đã xóa giỏ hàng thành công - Cart count:', 0, 'Items:', []);
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      
      // Nếu lỗi API, vẫn xóa local state
      setCartCount(0);
      setCartItems([]);
      
      if (error.response?.status === 401) {
        console.log('Token không hợp lệ khi xóa giỏ hàng');
      }
    }
  };

  useEffect(() => {
    // Chỉ cập nhật giỏ hàng nếu có token
    const token = localStorage.getItem('token');
    if (token) {
      updateCartCount();
    } else {
      clearCart();
    }
  }, [localStorage.getItem('token')]);

  const value = {
    cartCount,
    cartItems,
    updateCartCount,
    addToCart,
    removeFromCart,
    isInCart,
    clearCart // export hàm clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider; 