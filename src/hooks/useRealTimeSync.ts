"use client";

import { useCallback } from "react";
import type { CartItem } from "@/lib/cart/cartStore";
import type { WishlistItem } from "@/lib/wishlist/wishlistStore";
import { apiCall, offlineQueue, isOnline } from "@/lib/utils/networkUtils";

interface SyncOptions {
  isAuthenticated: boolean;
}

export function useRealTimeSync() {
  // Helper function to handle sync operations with enhanced error handling
  const performSync = useCallback(
    async (
      url: string,
      data: any,
      operationName: string
    ): Promise<{ success: boolean; error?: string }> => {
      // If offline, queue the operation
      if (!isOnline()) {
        offlineQueue.add(async () => {
          await performSync(url, data, operationName);
        });
        return { success: true }; // Return success for UI, will sync when online
      }

      try {
        const result = await apiCall(
          url,
          {
            method: "POST",
            body: JSON.stringify(data),
          },
          {
            maxRetries: 3,
            baseDelay: 1000,
            timeout: 30000,
          }
        );

        return { success: result.success };
      } catch (error: any) {
        // If it's a retryable error, queue for later
        if (error.isRetryable) {
          offlineQueue.add(async () => {
            await performSync(url, data, operationName);
          });
        }

        return {
          success: false,
          error: error.message || `Failed to sync ${operationName}`,
        };
      }
    },
    []
  );

  // Cart sync functions
  const syncAddToCart = useCallback(
    async (
      item: CartItem,
      options: SyncOptions
    ): Promise<{ success: boolean; error?: string }> => {
      if (!options.isAuthenticated) {
        return { success: true }; // Local storage only for guests
      }

      return performSync("/api/users/cart/add", { item }, "cart add");
    },
    [performSync]
  );

  const syncRemoveFromCart = useCallback(
    async (
      itemId: string,
      options: SyncOptions
    ): Promise<{ success: boolean; error?: string }> => {
      if (!options.isAuthenticated) {
        return { success: true }; // Local storage only for guests
      }

      return performSync("/api/users/cart/remove", { itemId }, "cart remove");
    },
    [performSync]
  );

  const syncUpdateCartQuantity = useCallback(
    async (
      itemId: string,
      quantity: number,
      options: SyncOptions
    ): Promise<{ success: boolean; error?: string }> => {
      if (!options.isAuthenticated) {
        return { success: true }; // Local storage only for guests
      }

      return performSync(
        "/api/users/cart/update",
        { itemId, quantity },
        "cart update"
      );
    },
    [performSync]
  );

  // Wishlist sync functions
  const syncAddToWishlist = useCallback(
    async (
      item: WishlistItem,
      options: SyncOptions
    ): Promise<{ success: boolean; error?: string }> => {
      if (!options.isAuthenticated) {
        return { success: true }; // Local storage only for guests
      }

      return performSync("/api/users/wishlist/add", { item }, "wishlist add");
    },
    [performSync]
  );

  const syncRemoveFromWishlist = useCallback(
    async (
      itemId: string,
      options: SyncOptions
    ): Promise<{ success: boolean; error?: string }> => {
      if (!options.isAuthenticated) {
        return { success: true }; // Local storage only for guests
      }

      return performSync(
        "/api/users/wishlist/remove",
        { itemId },
        "wishlist remove"
      );
    },
    [performSync]
  );

  return {
    syncAddToCart,
    syncRemoveFromCart,
    syncUpdateCartQuantity,
    syncAddToWishlist,
    syncRemoveFromWishlist,
  };
}
