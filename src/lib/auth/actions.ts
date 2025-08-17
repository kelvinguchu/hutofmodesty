"use server";

import { redirect } from "next/navigation";
import { login, logout } from "@payloadcms/next/auth";
import config from "@/payload.config";
import { getPayload } from "payload";

export interface FormState {
  errors?: {
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    firstName?: string[];
    lastName?: string[];
    token?: string[];
    general?: string[];
  };
  success?: boolean;
  message?: string;
  redirectTo?: string;
}

export async function loginAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirectTo") as string;

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
      // Check if user's email is verified
      const user = result.user as any;
      if (!user._verified) {
        return {
          errors: {
            general: ["Please verify your email address before logging in."],
          },
          redirectTo: `/verify-email?email=${encodeURIComponent(email)}`,
        };
      }

      return {
        success: true,
        message: "Login successful",
        redirectTo: redirectTo || "/account",
      };
    } else {
      return {
        errors: {
          general: ["Invalid email or password"],
        },
      };
    }
  } catch (error) {
    // Never expose technical errors to users
    return {
      errors: {
        general: ["Login failed. Please check your credentials and try again."],
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
  const confirmPassword = formData.get("confirmPassword") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  const errors: FormState["errors"] = {};

  // Basic field validation
  if (!email) errors.email = ["Email is required"];
  if (!password) errors.password = ["Password is required"];
  if (!confirmPassword)
    errors.confirmPassword = ["Please confirm your password"];
  if (!firstName) errors.firstName = ["First name is required"];
  if (!lastName) errors.lastName = ["Last name is required"];

  // Password strength validation
  if (password && password.length < 8) {
    errors.password = ["Password must be at least 8 characters long"];
  }

  // Password confirmation validation
  if (password && confirmPassword && password !== confirmPassword) {
    errors.confirmPassword = ["Passwords do not match"];
  }

  // Additional password security checks
  if (password && password.length >= 8) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      errors.password = [
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ];
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    const payload = await getPayload({ config });

    // First, check if a user with this email already exists
    const existingUserQuery = await payload.find({
      collection: "users",
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    });

    // If user already exists, return clear error
    if (existingUserQuery.docs.length > 0) {
      return {
        errors: {
          email: [
            "An account with this email already exists. Please use a different email or try logging in.",
          ],
        },
      };
    }
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
      // With email verification enabled, redirect to verification page instead of auto-login
      return {
        success: true,
        message:
          "Account created successfully! Please check your email to verify your account.",
        redirectTo: `/verify-email?email=${encodeURIComponent(email)}`,
      };
    } else {
      return {
        errors: {
          general: ["Registration failed"],
        },
      };
    }
  } catch (error) {
    // Since we check for duplicates proactively, this should handle other errors
    if (
      error instanceof Error &&
      (error.message.includes("duplicate") ||
        error.message.includes("already exists"))
    ) {
      // Fallback for any duplicate errors that slip through
      return {
        errors: {
          email: ["An account with this email already exists"],
        },
      };
    }

    // Never expose technical errors to users - always show generic message
    return {
      errors: {
        general: [
          "We're having trouble creating your account right now. Please try again in a few moments.",
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
  } catch (error) {}

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

// Forgot password action with clear user feedback
export async function forgotPasswordAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email") as string;

  if (!email) {
    return {
      errors: {
        email: ["Email is required"],
      },
    };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      errors: {
        email: ["Please enter a valid email address"],
      },
    };
  }

  try {
    const payload = await getPayload({ config });

    // First, check if a user with this email exists
    const userQuery = await payload.find({
      collection: "users",
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    });

    // If user doesn't exist, return clear error
    if (userQuery.docs.length === 0) {
      return {
        errors: {
          email: [
            "No account found with this email address. Please check your email or create a new account.",
          ],
        },
      };
    }
    // User exists, send the forgot password email
    await payload.forgotPassword({
      collection: "users",
      data: {
        email,
      },
    });

    return {
      success: true,
      message: "Reset link sent! Please check your email inbox.",
    };
  } catch (error) {
    // Never expose technical errors to users
    return {
      errors: {
        general: [
          "We're having trouble sending the reset link right now. Please try again in a few moments.",
        ],
      },
    };
  }
}

// Reset password action using Payload's built-in resetPassword
export async function resetPasswordAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  console.log("🔄 Reset Password Action Started", {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token ? `${token.substring(0, 10)}...` : "none",
    hasPassword: !!password,
    passwordLength: password?.length,
    hasConfirmPassword: !!confirmPassword,
    passwordsMatch: password === confirmPassword,
  });

  // Validation
  if (!token) {
    console.log("❌ Reset Password: Missing token");
    return {
      errors: {
        token: ["Reset token is required"],
      },
    };
  }

  if (!password) {
    console.log("❌ Reset Password: Missing password");
    return {
      errors: {
        password: ["Password is required"],
      },
    };
  }

  if (password.length < 8) {
    console.log("❌ Reset Password: Password too short", {
      length: password.length,
    });
    return {
      errors: {
        password: ["Password must be at least 8 characters long"],
      },
    };
  }

  if (password !== confirmPassword) {
    console.log("❌ Reset Password: Passwords do not match");
    return {
      errors: {
        password: ["Passwords do not match"],
      },
    };
  }

  try {
    console.log("🔧 Reset Password: Getting Payload instance");
    const payload = await getPayload({ config });

    console.log("🔧 Reset Password: Calling payload.resetPassword", {
      collection: "users",
      tokenPreview: `${token.substring(0, 10)}...`,
      overrideAccess: false,
    });

    // Use Payload's built-in resetPassword method
    // Override access control since resetPassword has its own token validation
    const result = await payload.resetPassword({
      collection: "users",
      data: {
        token,
        password,
      },
      overrideAccess: true, // Allow resetPassword to bypass access control
    });

    console.log("✅ Reset Password: Payload result", {
      hasResult: !!result,
      hasUser: !!result?.user,
      hasToken: !!result?.token,
      userId: result?.user?.id,
      userEmail: result?.user?.email,
    });

    if (result.user) {
      console.log("✅ Reset Password: Success - password reset completed");
      return {
        success: true,
        message:
          "Your password has been reset successfully. You can now log in with your new password.",
      };
    } else {
      console.log("❌ Reset Password: No user returned in result");
      return {
        errors: {
          general: ["Failed to reset password"],
        },
      };
    }
  } catch (error) {
    console.log("❌ Reset Password: Error occurred", {
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof Error) {
      if (
        error.message.includes("token") ||
        error.message.includes("expired")
      ) {
        console.log("❌ Reset Password: Token-related error");
        return {
          errors: {
            token: [
              "This reset link has expired or is invalid. Please request a new one.",
            ],
          },
        };
      }
    }

    console.log("❌ Reset Password: General error");
    return {
      errors: {
        general: [
          "We're having trouble resetting your password right now. Please try again in a few moments.",
        ],
      },
    };
  }
}

// Resend verification email action
export async function resendVerificationAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email") as string;

  if (!email) {
    return {
      errors: {
        email: ["Email is required"],
      },
    };
  }

  try {
    const payload = await getPayload({ config });

    // Find the user
    const userQuery = await payload.find({
      collection: "users",
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    });

    if (userQuery.docs.length === 0) {
      return {
        errors: {
          email: ["No account found with this email address"],
        },
      };
    }

    const user = userQuery.docs[0] as any;

    // Check if user is already verified
    if (user._verified) {
      return {
        errors: {
          general: ["This email address is already verified"],
        },
      };
    }

    // Check verification attempts (max 3)
    const now = new Date();
    const lastAttempt = user.lastVerificationAttempt
      ? new Date(user.lastVerificationAttempt)
      : null;
    const attempts = user.verificationAttempts || 0;

    // Reset attempts if it's been more than 24 hours since last attempt
    const shouldResetAttempts =
      !lastAttempt ||
      now.getTime() - lastAttempt.getTime() > 24 * 60 * 60 * 1000;

    if (!shouldResetAttempts && attempts >= 3) {
      console.log("❌ Resend Verification: Maximum attempts reached", {
        attempts,
        lastAttempt: lastAttempt?.toISOString(),
        hoursRemaining: Math.ceil(
          (24 * 60 * 60 * 1000 - (now.getTime() - lastAttempt!.getTime())) /
            (60 * 60 * 1000)
        ),
      });
      return {
        errors: {
          general: [
            "Maximum verification attempts reached. Please try again in 24 hours.",
          ],
        },
      };
    }

    // Update verification attempts
    const newAttempts = shouldResetAttempts ? 1 : attempts + 1;
    console.log("🔧 Resend Verification: Updating attempt count", {
      oldAttempts: attempts,
      newAttempts,
      shouldResetAttempts,
    });

    await payload.update({
      collection: "users",
      id: user.id,
      data: {
        verificationAttempts: newAttempts,
        lastVerificationAttempt: now.toISOString(),
      } as any,
    });

    // Trigger Payload's built-in verification email system
    // This will use our custom template from Users collection config
    console.log(
      "📧 Triggering Payload's verification email system for:",
      email
    );

    // Generate a new verification token for the user
    console.log("📧 Generating new verification token for user");

    // Use Payload's built-in verification token generation
    const crypto = await import("crypto");
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Update user with new verification token
    await payload.update({
      collection: "users",
      id: user.id,
      data: {
        _verificationToken: verificationToken,
      } as any,
    });

    console.log(
      "📧 Generated verification token:",
      verificationToken.substring(0, 10) + "..."
    );

    // Send verification email using our custom template
    const { generateEmailVerificationHTML, generateEmailVerificationSubject } =
      await import("../email/emailVerificationTemplate");

    const emailHTML = generateEmailVerificationHTML({
      token: verificationToken,
      user: user,
      req: null,
    });

    const emailSubject = generateEmailVerificationSubject();

    await payload.sendEmail({
      to: email,
      subject: emailSubject,
      html: emailHTML,
    });

    return {
      success: true,
      message: "Verification email sent! Please check your inbox.",
    };
  } catch (error) {
    return {
      errors: {
        general: [
          error instanceof Error
            ? error.message
            : "Failed to send verification email",
        ],
      },
    };
  }
}

// Verify email action
export async function verifyEmailAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const token = formData.get("token") as string;

  if (!token) {
    return {
      errors: {
        token: ["Verification token is required"],
      },
    };
  }

  try {
    console.log("🔍 Verify Email Action Started", {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token?.substring(0, 10) + "...",
    });

    const payload = await getPayload({ config });

    // Use Payload's built-in verifyEmail method
    console.log("🔍 Calling payload.verifyEmail with token");
    const result = await payload.verifyEmail({
      collection: "users",
      token,
    });

    console.log("🔍 Payload verifyEmail result:", {
      hasResult: !!result,
      result,
    });

    if (result) {
      console.log("✅ Verify Email: Success - email verified successfully");
      return {
        success: true,
        message:
          "Your email has been verified successfully! You can now log in to your account.",
        redirectTo: "/login",
      };
    } else {
      console.log("❌ Verify Email: Failed - invalid result from Payload");
      return {
        errors: {
          token: ["Invalid or expired verification token"],
        },
      };
    }
  } catch (error) {
    console.log("❌ Verify Email Error:", {
      error: error instanceof Error ? error.message : error,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack : null,
    });

    if (error instanceof Error) {
      if (
        error.message.includes("token") ||
        error.message.includes("expired")
      ) {
        return {
          errors: {
            token: [
              "This verification link has expired or is invalid. Please request a new one.",
            ],
          },
        };
      }
    }

    return {
      errors: {
        general: [
          error instanceof Error ? error.message : "Failed to verify email",
        ],
      },
    };
  }
}
