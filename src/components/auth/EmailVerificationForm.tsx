"use client";

import React, { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { resendVerificationAction, type FormState } from "@/lib/auth/actions";

interface EmailVerificationFormProps {
  email?: string;
  redirectTo?: string;
}

export function EmailVerificationForm({
  email: initialEmail = "",
  redirectTo = "/login",
}: Readonly<EmailVerificationFormProps>) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Use useActionState to handle server action
  const [state, formAction, pending] = useActionState(
    resendVerificationAction,
    {}
  );

  // Initialize cooldown from localStorage on mount
  useEffect(() => {
    if (!email) return; // Don't start timer if no email

    const cooldownKey = `resend_cooldown_${email}`;
    const savedCooldown = localStorage.getItem(cooldownKey);

    if (savedCooldown) {
      const endTime = parseInt(savedCooldown);
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

      if (remaining > 0) {
        setResendCooldown(remaining);

        const interval = setInterval(() => {
          const currentRemaining = Math.max(
            0,
            Math.ceil((endTime - Date.now()) / 1000)
          );
          setResendCooldown(currentRemaining);

          if (currentRemaining <= 0) {
            clearInterval(interval);
            localStorage.removeItem(cooldownKey);
          }
        }, 1000);

        return () => clearInterval(interval);
      } else {
        localStorage.removeItem(cooldownKey);
      }
    }
  }, [email]);

  // Handle successful email send
  useEffect(() => {
    if (state.success) {
      const cooldownKey = `resend_cooldown_${email}`;
      const endTime = Date.now() + 60 * 1000; // 60 seconds from now

      // Save end time to localStorage
      localStorage.setItem(cooldownKey, endTime.toString());

      // Start 60-second cooldown
      setResendCooldown(60);
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
        setResendCooldown(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          localStorage.removeItem(cooldownKey);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [state.success, email]);

  return (
    <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
      {/* Header */}
      <div className='bg-primary px-8 py-6'>
        <div className='flex items-center gap-3 mb-2'>
          <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center'>
            <Mail className='w-5 h-5 text-white' />
          </div>
          <h1 className='text-2xl font-bold text-white'>Verify Your Email</h1>
        </div>
        <p className='text-white text-sm'>
          We need to verify your email address to complete your registration.
        </p>
      </div>

      {/* Form Content */}
      <div className='p-8'>
        {/* Success Message */}
        {state.success && (
          <div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 shadow-sm'>
            <CheckCircle className='w-4 h-4 text-green-500' />
            <div>
              <p className='font-medium'>Verification email sent!</p>
              <p className='text-green-600 mt-1'>{state.message}</p>
            </div>
          </div>
        )}

        {/* General Error */}
        {state.errors?.general && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 shadow-sm'>
            <AlertTriangle className='w-4 h-4 text-red-500' />
            <div>
              <p className='font-medium'>Unable to send verification email</p>
              <p className='text-red-600 mt-1'>{state.errors.general[0]}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className='mb-6'>
          {state.success ? (
            <>
              <h2 className='text-lg font-semibold text-gray-900 mb-2'>
                Check your email
              </h2>
              <p className='text-gray-600 text-sm leading-relaxed'>
                We've sent a verification link to your email address. Click the
                link in the email to verify your account. If you don't see the
                email, check your spam folder.
              </p>
            </>
          ) : (
            <>
              <h2 className='text-lg font-semibold text-gray-900 mb-2'>
                Email verification required
              </h2>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Your email address needs to be verified before you can log in.
                Click the button below to send a verification email to your
                address.
              </p>
            </>
          )}
        </div>

        {/* Email Display */}
        {email && (
          <div className='mb-6 p-4 bg-gray-50 rounded-lg border'>
            <p className='text-sm text-gray-600 mb-1'>
              {state.success
                ? "Verification email sent to:"
                : "Email address to verify:"}
            </p>
            <p className='font-medium text-gray-900'>{email}</p>
          </div>
        )}

        {/* Resend Form */}
        <form action={formAction} className='space-y-6'>
          {/* Email Field (if not provided) */}
          {!initialEmail && (
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
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-gray-900 placeholder-gray-500 ${
                    state.errors?.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-white"
                  } ${pending ? "opacity-50 cursor-not-allowed" : ""}`}
                  placeholder='Enter your email address'
                />
              </div>
              {state.errors?.email && (
                <p className='mt-2 text-sm text-red-600 flex items-center gap-1'>
                  <div className='w-1 h-1 bg-red-500 rounded-full'></div>
                  {state.errors.email[0]}
                </p>
              )}
            </div>
          )}

          {/* Hidden email field if email is provided */}
          {initialEmail && (
            <input type='hidden' name='email' value={initialEmail} />
          )}

          {/* Resend Button */}
          <button
            type='submit'
            disabled={
              pending || resendCooldown > 0 || (!initialEmail && !email.trim())
            }
            className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white transition-all duration-200 ${
              pending || resendCooldown > 0 || (!initialEmail && !email.trim())
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary/80 focus:ring-2 focus:ring-primary focus:ring-offset-2 transform hover:scale-[1.02]"
            }`}>
            {pending ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Sending...
              </>
            ) : resendCooldown > 0 ? (
              <>
                <Clock className='w-4 h-4 mr-2' />
                Resend in {resendCooldown}s
              </>
            ) : (
              <>
                <Mail className='w-4 h-4 mr-2' />
                {state.success
                  ? "Resend Verification Email"
                  : "Send Verification Email"}
              </>
            )}
          </button>
        </form>

        {/* Help Text */}
        <div className='mt-6 text-center'>
          <p className='text-xs text-gray-500 leading-relaxed'>
            Still having trouble? Contact our support team at{" "}
            <a
              href='mailto:info@hutofmodesty.com'
              className='text-primary hover:text-primary/80 font-medium transition-colors'>
              info@hutofmodesty.com
            </a>{" "}
            or call us at{" "}
            <a
              href='tel:+254748355387'
              className='text-primary hover:text-primary/80 font-medium transition-colors'>
              +254748355387
            </a>
            .
          </p>
        </div>

        {/* Back to Login */}
        <div className='mt-8 pt-6 border-t border-gray-200'>
          <div className='text-center'>
            <button
              onClick={() => router.push(redirectTo)}
              className='inline-flex items-center text-sm text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer'>
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
