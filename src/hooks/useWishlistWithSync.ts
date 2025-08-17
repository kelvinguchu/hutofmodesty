"use client";

import { useCallback } from "react";
import {
  useWishlistStore,
  type WishlistItem,
} from "@/lib/wishlist/wishlistStore";
import { useRealTimeSync } from "./useRealTimeSync";

interface UseWishlistWithSyncOptions {
  isAuthenticated: boolean;
}

export function useWishlistWithSync(options: UseWishlistWithSyncOptions) {
  const {
    items,
    itemCount,
    addItem: addItemLocal,
    removeItem: removeItemLocal,
    clearWishlist,
    isInWishlist,
    syncInProgress,
    lastSyncError,
    _setSyncState,
    _setItems,
  } = useWishlistStore();

  const { syncAddToWishlist, syncRemoveFromWishlist } = useRealTimeSync();

  const addItem = useCallback(
    async (item: WishlistItem) => {
      // Check if item already exists
      if (isInWishlist(item.id)) {
        return; // Item already in wishlist
      }

      // Always update local state first for immediate UI feedback
      addItemLocal(item, { skipSync: true });

      // Sync with server if authenticated
      if (options.isAuthenticated) {
        _setSyncState(true);
        try {
          const result = await syncAddToWishlist(item, {
            isAuthenticated: true,
          });
          if (!result.success) {
            // Revert local change if sync failed
            removeItemLocal(item.id, { skipSync: true });
            _setSyncState(false, result.error || "Failed to sync");
            throw new Error(result.error || "Failed to sync wishlist");
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
      isInWishlist,
      addItemLocal,
      removeItemLocal,
      syncAddToWishlist,
      _setSyncState,
    ]
  );

  const removeItem = useCallback(
    async (id: string) => {
      // Store original item for potential revert
      const itemToRemove = items.find((item) => item.id === id);

      // Always update local state first for immediate UI feedback
      removeItemLocal(id, { skipSync: true });

      // Sync with server if authenticated
      if (options.isAuthenticated) {
        _setSyncState(true);
        try {
          const result = await syncRemoveFromWishlist(id, {
            isAuthenticated: true,
          });
          if (!result.success) {
            // Revert local change if sync failed
            if (itemToRemove) {
              addItemLocal(itemToRemove, { skipSync: true });
            }
            _setSyncState(false, result.error || "Failed to sync");
            throw new Error(result.error || "Failed to sync wishlist");
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
      syncRemoveFromWishlist,
      _setSyncState,
    ]
  );

  const syncWishlistFromServer = useCallback(
    async (serverWishlist?: any[]) => {
      if (!options.isAuthenticated) return;

      _setSyncState(true);
      try {
        let wishlistData = serverWishlist;

        // Only fetch from server if wishlist data not provided
        if (!wishlistData) {
          const response = await fetch("/api/users/me", {
            credentials: "include",
          });

          if (response.ok) {
            const userData = await response.json();
            wishlistData = userData.user?.wishlist || [];
          } else {
            throw new Error("Failed to fetch user data");
          }
        }

        // Update local state with server data
        _setItems(wishlistData || []);
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
    addItem,
    removeItem,
    clearWishlist,
    isInWishlist,
    syncInProgress,
    lastSyncError,
    syncWishlistFromServer,
  };
}
