"use client";

import { useCartStore } from "@/lib/cart/cartStore";
import { useWishlistStore } from "@/lib/wishlist/wishlistStore";

export function useUserDataSync() {
  const { items: cartItems, addItem: addCartItem, clearCart } = useCartStore();
  const {
    items: wishlistItems,
    addItem: addWishlistItem,
    clearWishlist,
  } = useWishlistStore();

  const syncUserData = async () => {
    try {
      // Add a small delay to ensure authentication cookie has propagated
      await new Promise((resolve) => setTimeout(resolve, 500));

      let cartSynced = false;
      let wishlistSynced = false;

      // Sync cart to database then clear local storage
      if (cartItems.length > 0) {
        try {
          const response = await fetch("/api/users/sync-cart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ cartItems }),
          });

          if (response.ok) {
            cartSynced = true;
          }
        } catch (error) {
          // Cart sync failed - keep local data
        }
      }

      // Sync wishlist to database then clear local storage
      if (wishlistItems.length > 0) {
        try {
          const response = await fetch("/api/users/sync-wishlist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ wishlistItems }),
          });

          if (response.ok) {
            wishlistSynced = true;
          }
        } catch (error) {
          // Wishlist sync failed - keep local data
        }
      }

      // Fetch updated user data from server
      const userDataResponse = await fetch("/api/users/me", {
        credentials: "include",
      });

      if (userDataResponse.ok) {
        const userData = await userDataResponse.json();

        // Only clear local data if sync was successful
        if (cartSynced && cartItems.length > 0) {
          clearCart();
        }

        if (wishlistSynced && wishlistItems.length > 0) {
          clearWishlist();
        }

        // Load server data into local state if local is empty and server has data
        if (cartItems.length === 0 && userData.user?.cart?.length > 0) {
          userData.user.cart.forEach((item: any) => {
            try {
              if (
                item &&
                typeof item === "object" &&
                "id" in item &&
                "name" in item &&
                "price" in item &&
                "quantity" in item
              ) {
                addCartItem(item);
              }
            } catch (error) {
              // Failed to add cart item - continue
            }
          });
        }

        if (wishlistItems.length === 0 && userData.user?.wishlist?.length > 0) {
          userData.user.wishlist.forEach((item: any) => {
            try {
              if (item && typeof item === "object" && "id" in item) {
                addWishlistItem(item);
              }
            } catch (error) {
              // Failed to add wishlist item - continue
            }
          });
        }
      }
    } catch (error) {
      // Sync failed - keep local data intact
      throw new Error("Failed to sync user data");
    }
  };

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
    } catch (error) {
      // Server clear failed - continue
    }
  };

  const clearAllData = async () => {
    clearLocalData();
    await clearServerData();
  };

  // Separate functions for clearing only cart or only wishlist
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
    } catch (error) {
      // Server clear failed - continue
    }
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
    } catch (error) {
      // Server clear failed - continue
    }
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
