"use client";

import { useCallback } from "react";
import { useCartStore, type CartItem } from "@/lib/cart/cartStore";
import { useRealTimeSync } from "./useRealTimeSync";

interface UseCartWithSyncOptions {
  isAuthenticated: boolean;
}

export function useCartWithSync(options: UseCartWithSyncOptions) {
  const {
    items,
    itemCount,
    total,
    addItem: addItemLocal,
    removeItem: removeItemLocal,
    updateQuantity: updateQuantityLocal,
    clearCart,
    isInCart,
    syncInProgress,
    lastSyncError,
    _setSyncState,
    _setItems,
  } = useCartStore();

  const { syncAddToCart, syncRemoveFromCart, syncUpdateCartQuantity } =
    useRealTimeSync();

  const addItem = useCallback(
    async (item: CartItem) => {
      // Always update local state first for immediate UI feedback
      addItemLocal(item, { skipSync: true });

      // Sync with server if authenticated
      if (options.isAuthenticated) {
        _setSyncState(true);
        try {
          const result = await syncAddToCart(item, { isAuthenticated: true });
          if (!result.success) {
            // Revert local change if sync failed
            removeItemLocal(item.id, { skipSync: true });
            _setSyncState(false, result.error || "Failed to sync");
            throw new Error(result.error || "Failed to sync cart");
          }
          _setSyncState(false);
        } catch (error) {
          _setSyncState(
            false,
            error instanceof Error ? error.message : "Sync failed"
          );
          throw error;
        }
      }
    },
    [
      options.isAuthenticated,
      addItemLocal,
      removeItemLocal,
      syncAddToCart,
      _setSyncState,
    ]
  );

  const removeItem = useCallback(
    async (id: string) => {
      // Always update local state first for immediate UI feedback
      const itemToRemove = items.find((item) => item.id === id);
      removeItemLocal(id, { skipSync: true });

      // Sync with server if authenticated
      if (options.isAuthenticated) {
        _setSyncState(true);
        try {
          const result = await syncRemoveFromCart(id, {
            isAuthenticated: true,
          });
          if (!result.success) {
            // Revert local change if sync failed
            if (itemToRemove) {
              addItemLocal(itemToRemove, { skipSync: true });
            }
            _setSyncState(false, result.error || "Failed to sync");
            throw new Error(result.error || "Failed to sync cart");
          }
          _setSyncState(false);
        } catch (error) {
          _setSyncState(
            false,
            error instanceof Error ? error.message : "Sync failed"
          );
          throw error;
        }
      }
    },
    [
      options.isAuthenticated,
      items,
      removeItemLocal,
      addItemLocal,
      syncRemoveFromCart,
      _setSyncState,
    ]
  );

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      // Store original item for potential revert
      const originalItem = items.find((item) => item.id === id);

      // Always update local state first for immediate UI feedback
      updateQuantityLocal(id, quantity, { skipSync: true });

      // Sync with server if authenticated
      if (options.isAuthenticated) {
        _setSyncState(true);
        try {
          const result = await syncUpdateCartQuantity(id, quantity, {
            isAuthenticated: true,
          });
          if (!result.success) {
            // Revert local change if sync failed
            if (originalItem) {
              updateQuantityLocal(id, originalItem.quantity, {
                skipSync: true,
              });
            }
            _setSyncState(false, result.error || "Failed to sync");
            throw new Error(result.error || "Failed to sync cart");
          }
          _setSyncState(false);
        } catch (error) {
          _setSyncState(
            false,
            error instanceof Error ? error.message : "Sync failed"
          );
          throw error;
        }
      }
    },
    [
      options.isAuthenticated,
      items,
      updateQuantityLocal,
      syncUpdateCartQuantity,
      _setSyncState,
    ]
  );

  const syncCartFromServer = useCallback(
    async (serverCart?: any[]) => {
      if (!options.isAuthenticated) return;

      _setSyncState(true);
      try {
        let cartData = serverCart;

        // Only fetch from server if cart data not provided
        if (!cartData) {
          const response = await fetch("/api/users/me", {
            credentials: "include",
          });

          if (response.ok) {
            const userData = await response.json();
            cartData = userData.user?.cart || [];
          } else {
            throw new Error("Failed to fetch user data");
          }
        }

        // Update local state with server data
        _setItems(cartData || []);
        _setSyncState(false);
      } catch (error) {
        _setSyncState(
          false,
          error instanceof Error ? error.message : "Failed to sync"
        );
        throw error;
      }
    },
    [options.isAuthenticated, _setSyncState, _setItems]
  );

  return {
    items,
    itemCount,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    syncInProgress,
    lastSyncError,
    syncCartFromServer,
  };
}
