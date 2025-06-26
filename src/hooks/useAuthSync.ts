"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useCart } from "@/lib/cart/CartContext";
import { useWishlistStore } from "@/lib/wishlist/wishlistStore";

export function useAuthSync() {
  const { user } = useAuth();
  const { items: cartItems, addItem: addCartItem } = useCart();
  const { items: wishlistItems, addItem: addWishlistItem } = useWishlistStore();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!user || hasSyncedRef.current) return;

    const syncUserData = async () => {
      try {
        // Add a small delay to ensure authentication cookie has propagated
        await new Promise((resolve) => setTimeout(resolve, 500));

        // ---- Sync cart then wishlist SEQUENTIALLY to avoid write conflicts ----

        if (cartItems.length > 0) {
          try {
            await Promise.race([
              fetch("/api/users/sync-cart", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ cartItems }),
              }),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Cart sync timeout")), 100000)
              ),
            ]);
          } catch (error) {
            // Cart sync failed silently
          }
        }

        if (wishlistItems.length > 0) {
          try {
            await Promise.race([
              fetch("/api/users/sync-wishlist", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ wishlistItems }),
              }),
              new Promise((_, reject) =>
                setTimeout(
                  () => reject(new Error("Wishlist sync timeout")),
                  100000
                )
              ),
            ]);
          } catch (error) {
            // Wishlist sync failed silently
          }
        }

        // Fetch updated user data using Payload's built-in endpoint
        const userDataResponse = await fetch("/api/users/me", {
          credentials: "include",
        });

        if (userDataResponse.ok) {
          const userData = await userDataResponse.json();

          // Merge server data with local data if local is empty
          if (cartItems.length === 0 && userData.user?.cart?.length > 0) {
            // Load server cart data into local state
            userData.user.cart.forEach((item: unknown) => {
              try {
                // Validate item structure before adding
                if (
                  item &&
                  typeof item === "object" &&
                  "id" in item &&
                  "name" in item &&
                  "price" in item &&
                  "quantity" in item
                ) {
                  addCartItem(item as any); // Type assertion after validation
                }
              } catch (error) {
                // Failed to add cart item silently
              }
            });
          }

          if (
            wishlistItems.length === 0 &&
            userData.user?.wishlist?.length > 0
          ) {
            // Load server wishlist data into local state
            userData.user.wishlist.forEach((item: unknown) => {
              try {
                // Validate item structure before adding
                if (item && typeof item === "object" && "id" in item) {
                  addWishlistItem(item as any); // Type assertion after validation
                }
              } catch (error) {
                // Failed to add wishlist item silently
              }
            });
          }
        }
      } catch (error) {
        // Failed to sync user data silently
      } finally {
        // Mark as synced to prevent repeated calls
        hasSyncedRef.current = true;
      }
    };

    syncUserData();
  }, [user]); // Removed cartItems and wishlistItems from dependencies to prevent unnecessary calls

  // Reset sync flag when user logs out
  useEffect(() => {
    if (!user) {
      hasSyncedRef.current = false;
    }
  }, [user]);

  return { user };
}
