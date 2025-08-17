"use client";

import { useCallback, useRef } from "react";
import { useCartStore } from "@/lib/cart/cartStore";
import { useWishlistStore } from "@/lib/wishlist/wishlistStore";

function mergeCartData(localCart: any[], serverCart: any[]) {
  const merged = [...serverCart];

  localCart.forEach((localItem) => {
    const existingIndex = merged.findIndex(
      (serverItem) => serverItem.id === localItem.id
    );

    if (existingIndex >= 0) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        quantity: merged[existingIndex].quantity + localItem.quantity,
        name: localItem.name || merged[existingIndex].name,
        price: localItem.price || merged[existingIndex].price,
        image: localItem.image || merged[existingIndex].image,
      };
    } else {
      merged.push(localItem);
    }
  });

  return merged;
}

function mergeWishlistData(localWishlist: any[], serverWishlist: any[]) {
  const merged = [...serverWishlist];

  localWishlist.forEach((localItem) => {
    const exists = merged.some((serverItem) => serverItem.id === localItem.id);

    if (!exists) {
      merged.push(localItem);
    } else {
      const existingIndex = merged.findIndex(
        (serverItem) => serverItem.id === localItem.id
      );
      merged[existingIndex] = {
        ...merged[existingIndex],
        name: localItem.name || merged[existingIndex].name,
        price: localItem.price || merged[existingIndex].price,
        image: localItem.image || merged[existingIndex].image,
      };
    }
  });

  return merged;
}

export function useUserDataSync() {
  const {
    items: cartItems,
    addItem: addCartItem,
    clearCart,
    _setItems: setCartItems,
  } = useCartStore();
  const {
    items: wishlistItems,
    addItem: addWishlistItem,
    clearWishlist,
    _setItems: setWishlistItems,
  } = useWishlistStore();

  const syncInProgress = useRef(false);

  const syncUserData = useCallback(async () => {
    if (syncInProgress.current) {
      return;
    }

    syncInProgress.current = true;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const userDataResponse = await fetch("/api/users/me", {
        credentials: "include",
      });

      if (!userDataResponse.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await userDataResponse.json();
      const serverCart = userData.user?.cart || [];
      const serverWishlist = userData.user?.wishlist || [];

      const mergedCart = mergeCartData(cartItems, serverCart);
      const mergedWishlist = mergeWishlistData(wishlistItems, serverWishlist);

      let cartSynced = false;
      let wishlistSynced = false;

      if (mergedCart.length > 0 || serverCart.length > 0) {
        try {
          const response = await fetch("/api/users/sync-cart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ cartItems: mergedCart }),
          });

          if (response.ok) {
            cartSynced = true;
          }
        } catch (error) {
          // Cart sync failed - continue with local data
        }
      }

      if (mergedWishlist.length > 0 || serverWishlist.length > 0) {
        try {
          const response = await fetch("/api/users/sync-wishlist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ wishlistItems: mergedWishlist }),
          });

          if (response.ok) {
            wishlistSynced = true;
          }
        } catch (error) {
          // Wishlist sync failed - continue with local data
        }
      }

      if (cartSynced || cartItems.length === 0) {
        setCartItems(mergedCart);
      }

      if (wishlistSynced || wishlistItems.length === 0) {
        setWishlistItems(mergedWishlist);
      }
    } catch (error) {
      throw new Error("Failed to sync user data");
    } finally {
      syncInProgress.current = false;
    }
  }, [cartItems, wishlistItems, setCartItems, setWishlistItems]);

  const clearLocalData = () => {
    clearCart();
    clearWishlist();
  };

  const clearServerData = async () => {
    try {
      await Promise.all([
        fetch("/api/users/sync-cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ cartItems: [] }),
        }),
        fetch("/api/users/sync-wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ wishlistItems: [] }),
        }),
      ]);
    } catch (error) {}
  };

  const clearAllData = async () => {
    clearLocalData();
    await clearServerData();
  };

  const clearCartData = async () => {
    clearCart();
    try {
      await fetch("/api/users/sync-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ cartItems: [] }),
      });
    } catch (error) {}
  };

  const clearWishlistData = async () => {
    clearWishlist();
    try {
      await fetch("/api/users/sync-wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ wishlistItems: [] }),
      });
    } catch (error) {}
  };

  return {
    syncUserData,
    clearLocalData,
    clearServerData,
    clearAllData,
    clearCartData,
    clearWishlistData,
  };
}
