"use client";

import React, { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { forgotPasswordAction, type FormState } from "@/lib/auth/actions";
import Link from "next/link";

interface ForgotPasswordFormProps {
  redirectTo?: string;
}

export function ForgotPasswordForm({
  redirectTo = "/login",
}: Readonly<ForgotPasswordFormProps>) {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const [state, formAction, pending] = useActionState(forgotPasswordAction, {});

  useEffect(() => {
    if (state.success) {
      setEmail("");
    }
  }, [state.success]);

  return (
    <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
      {/* Header */}
      <div className='bg-primary px-8 py-6'>
        <div className='flex items-center gap-3 mb-2'>
          <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center'>
            <Mail className='w-5 h-5 text-white' />
          </div>
          <h1 className='text-2xl font-bold text-white'>Reset Password</h1>
        </div>
        <p className='text-blue-100 text-sm'>
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      {/* Form Content */}
      <div className='p-8'>
        {/* Success Message */}
        {state.success && (
          <div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 shadow-sm'>
            <CheckCircle className='w-4 h-4 text-green-500' />
            <div>
              <p className='font-medium'>Reset link sent!</p>
              <p className='text-green-600 mt-1'>{state.message}</p>
            </div>
          </div>
        )}

        {/* General Error */}
        {state.errors?.general && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 shadow-sm'>
            <span className='w-2 h-2 bg-red-500 rounded-full inline-block'></span>
            {state.errors.general[0]}
          </div>
        )}

        <form action={formAction} className='space-y-6'>
          {/* Email Field */}
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
                id='email'
                name='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={pending}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 ${
                  state.errors?.email
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 bg-white"
                } ${pending ? "opacity-50 cursor-not-allowed" : ""}`}
                placeholder='Enter your email address'
              />
            </div>
            {state.errors?.email && (
              <p className='mt-2 text-sm text-red-600 flex items-center gap-1'>
                <span className='w-1 h-1 bg-red-500 rounded-full inline-block'></span>
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={pending || !email.trim()}
            className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white transition-all duration-200 ${
              pending || !email.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary/80 focus:ring-2 focus:ring-primary focus:ring-offset-2 transform hover:scale-[1.02]"
            }`}>
            {pending ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Checking Email...
              </>
            ) : (
              <>
                <Mail className='w-4 h-4 mr-2' />
                Send Reset Link
              </>
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className='mt-8 pt-6 border-t border-gray-200'>
          <div className='text-center space-y-3'>
            <Link
              href={redirectTo}
              className='inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer'>
              <ArrowLeft className='w-4 h-4 mr-1' />
              Back to Sign In
            </Link>

            {/* Show register link if email not found */}
            {state.errors?.email &&
              state.errors.email[0].includes("No account found") && (
                <div className='text-center'>
                  <p className='text-sm text-gray-600'>
                    Don't have an account?{" "}
                    <Link
                      href='/register'
                      className='text-primary hover:text-primary/80 font-semibold transition-colors cursor-pointer'>
                      Create one here
                    </Link>
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Additional Help */}
        <div className='mt-6 text-center'>
          <p className='text-xs text-gray-500'>
            Didn't receive the email? Check your spam folder or{" "}
            <button
              type='button'
              onClick={() => {
                if (email.trim()) {
                  const form = new FormData();
                  form.append("email", email);
                  formAction(form);
                }
              }}
              disabled={pending || !email.trim()}
              className='text-primary hover:text-primary/80 font-medium transition-colors disabled:text-gray-400 disabled:cursor-not-allowed'>
              try again
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
