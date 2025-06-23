"use client";

import React from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserButtonProps {
  className?: string;
}

export function UserButton({ className = "" }: UserButtonProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={`p-2 rounded-full ${className}`}>
        <div className='w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse' />
      </div>
    );
  }

  if (!user) {
    // Not authenticated - show login link
    return (
      <Link
        href='/login'
        className={`group p-2 text-gray-700 hover:text-purple-600 transition-all duration-200 rounded-full hover:bg-purple-50 border border-transparent hover:border-purple-200 shadow-sm hover:shadow-md cursor-pointer ${className}`}
        aria-label='Sign In'>
        <User className='w-6 h-6 stroke-[1.5] transition-transform group-hover:scale-110' />
      </Link>
    );
  }

  // Get user initials for fallback
  const initials =
    `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase();

  // Get profile photo URL if available
  const profilePhotoUrl =
    user.profilePhoto &&
    typeof user.profilePhoto === "object" &&
    "url" in user.profilePhoto
      ? user.profilePhoto.url
      : null;

  // Authenticated - link to account page with avatar
  return (
    <Link
      href='/account'
      className={`group p-1 text-gray-700 hover:text-purple-600 transition-all duration-200 rounded-full hover:bg-purple-50 border border-transparent hover:border-purple-200 shadow-sm hover:shadow-md cursor-pointer ${className}`}
      aria-label='My Account'>
      <div className='relative'>
        <Avatar className='w-8 h-8 ring-2 ring-transparent group-hover:ring-purple-200 transition-all duration-200'>
          {profilePhotoUrl && (
            <AvatarImage
              src={profilePhotoUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className='object-cover'
            />
          )}
          <AvatarFallback className='bg-gradient-to-br from-purple-500 to-purple-600 text-white text-sm font-bold'>
            {initials || <User className='w-4 h-4' />}
          </AvatarFallback>
        </Avatar>

        {/* Online status indicator */}
        <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm'></div>
      </div>
    </Link>
  );
}
