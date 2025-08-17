import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the cart item type
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// Define the cart store state and actions
interface CartState {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: CartItem, options?: { skipSync?: boolean }) => void;
  removeItem: (id: string, options?: { skipSync?: boolean }) => void;
  updateQuantity: (
    id: string,
    quantity: number,
    options?: { skipSync?: boolean }
  ) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  // Sync-related state
  syncInProgress: boolean;
  lastSyncError: string | null;
  // Internal methods for sync integration
  _setSyncState: (inProgress: boolean, error?: string | null) => void;
  _setItems: (items: CartItem[]) => void;
}

// Helper function to calculate totals
const calculateTotals = (items: CartItem[]) => {
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return { itemCount, total };
};

// Create a Zustand store with persistence to localStorage
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      total: 0,
      syncInProgress: false,
      lastSyncError: null,

      addItem: (item: CartItem, options = {}) => {
        set((state) => {
          // Check if the item already exists in the cart
          const existingItemIndex = state.items.findIndex(
            (i) => i.id === item.id
          );

          let updatedItems: CartItem[];
          if (existingItemIndex >= 0) {
            // Update the quantity of the existing item
            updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity:
                updatedItems[existingItemIndex].quantity + item.quantity,
            };
          } else {
            // Add the new item to the cart
            updatedItems = [...state.items, item];
          }

          const { itemCount, total } = calculateTotals(updatedItems);
          return {
            items: updatedItems,
            itemCount,
            total,
          };
        });
      },

      removeItem: (id: string, options = {}) => {
        set((state) => {
          const updatedItems = state.items.filter((item) => item.id !== id);
          const { itemCount, total } = calculateTotals(updatedItems);
          return {
            items: updatedItems,
            itemCount,
            total,
          };
        });
      },

      updateQuantity: (id: string, quantity: number, options = {}) => {
        if (quantity <= 0) {
          get().removeItem(id, options);
          return;
        }

        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          );
          const { itemCount, total } = calculateTotals(updatedItems);
          return {
            items: updatedItems,
            itemCount,
            total,
          };
        });
      },

      clearCart: () => {
        set({ items: [], itemCount: 0, total: 0 });
      },

      isInCart: (id: string) => {
        return get().items.some((item) => item.id === id);
      },

      // Internal methods for sync integration
      _setSyncState: (inProgress: boolean, error: string | null = null) => {
        set({ syncInProgress: inProgress, lastSyncError: error });
      },

      _setItems: (items: CartItem[]) => {
        const { itemCount, total } = calculateTotals(items);
        set({ items, itemCount, total });
      },
    }),
    {
      name: "cart-storage", // unique name for localStorage
    }
  )
);
