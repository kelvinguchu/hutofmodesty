"use client";

import React, { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, CheckCircle, ArrowLeft } from "lucide-react";
import { resetPasswordAction, type FormState } from "@/lib/auth/actions";
import Link from "next/link";

interface ResetPasswordFormProps {
  token: string;
  redirectTo?: string;
}

export function ResetPasswordForm({
  token,
  redirectTo = "/login",
}: Readonly<ResetPasswordFormProps>) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [state, formAction, pending] = useActionState(resetPasswordAction, {});

  useEffect(() => {
    if (state.success) {
      setTimeout(() => {
        router.push(redirectTo);
      }, 3000);
    }
  }, [state.success, router, redirectTo]);

  const handleSubmit = (formData: FormData) => {
    formData.append("token", token);
    formAction(formData);
  };

  return (
    <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
      {/* Header */}
      <div className='bg-primary px-8 py-6'>
        <div className='flex items-center gap-3 mb-2'>
          <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center'>
            <Lock className='w-5 h-5 text-white' />
          </div>
          <h1 className='text-2xl font-bold text-white'>Set New Password</h1>
        </div>
        <p className='text-white text-sm'>
          Choose a strong password for your Hut of Modesty account.
        </p>
      </div>

      {/* Form Content */}
      <div className='p-8'>
        {/* Success Message */}
        {state.success && (
          <div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 shadow-sm'>
            <CheckCircle className='w-4 h-4 text-green-500' />
            <div>
              <p className='font-medium'>Password reset successful!</p>
              <p className='text-green-600 mt-1'>{state.message}</p>
              <p className='text-green-600 mt-1 text-xs'>
                Redirecting to login page in 3 seconds...
              </p>
            </div>
          </div>
        )}

        {/* Token Error */}
        {state.errors?.token && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 shadow-sm'>
            <div className='w-2 h-2 bg-red-500 rounded-full'></div>
            <div>
              <p className='font-medium'>Invalid or expired reset link</p>
              <p className='text-red-600 mt-1'>{state.errors.token[0]}</p>
            </div>
          </div>
        )}

        {/* General Error */}
        {state.errors?.general && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 shadow-sm'>
            <div className='w-2 h-2 bg-red-500 rounded-full'></div>
            {state.errors.general[0]}
          </div>
        )}

        {!state.success && (
          <form action={handleSubmit} className='space-y-6'>
            {/* Password Field */}
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-semibold text-gray-700 mb-2'>
                New Password
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={pending}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-gray-900 placeholder-gray-500 ${
                    state.errors?.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-white"
                  } ${pending ? "opacity-50 cursor-not-allowed" : ""}`}
                  placeholder='Enter your new password'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={pending}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50'>
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
              {state.errors?.password && (
                <p className='mt-2 text-sm text-red-600 flex items-center gap-1'>
                  <div className='w-1 h-1 bg-red-500 rounded-full'></div>
                  {state.errors.password[0]}
                </p>
              )}
              <p className='mt-1 text-xs text-gray-500'>
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-semibold text-gray-700 mb-2'>
                Confirm New Password
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={pending}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-gray-900 placeholder-gray-500 ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-white"
                  } ${pending ? "opacity-50 cursor-not-allowed" : ""}`}
                  placeholder='Confirm your new password'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={pending}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50'>
                  {showConfirmPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className='mt-2 text-sm text-red-600 flex items-center gap-1'>
                  <div className='w-1 h-1 bg-red-500 rounded-full'></div>
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={
                pending ||
                !password.trim() ||
                !confirmPassword.trim() ||
                password !== confirmPassword ||
                password.length < 8
              }
              className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white transition-all duration-200 ${
                pending ||
                !password.trim() ||
                !confirmPassword.trim() ||
                password !== confirmPassword ||
                password.length < 8
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary/80 focus:ring-2 focus:ring-primary focus:ring-offset-2 transform hover:scale-[1.02]"
              }`}>
              {pending ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  Resetting Password...
                </>
              ) : (
                <>
                  <Lock className='w-4 h-4 mr-2' />
                  Reset Password
                </>
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className='mt-8 pt-6 border-t border-gray-200'>
          <div className='text-center'>
            <Link
              href={redirectTo}
              className='inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer'>
              <ArrowLeft className='w-4 h-4 mr-1' />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
