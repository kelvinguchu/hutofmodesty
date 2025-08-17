import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the wishlist item type
export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image?: string;
}

// Define the wishlist store state and actions
interface WishlistState {
  items: WishlistItem[];
  itemCount: number;
  addItem: (item: WishlistItem, options?: { skipSync?: boolean }) => void;
  removeItem: (id: string, options?: { skipSync?: boolean }) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  // Sync-related state
  syncInProgress: boolean;
  lastSyncError: string | null;
  // Internal methods for sync integration
  _setSyncState: (inProgress: boolean, error?: string | null) => void;
  _setItems: (items: WishlistItem[]) => void;
}

// Create a Zustand store with persistence to localStorage
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      syncInProgress: false,
      lastSyncError: null,

      addItem: (item: WishlistItem, options = {}) => {
        // Only add if it doesn't already exist
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) {
            return state; // Item already exists, return state unchanged
          }

          const updatedItems = [...state.items, item];
          return {
            items: updatedItems,
            itemCount: updatedItems.length,
          };
        });
      },

      removeItem: (id: string, options = {}) => {
        set((state) => {
          const updatedItems = state.items.filter((item) => item.id !== id);
          return {
            items: updatedItems,
            itemCount: updatedItems.length,
          };
        });
      },

      isInWishlist: (id: string) => {
        return get().items.some((item) => item.id === id);
      },

      clearWishlist: () => {
        set({ items: [], itemCount: 0 });
      },

      // Internal methods for sync integration
      _setSyncState: (inProgress: boolean, error: string | null = null) => {
        set({ syncInProgress: inProgress, lastSyncError: error });
      },

      _setItems: (items: WishlistItem[]) => {
        set({ items, itemCount: items.length });
      },
    }),
    {
      name: "wishlist-storage", // unique name for localStorage
    }
  )
);
