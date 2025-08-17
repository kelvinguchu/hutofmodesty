import React from "react";
import Link from "next/link";
import { Mail, CheckCircle } from "lucide-react";
import { EmailVerificationForm } from "@/components/auth/EmailVerificationForm";
import { verifyEmailAction } from "@/lib/auth/actions";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Verify Your Email - Hut of Modesty",
  description:
    "Verify your email address to complete your Hut of Modesty account setup",
};

interface VerifyEmailPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: Readonly<VerifyEmailPageProps>) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : null;
  const email = typeof params.email === "string" ? params.email : "";
  const redirectTo =
    typeof params.redirect === "string" ? params.redirect : "/login";

  // If token is provided, attempt to verify the email automatically
  if (token) {
    try {
      const formData = new FormData();
      formData.append("token", token);

      const result = await verifyEmailAction({}, formData);

      if (result.success) {
        // Redirect to login with success message
        redirect(
          `/login?message=${encodeURIComponent("Email verified successfully! You can now log in.")}&redirect=${encodeURIComponent(redirectTo)}`
        );
      } else if (
        result.errors?.token &&
        result.errors.token.some(
          (error) =>
            error.includes("invalid") ||
            error.includes("expired") ||
            error.includes("already")
        )
      ) {
        // Token is invalid/expired/already used - show helpful message
        return (
          <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-50 py-12'>
            <div className='max-w-md mx-auto px-4'>
              <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6'>
                <div className='bg-gradient-to-r from-green-500 to-green-600 px-8 py-6'>
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center'>
                      <CheckCircle className='w-5 h-5 text-white' />
                    </div>
                    <h1 className='text-2xl font-bold text-white'>
                      Email Already Verified
                    </h1>
                  </div>
                  <p className='text-green-100 text-sm'>
                    Your email has already been verified successfully.
                  </p>
                </div>

                <div className='p-8'>
                  <p className='text-gray-600 text-sm mb-6'>
                    Your email address has already been verified. You can now
                    log in to your account.
                  </p>

                  <Link
                    href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
                    className='w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold text-center block transition-colors'>
                    Continue to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        // Show error and allow resending
        return (
          <div className='min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 py-12'>
            <div className='max-w-md mx-auto px-4'>
              {/* Error Message */}
              <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6'>
                <div className='bg-gradient-to-r from-red-500 to-red-600 px-8 py-6'>
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center'>
                      <Mail className='w-5 h-5 text-white' />
                    </div>
                    <h1 className='text-2xl font-bold text-white'>
                      Verification Failed
                    </h1>
                  </div>
                  <p className='text-red-100 text-sm'>
                    The verification link is invalid or has expired.
                  </p>
                </div>

                <div className='p-8'>
                  <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm'>
                    <p className='font-medium'>
                      {result.errors?.token?.[0] ||
                        result.errors?.general?.[0] ||
                        "Verification failed"}
                    </p>
                  </div>

                  <p className='text-gray-600 text-sm mb-6'>
                    Don't worry! You can request a new verification email below.
                  </p>

                  <Link
                    href={`/verify-email${email ? `?email=${encodeURIComponent(email)}` : ""}&redirect=${encodeURIComponent(redirectTo)}`}
                    className='w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold text-center block transition-colors'>
                    Request New Verification Email
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      }
    } catch (error) {
      // Handle unexpected errors
      return (
        <div className='min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 py-12'>
          <div className='max-w-md mx-auto px-4'>
            <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
              <div className='p-8 text-center'>
                <h1 className='text-2xl font-bold text-gray-900 mb-4'>
                  Something went wrong
                </h1>
                <p className='text-gray-600 mb-6'>
                  We encountered an error while verifying your email. Please try
                  again.
                </p>
                <Link
                  href='/verify-email'
                  className='bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-lg font-semibold transition-colors'>
                  Try Again
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Show the verification form (for resending emails)
  return (
    <div className='min-h-screen bg-gradient-to-br from-amber-50 via-white to-gray-50 py-12'>
      <div className='max-w-md mx-auto px-4'>
        {/* Email Verification Form */}
        <EmailVerificationForm email={email} redirectTo={redirectTo} />

        {/* Footer Links */}
        <div className='mt-8 text-center space-y-4'>
          <div className='flex items-center justify-center space-x-4 text-sm text-gray-500'>
            <div className='h-px bg-gray-300 flex-1'></div>
            <span>or</span>
            <div className='h-px bg-gray-300 flex-1'></div>
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-gray-600'>
              Already verified?{" "}
              <Link
                href={`/login${redirectTo !== "/login" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
                className='text-amber-600 hover:text-amber-700 font-semibold transition-colors cursor-pointer'>
                Sign in to your account
              </Link>
            </p>
            <p className='text-sm text-gray-600'>
              Need to change your email?{" "}
              <Link
                href='/register'
                className='text-amber-600 hover:text-amber-700 font-semibold transition-colors cursor-pointer'>
                Create a new account
              </Link>
            </p>
          </div>

          {/* Help Section */}
          <div className='mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200'>
            <div className='flex items-start gap-3'>
              <Mail className='w-5 h-5 text-amber-600 mt-0.5' />
              <div className='text-left'>
                <h3 className='text-sm font-semibold text-amber-900 mb-1'>
                  Need Help?
                </h3>
                <p className='text-xs text-amber-700 leading-relaxed'>
                  If you're having trouble with email verification, please
                  contact our support team at{" "}
                  <a
                    href='mailto:info@hutofmodesty.com'
                    className='font-medium underline hover:no-underline'>
                    info@hutofmodesty.com
                  </a>{" "}
                  or call us at{" "}
                  <a
                    href='tel:+254748355387'
                    className='font-medium underline hover:no-underline'>
                    +254748355387
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
