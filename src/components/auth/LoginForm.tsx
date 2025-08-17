"use client";

import React, { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { loginAction, type FormState } from "@/lib/auth/actions";
import { useUserDataSync } from "@/hooks/useAuthSync";

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({
  redirectTo = "/account",
}: Readonly<LoginFormProps>) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const { syncUserData } = useUserDataSync();

  // Use useActionState to handle server action
  const [state, formAction, pending] = useActionState(loginAction, {});

  // Handle successful login or email verification redirect
  React.useEffect(() => {
    if (state.success && state.redirectTo) {
      // Sync user data (cart/wishlist) after successful login
      syncUserData()
        .then(() => {
          router.push(state.redirectTo || redirectTo);
          router.refresh(); // Refresh to update auth state
        })
        .catch((error) => {
          // Still redirect even if sync fails
          router.push(state.redirectTo || redirectTo);
          router.refresh();
        });
    } else if (state.redirectTo && !state.success) {
      // Redirect to email verification page (for unverified users)
      router.push(state.redirectTo);
    }
  }, [state.success, state.redirectTo, router, redirectTo, syncUserData]);

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-8'>
        <div className='text-center mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            Welcome Back
          </h2>
          <p className='text-gray-600'>Sign in to your account</p>
        </div>

        <form action={formAction} className='space-y-6'>
          {/* Hidden redirect field */}
          <input type='hidden' name='redirectTo' value={redirectTo} />

          <div>
            <label
              htmlFor='email'
              className='block text-sm font-semibold text-gray-700 mb-2'>
              Email Address
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Mail className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='email'
                id='email'
                name='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white'
                placeholder='Enter your email'
              />
            </div>
            {state.errors?.email && (
              <div className='mt-1 text-sm text-red-600'>
                {state.errors.email.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-semibold text-gray-700 mb-2'>
              Password
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Lock className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id='password'
                name='password'
                required
                className='w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white'
                placeholder='Enter your password'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer'>
                {showPassword ? (
                  <EyeOff className='h-5 w-5' />
                ) : (
                  <Eye className='h-5 w-5' />
                )}
              </button>
            </div>
            {state.errors?.password && (
              <div className='mt-1 text-sm text-red-600'>
                {state.errors.password.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>

          {state.errors?.general && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm'>
              {/* Check if it's an email verification error */}
              {state.errors.general.some(
                (error) =>
                  error.includes("verify your email") ||
                  error.includes("email address before logging")
              ) ? (
                <div>
                  <p className='font-medium mb-2'>
                    Please verify your email to continue.
                  </p>
                  <Link
                    href={`/verify-email?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirectTo)}`}
                    className='inline-flex items-center text-sm font-semibold text-red-700 hover:text-red-800 transition-colors'>
                    <Mail className='w-4 h-4 mr-1' />
                    Go to Email Verification
                  </Link>
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <span className='w-2 h-2 bg-red-500 rounded-full inline-block'></span>
                  {state.errors.general[0]}
                </div>
              )}
            </div>
          )}

          {/* Success message removed - redirect happens immediately */}

          <button
            type='submit'
            disabled={pending}
            className='w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-semibold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl cursor-pointer'>
            {pending ? (
              <>
                <Loader2 className='h-5 w-5 animate-spin' />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className='mt-6 text-center space-y-3'>
          <p className='text-sm text-gray-600'>
            <a
              href={`/forgot-password${redirectTo !== "/account" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
              className='text-primary hover:text-primary/80 font-medium cursor-pointer'>
              Forgot your password?
            </a>
          </p>
          <p className='text-sm text-gray-600'>
            Don't have an account?{" "}
            <a
              href={`/register${redirectTo !== "/account" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
              className='text-primary hover:text-primary/80 font-semibold cursor-pointer'>
              Create one here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
