// src/context/CartContext.tsx
import React, { createContext, useContext, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
};

type CartContextType = {
  items: CartItem[];
  addItem: (p: { id: string; name: string; price: number; image?: string | null }, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const addItem = (product: { id: string; name: string; price: number; image?: string | null }, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + qty };
        return copy;
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: qty, image: product.image ?? null }];
    });
    setDrawerOpen(true); // abre drawer automaticamente quando adicionar
  };

  const removeItem = (productId: string) => setItems(prev => prev.filter(i => i.id !== productId));
  const updateQuantity = (productId: string, qty: number) =>
    setItems(prev => prev.map(i => (i.id === productId ? { ...i, quantity: qty } : i)));
  const clearCart = () => setItems([]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.quantity * i.price, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, drawerOpen, setDrawerOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
