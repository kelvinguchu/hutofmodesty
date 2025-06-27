"use server";

import { cache } from "react";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";
import config from "@/payload.config";
import type { AuthUser } from "./types";

// Verify user session using Payload's auth method
export const verifySession = cache(async () => {
  try {
    const payload = await getPayload({ config });
    const headers = await getHeaders();

    const { user } = await payload.auth({ headers });

    if (!user) {
      return { isAuth: false, user: null };
    }

    return {
      isAuth: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        cart: user.cart,
        wishlist: user.wishlist,
        profilePhoto: user.profilePhoto,
        savedShippingAddress: user.savedShippingAddress,
        role: user.role as "customer" | "admin",
      } as AuthUser,
    };
  } catch (error) {
    // Session verification failed - return unauthenticated state
    return { isAuth: false, user: null };
  }
});

// Get user data - only call this after verifying session
export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session.isAuth) return null;

  return session.user;
});

// Check if user has specific role
export const hasRole = cache(async (role: "customer" | "admin") => {
  const user = await getUser();
  if (!user) return false;
  return user.role === role;
});

// Check if user is admin
export const isAdmin = cache(async () => {
  return await hasRole("admin");
});
