"use server";

import { redirect } from "next/navigation";
import { login, logout } from "@payloadcms/next/auth";
import config from "@/payload.config";
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

export async function loginAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

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

export async function registerAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

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
  }

  redirect("/");
}

// Refresh token action - simplified for Payload CMS
export async function refreshAction() {
  try {
    return { success: true };
  } catch (error) {
    throw new Error(
      `Refresh failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
