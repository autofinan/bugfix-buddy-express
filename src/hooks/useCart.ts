import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image_url?: string;
  category?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
  discount: {
    type: 'percentage' | 'fixed' | null;
    value: number;
  };
  setDiscount: (type: 'percentage' | 'fixed' | null, value: number) => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      discount: {
        type: null,
        value: 0,
      },

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product_id === product.product_id
          );

          if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.stock) {
              return state; // Don't add if would exceed stock
            }
            
            return {
              items: state.items.map((item) =>
                item.product_id === product.product_id
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
            };
          }

          if (quantity > product.stock) {
            return state; // Don't add if would exceed stock
          }

          return {
            items: [...state.items, { ...product, quantity }],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product_id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => {
          const item = state.items.find((item) => item.product_id === productId);
          if (!item || quantity > item.stock) {
            return state; // Don't update if would exceed stock
          }

          return {
            items: state.items.map((item) =>
              item.product_id === productId ? { ...item, quantity } : item
            ),
          };
        });
      },

      clearCart: () => {
        set({ items: [], discount: { type: null, value: 0 } });
      },

      getSubtotal: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const { discount } = get();
        
        if (!discount.type || discount.value <= 0) {
          return subtotal;
        }

        if (discount.type === 'percentage') {
          return subtotal * (1 - discount.value / 100);
        } else {
          return Math.max(0, subtotal - discount.value);
        }
      },

      getItemCount: () => {
        const items = get().items;
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      setDiscount: (type, value) => {
        set({ discount: { type, value } });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);