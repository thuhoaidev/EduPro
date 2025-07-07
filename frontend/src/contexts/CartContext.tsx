import React, { createContext, useContext, useState, useEffect } from 'react';
import { config } from '../api/axios';

interface CartContextType {
  cartCount: number;
  cartItems: any[];
  updateCartCount: () => Promise<void>;
  addToCart: (courseId: string) => Promise<boolean>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  isInCart: (courseId: string) => boolean;
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
      const response = await config.get('/carts');
      const items = response.data.items || [];
      setCartCount(items.length);
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
      setCartItems([]);
    }
  };

  const addToCart = async (courseId: string): Promise<boolean> => {
    try {
      await config.post('/carts', { courseId });
      await updateCartCount();
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      await config.delete(`/carts/${cartItemId}`);
      await updateCartCount();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const isInCart = (courseId: string): boolean => {
    return cartItems.some(item => item.course?._id === courseId);
  };

  useEffect(() => {
    updateCartCount();
  }, []);

  const value = {
    cartCount,
    cartItems,
    updateCartCount,
    addToCart,
    removeFromCart,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 