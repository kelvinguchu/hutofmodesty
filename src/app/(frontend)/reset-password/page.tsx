import React from "react";
import Link from "next/link";
import { Lock, AlertTriangle } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Reset Password - Hut of Modesty",
  description: "Set a new password for your Hut of Modesty account",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: Readonly<ResetPasswordPageProps>) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : null;
  const redirectTo =
    typeof params.redirect === "string" ? params.redirect : "/login";

  // If no token is provided, redirect to forgot password page
  if (!token) {
    redirect("/forgot-password");
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-50 py-12'>
      <div className='max-w-md mx-auto px-4'>
        {/* Reset Password Form */}
        <ResetPasswordForm token={token} redirectTo={redirectTo} />

        {/* Footer Links */}
        <div className='mt-8 text-center space-y-4'>
          <div className='flex items-center justify-center space-x-4 text-sm text-gray-500'>
            <div className='h-px bg-gray-300 flex-1'></div>
            <span>or</span>
            <div className='h-px bg-gray-300 flex-1'></div>
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-gray-600'>
              Remember your password?{" "}
              <Link
                href={`/login${redirectTo !== "/login" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
                className='text-green-600 hover:text-green-700 font-semibold transition-colors cursor-pointer'>
                Sign in to your account
              </Link>
            </p>
            <p className='text-sm text-gray-600'>
              Need a new reset link?{" "}
              <Link
                href='/forgot-password'
                className='text-green-600 hover:text-green-700 font-semibold transition-colors cursor-pointer'>
                Request password reset
              </Link>
            </p>
          </div>

          {/* Security Notice */}
          <div className='mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='w-5 h-5 text-amber-600 mt-0.5' />
              <div className='text-left'>
                <h3 className='text-sm font-semibold text-amber-900 mb-1'>
                  Security Notice
                </h3>
                <p className='text-xs text-amber-700 leading-relaxed'>
                  This password reset link is valid for 2 hours only. If the link has expired, 
                  you'll need to request a new one. Never share this link with anyone.
                </p>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className='mt-4 p-4 bg-green-50 rounded-lg border border-green-200'>
            <div className='flex items-start gap-3'>
              <Lock className='w-5 h-5 text-green-600 mt-0.5' />
              <div className='text-left'>
                <h3 className='text-sm font-semibold text-green-900 mb-1'>
                  Need Help?
                </h3>
                <p className='text-xs text-green-700 leading-relaxed'>
                  If you're having trouble resetting your password, please contact our support team at{" "}
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
