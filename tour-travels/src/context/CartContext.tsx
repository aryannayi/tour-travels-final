import React, { createContext, useContext, useState } from 'react';

interface CartItem {
  tourId: string;
  title: string;
  price: number;
  image: string;
  date: string;
  people: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (tourId: string) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCartItems(prev => [...prev.filter(i => i.tourId !== item.tourId), item]);
  };

  const removeFromCart = (tourId: string) => {
    setCartItems(prev => prev.filter(item => item.tourId !== tourId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.people), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      getTotalAmount,
    }}>
      {children}
    </CartContext.Provider>
  );
};