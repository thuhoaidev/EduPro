import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { config } from '../api/axios';
import { cartApiMonitor } from '../utils/cartApiMonitor';

interface CartContextType {
  cartCount: number;
  cartItems: any[];
  updateCartCount: () => Promise<void>;
  refreshCart: () => Promise<void>;
  addToCart: (courseId: string) => Promise<boolean>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  removeItemsFromCart: (cartItemIds: string[]) => Promise<void>;
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
  const [isUpdating, setIsUpdating] = useState(false);
  const lastUpdateTime = useRef<number>(0);

  const updateCartCount = async () => {
    // Throttle: chỉ cho phép gọi API mỗi 2 giây
    const now = Date.now();
    if (isUpdating || (now - lastUpdateTime.current < 2000)) {
      console.log('Cart update throttled - skipping API call');
      return;
    }

    try {
      setIsUpdating(true);
      lastUpdateTime.current = now;
      
      // Log the API call
      cartApiMonitor.logCall('CartContext', 'updateCartCount');
      
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
      const newCount = items.length;
      
      // Chỉ cập nhật nếu số lượng thực sự thay đổi
      if (newCount !== cartCount || JSON.stringify(items) !== JSON.stringify(cartItems)) {
        setCartCount(newCount);
        setCartItems(items);
        // Emit event để thông báo cho Header
        window.dispatchEvent(new CustomEvent('cart-updated'));
        console.log('Cart updated - Count:', newCount, 'Items:', items.length);
      } else {
        console.log('Cart data unchanged, skipping update');
      }
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
    } finally {
      setIsUpdating(false);
    }
  };

  // Alias cho updateCartCount để dễ sử dụng từ bên ngoài
  const refreshCart = updateCartCount;

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
      
      // Emit event để thông báo cho Header
      window.dispatchEvent(new CustomEvent('cart-item-added', { detail: { courseId } }));
      window.dispatchEvent(new CustomEvent('cart-updated'));
      
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
      
      // Emit event để thông báo cho Header
      window.dispatchEvent(new CustomEvent('cart-item-removed', { detail: { cartItemId } }));
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      
      if (error.response?.status === 401) {
        console.log('Token không hợp lệ khi xóa khỏi giỏ hàng');
      }
    }
  };

  const removeItemsFromCart = async (cartItemIds: string[]) => {
    try {
      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Không có token, không thể xóa khỏi giỏ hàng');
        return;
      }

      if (!cartItemIds || cartItemIds.length === 0) {
        console.log('Không có items để xóa');
        return;
      }

      await config.delete('/carts/bulk', { data: { itemIds: cartItemIds } });
      await updateCartCount();
      
      // Emit event để thông báo cho Header
      window.dispatchEvent(new CustomEvent('cart-item-removed', { detail: { cartItemIds } }));
      window.dispatchEvent(new CustomEvent('cart-updated'));
      
      console.log('✅ Đã xóa các món hàng đã thanh toán:', cartItemIds);
    } catch (error: any) {
      console.error('Error removing items from cart:', error);
      
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
        // Không có token, chỉ xóa local state
        setCartCount(0);
        setCartItems([]);
        return;
      }

      // Gọi API để xóa tất cả items trong giỏ hàng
      await config.delete('/carts');
      
      // Cập nhật state local
      setCartCount(0);
      setCartItems([]);
      
      // Emit event để thông báo cho Header
      window.dispatchEvent(new CustomEvent('cart-updated'));
      
      console.log('✅ Đã xóa giỏ hàng thành công - Cart count:', 0, 'Items:', []);
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      
      // Nếu lỗi API, vẫn xóa local state
      setCartCount(0);
      setCartItems([]);
      
      if (error.response?.status === 401) {
        // Token không hợp lệ, xóa token và chuyển về trang đăng nhập
        localStorage.removeItem('token');
        window.location.href = '/login';
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
  }, []); // Remove the problematic dependency

  // Add a separate effect to handle token changes
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        const newToken = event.newValue;
        if (newToken) {
          updateCartCount();
        } else {
          clearCart();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Expose refreshCart method to window object for external access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.cartContext = {
        refreshCart
      };
    }
  }, [refreshCart]);

  const value = {
    cartCount,
    cartItems,
    updateCartCount,
    refreshCart,
    addToCart,
    removeFromCart,
    removeItemsFromCart,
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