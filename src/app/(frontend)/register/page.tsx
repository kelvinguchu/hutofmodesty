import React from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create Account - Hut of Modesty",
  description: "Create your Hut of Modesty account",
};

interface RegisterPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RegisterPage({
  searchParams,
}: Readonly<RegisterPageProps>) {
  const params = await searchParams;
  const redirectTo =
    typeof params.redirect === "string" ? params.redirect : "/account";

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-white to-gray-50 py-12'>
      <div className='max-w-md mx-auto px-4'>

        {/* Register Form */}
        <RegisterForm redirectTo={redirectTo} />

        {/* Footer Links */}
        <div className='mt-8 text-center space-y-4'>
          <div className='flex items-center justify-center space-x-4 text-sm text-gray-500'>
            <div className='h-px bg-gray-300 flex-1'></div>
            <span>or</span>
            <div className='h-px bg-gray-300 flex-1'></div>
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-gray-600'>
              Already part of our community?{" "}
              <Link
                href={`/login${redirectTo !== "/account" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
                className='text-emerald-600 hover:text-emerald-700 font-semibold transition-colors cursor-pointer'>
                Sign in to your account
              </Link>
            </p>
            <p className='text-xs text-gray-500'>
              By creating an account, you agree to our{" "}
              <Link
                href='/terms'
                className='hover:text-gray-700 transition-colors cursor-pointer underline'>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href='/privacy'
                className='hover:text-gray-700 transition-colors cursor-pointer underline'>
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
