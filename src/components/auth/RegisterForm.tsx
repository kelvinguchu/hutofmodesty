"use client";

import React, { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";
import { registerAction, type FormState } from "@/lib/auth/actions";
import { useUserDataSync } from "@/hooks/useAuthSync";

interface RegisterFormProps {
  redirectTo?: string;
}

export function RegisterForm({
  redirectTo = "/account",
}: Readonly<RegisterFormProps>) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { syncUserData } = useUserDataSync();

  // Use useActionState to handle server action
  const [state, formAction, pending] = useActionState(registerAction, {});

  // Handle successful registration
  useEffect(() => {
    if (state.success) {
      // Sync user data (cart/wishlist) after successful registration
      syncUserData().then(() => {
        router.push(redirectTo);
        router.refresh(); // Refresh to update auth state
      });
    }
  }, [state.success, router, redirectTo, syncUserData]);

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-8'>
        <div className='text-center mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            Create Account
          </h2>
          <p className='text-gray-600'>Join us today and start shopping</p>
        </div>

        <form action={formAction} className='space-y-6'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='firstName'
                className='block text-sm font-semibold text-gray-700 mb-2'>
                First Name
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <User className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='text'
                  id='firstName'
                  name='firstName'
                  required
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white'
                  placeholder='First name'
                />
              </div>
              {state.errors?.firstName && (
                <div className='mt-1 text-sm text-red-600'>
                  {state.errors.firstName.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor='lastName'
                className='block text-sm font-semibold text-gray-700 mb-2'>
                Last Name
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <User className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='text'
                  id='lastName'
                  name='lastName'
                  required
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white'
                  placeholder='Last name'
                />
              </div>
              {state.errors?.lastName && (
                <div className='mt-1 text-sm text-red-600'>
                  {state.errors.lastName.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

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
                placeholder='Create a password'
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
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2'>
              <div className='w-2 h-2 bg-red-500 rounded-full'></div>
              {state.errors.general.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}

          {state.success && (
            <div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full'></div>
              {state.message}
            </div>
          )}

          <button
            type='submit'
            disabled={pending}
            className='w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-semibold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl cursor-pointer'>
            {pending ? (
              <>
                <Loader2 className='h-5 w-5 animate-spin' />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600'>
            Already have an account?{" "}
            <a
              href='/login'
              className='text-primary hover:text-primary/80 font-semibold cursor-pointer'>
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
