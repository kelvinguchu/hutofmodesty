import React from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign In - Hut of Modesty",
  description: "Sign in to your Hut of Modesty account",
};

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo =
    typeof params.redirect === "string" ? params.redirect : "/account";
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-gray-50 py-12'>
      <div className='max-w-md mx-auto px-4'>


        {/* Error Display */}
        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 shadow-sm'>
            <div className='w-2 h-2 bg-red-500 rounded-full'></div>
            {error}
          </div>
        )}

        {/* Login Form */}
        <LoginForm redirectTo={redirectTo} />

        {/* Footer Links */}
        <div className='mt-8 text-center space-y-4'>
          <div className='flex items-center justify-center space-x-4 text-sm text-gray-500'>
            <div className='h-px bg-gray-300 flex-1'></div>
            <span>or</span>
            <div className='h-px bg-gray-300 flex-1'></div>
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-gray-600'>
              New to Hut of Modesty?{" "}
              <Link
                href={`/register${redirectTo !== "/account" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
                className='text-primary hover:text-primary/80 font-semibold transition-colors cursor-pointer'>
                Create your account
              </Link>
            </p>
            <p className='text-xs text-gray-500'>
              <Link
                href='/forgot-password'
                className='hover:text-gray-700 transition-colors cursor-pointer'>
                Forgot your password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
