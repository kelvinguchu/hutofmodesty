import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password - Hut of Modesty",
  description: "Reset your Hut of Modesty account password",
};

interface ForgotPasswordPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ForgotPasswordPage({
  searchParams,
}: Readonly<ForgotPasswordPageProps>) {
  const params = await searchParams;
  const redirectTo =
    typeof params.redirect === "string" ? params.redirect : "/login";

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12'>
      <div className='max-w-md mx-auto px-4'>
        {/* Forgot Password Form */}
        <ForgotPasswordForm redirectTo={redirectTo} />

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
                className='text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer'>
                Sign in to your account
              </Link>
            </p>
            <p className='text-sm text-gray-600'>
              Don't have an account?{" "}
              <Link
                href={`/register${redirectTo !== "/login" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
                className='text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer'>
                Create one now
              </Link>
            </p>
          </div>

          {/* Help Section */}
          <div className='mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200'>
            <div className='flex items-start gap-3'>
              <Mail className='w-5 h-5 text-blue-600 mt-0.5' />
              <div className='text-left'>
                <h3 className='text-sm font-semibold text-blue-900 mb-1'>
                  Need Help?
                </h3>
                <p className='text-xs text-blue-700 leading-relaxed'>
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
