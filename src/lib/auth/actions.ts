"use server";

import { redirect } from "next/navigation";
import { login, logout, refresh } from "@payloadcms/next/auth";
import config from "@/payload.config";
import type { RegisterData } from "./types";
import { getPayload } from "payload";

export interface FormState {
  errors?: {
    email?: string[];
    password?: string[];
    firstName?: string[];
    lastName?: string[];
    general?: string[];
  };
  success?: boolean;
  message?: string;
}

// Login action using Payload's built-in login
export async function loginAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Basic validation
  if (!email || !password) {
    return {
      errors: {
        email: !email ? ["Email is required"] : undefined,
        password: !password ? ["Password is required"] : undefined,
      },
    };
  }

  try {
    const result = await login({
      collection: "users",
      config,
      email,
      password,
    });

    if (result.user) {
      // Success - redirect will happen on client side
      return { success: true, message: "Login successful" };
    } else {
      return {
        errors: {
          general: ["Invalid email or password"],
        },
      };
    }
  } catch (error) {
    return {
      errors: {
        general: [error instanceof Error ? error.message : "Login failed"],
      },
    };
  }
}

// Register action using Payload's create operation
export async function registerAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  // Basic validation
  const errors: FormState["errors"] = {};

  if (!email) errors.email = ["Email is required"];
  if (!password) errors.password = ["Password is required"];
  if (!firstName) errors.firstName = ["First name is required"];
  if (!lastName) errors.lastName = ["Last name is required"];

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    const payload = await getPayload({ config });

    // Create the user
    const newUser = await payload.create({
      collection: "users",
      data: {
        email,
        password,
        firstName,
        lastName,
        role: "customer",
      },
    });

    if (newUser) {
      // Auto-login after registration
      try {
        await login({
          collection: "users",
          config,
          email,
          password,
        });
        return { success: true, message: "Registration successful" };
      } catch (loginError) {
        return {
          success: true,
          message:
            "Registration successful, but auto-login failed. Please log in manually.",
        };
      }
    } else {
      return {
        errors: {
          general: ["Registration failed"],
        },
      };
    }
  } catch (error) {
    // Handle duplicate email error with proper type checking
    if (
      error instanceof Error &&
      (error.message.includes("duplicate") ||
        error.message.includes("already exists"))
    ) {
      return {
        errors: {
          email: ["An account with this email already exists"],
        },
      };
    }

    return {
      errors: {
        general: [
          error instanceof Error ? error.message : "Registration failed",
        ],
      },
    };
  }
}

// Logout action using Payload's built-in logout
export async function logoutAction() {
  try {
    await logout({
      config,
    });
  } catch (error) {
    // Silent fail - always redirect regardless
  }

  // Always redirect to home after logout attempt
  redirect("/");
}

// Refresh token action - simplified for Payload CMS
export async function refreshAction() {
  try {
    // For Payload CMS, we don't need to call refresh explicitly
    // The session is handled automatically via cookies
    // This function is kept for compatibility but may not be needed
    return { success: true };
  } catch (error) {
    throw new Error(
      `Refresh failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
