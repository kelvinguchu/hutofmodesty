"use client";

import React from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProfileSheet } from "./ProfileSheet";
import { OrdersSheet } from "../orders/OrdersSheet";
import {
  FaUser,
  FaShoppingBag,
  FaSignOutAlt,
  FaRuler,
  FaClipboardList,
} from "react-icons/fa";

interface AccountDashboardProps {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profilePhoto?:
      | string
      | {
          url?: string | null;
        }
      | null;
  };
}

export function AccountDashboard({ user }: Readonly<AccountDashboardProps>) {
  const { logout } = useAuth();
  const router = useRouter();

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getProfilePhotoUrl = () => {
    if (!user.profilePhoto) return null;
    if (typeof user.profilePhoto === "string") return user.profilePhoto;
    return user.profilePhoto.url || null;
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 py-12'>
      <div className='max-w-4xl mx-auto px-4'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='relative inline-block mb-6'>
            <Avatar className='w-24 h-24 mx-auto ring-4 ring-white shadow-xl'>
              <AvatarImage
                src={getProfilePhotoUrl() || undefined}
                alt='Profile photo'
              />
              <AvatarFallback className='bg-gradient-to-br from-purple-600 to-purple-700 text-white text-xl font-semibold'>
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className='absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full flex items-center justify-center'>
              <div className='w-2 h-2 bg-white rounded-full'></div>
            </div>
          </div>
          <h1 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-3'>
            Welcome back, {user.firstName || "User"}
          </h1>
          <p className='text-gray-600 text-lg'>{user.email}</p>
        </div>

        {/* Account Actions */}
        <div className='flex flex-col md:flex-row gap-8 mb-12'>
          {/* Profile Management */}
          <Card className='border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group flex-1'>
            <CardHeader className='pb-4'>
              <CardTitle className='text-gray-800 flex items-center gap-3 text-xl'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300'>
                  <FaUser className='w-5 h-5' />
                </div>
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col justify-between flex-1'>
              <p className='text-gray-600 mb-6 leading-relaxed'>
                Update your personal information and profile photo
              </p>
              <ProfileSheet>
                <Button
                  variant='outline'
                  className='w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-medium py-3 rounded-xl transition-all duration-300 cursor-pointer'>
                  Edit Profile
                </Button>
              </ProfileSheet>
            </CardContent>
          </Card>

          {/* Orders */}
          <Card className='border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group flex-1'>
            <CardHeader className='pb-4'>
              <CardTitle className='text-gray-800 flex items-center gap-3 text-xl'>
                <div className='w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300'>
                  <FaShoppingBag className='w-5 h-5' />
                </div>
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col justify-between flex-1'>
              <p className='text-gray-600 mb-6 leading-relaxed'>
                View your order history and track shipments
              </p>
              <OrdersSheet>
                <Button
                  variant='outline'
                  className='w-full border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 font-medium py-3 rounded-xl transition-all duration-300 cursor-pointer'>
                  View Orders
                </Button>
              </OrdersSheet>
            </CardContent>
          </Card>
        </div>

        <Separator className='my-12 bg-gradient-to-r from-transparent via-gray-300 to-transparent' />

        {/* Logout */}
        <div className='text-center'>
          <Button
            onClick={handleLogout}
            variant='outline'
            className='border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium px-8 py-3 rounded-xl transition-all duration-300 cursor-pointer'>
            <FaSignOutAlt className='w-4 h-4 mr-2' />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
