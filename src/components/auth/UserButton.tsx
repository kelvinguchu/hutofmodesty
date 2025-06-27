"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, LogOut, Settings, Package } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/lib/auth/actions";
import { useUserDataSync } from "@/hooks/useAuthSync";
import type { AuthUser } from "@/lib/auth/types";

interface UserButtonProps {
  className?: string;
  variant?: "default" | "mobile";
  user: AuthUser | null;
  isAuthenticated: boolean;
}

export function UserButton({
  className = "",
  variant = "default",
  user,
  isAuthenticated,
}: UserButtonProps) {
  const { clearLocalData } = useUserDataSync();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Style variants
  const isMobile = variant === "mobile";
  const baseStyles = isMobile
    ? "group transition-colors duration-200"
    : "group transition-all duration-200 rounded-full hover:bg-purple-50 border border-transparent hover:border-purple-200 shadow-sm hover:shadow-md";

  const paddingStyles = isMobile ? "" : user ? "p-1" : "p-2";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Clear local cart and wishlist data
      clearLocalData();
      // Call server logout action
      await logoutAction();
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  if (!isAuthenticated || !user) {
    // Not authenticated - show login link
    return (
      <Link
        href='/login'
        className={`${baseStyles} ${paddingStyles} text-gray-700 hover:text-purple-600 cursor-pointer ${className}`}
        aria-label='Sign In'>
        <User
          className={`w-6 h-6 stroke-[1.5] ${isMobile ? "" : "transition-transform group-hover:scale-110"}`}
        />
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

  // Mobile variant - simple link to account
  if (isMobile) {
    return (
      <Link
        href='/account'
        className={`${baseStyles} ${paddingStyles} text-gray-700 hover:text-purple-600 cursor-pointer ${className}`}
        aria-label='My Account'>
        <div className='relative'>
          <Avatar className='w-8 h-8'>
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
        </div>
      </Link>
    );
  }

  // Desktop variant - dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`${baseStyles} ${paddingStyles} text-gray-700 hover:text-purple-600 cursor-pointer ${className}`}
          aria-label='User menu'>
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
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-56'>
        <div className='px-3 py-2'>
          <p className='text-sm font-medium text-gray-900'>
            {user.firstName} {user.lastName}
          </p>
          <p className='text-xs text-gray-500 truncate'>{user.email}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href='/account' className='cursor-pointer'>
            <User className='mr-2 h-4 w-4' />
            My Account
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href='/account#orders' className='cursor-pointer'>
            <Package className='mr-2 h-4 w-4' />
            My Orders
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href='/account#settings' className='cursor-pointer'>
            <Settings className='mr-2 h-4 w-4' />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className='cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50'>
          <LogOut className='mr-2 h-4 w-4' />
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
