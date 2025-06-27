"use client";

import React, { useState, useRef } from "react";
import { User, Save, Loader2, Camera, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { AuthUser } from "@/lib/auth/types";

interface ProfileSheetProps {
  children: React.ReactNode;
  user: AuthUser;
}

export function ProfileSheet({ children, user }: Readonly<ProfileSheetProps>) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Clear any existing errors
      setError(null);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("firstName", formData.firstName);
      submitData.append("lastName", formData.lastName);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);

      if (selectedFile) {
        submitData.append("profilePhoto", selectedFile);
      }

      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        credentials: "include",
        body: submitData, // Don't set Content-Type header for FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      setSuccess(true);
      // Clear selected file after successful upload
      removeSelectedFile();

      // Refresh the page data to reflect changes
      router.refresh();

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when sheet opens
  const handleOpenChange = (open: boolean) => {
    if (open && user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      setError(null);
      setSuccess(false);
      removeSelectedFile();
    }
  };

  // Get user initials and current profile photo
  const initials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase()
    : "";
  const currentProfilePhotoUrl =
    user?.profilePhoto &&
    typeof user.profilePhoto === "object" &&
    "url" in user.profilePhoto
      ? user.profilePhoto.url
      : null;

  return (
    <Sheet onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side='right'
        className='sm:min-w-[40vw] min-w-[95vw] bg-white p-0 overflow-y-auto border-l border-gray-200 shadow-2xl'>
        <SheetHeader className='border-b border-gray-100 py-4 px-6'>
          <SheetTitle className='text-xl font-bold text-gray-900 flex items-center gap-3'>
            <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
              <User className='w-4 h-4 text-primary-foreground' />
            </div>
            Edit Profile
          </SheetTitle>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto p-6'>
          {!user ? (
            <div className='flex flex-col items-center justify-center h-64 text-center'>
              <div className='w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 border border-gray-100'>
                <User className='w-10 h-10 text-gray-400' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>
                Sign in required
              </h3>
              <p className='text-gray-500 leading-relaxed'>
                Please sign in to edit your profile
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Success Message */}
              {success && (
                <div className='bg-green-50 border border-green-200 rounded-xl p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center'>
                      <Save className='w-3 h-3 text-white' />
                    </div>
                    <span className='font-medium text-green-800'>
                      Profile updated successfully!
                    </span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className='bg-red-50 border border-red-200 rounded-xl p-4'>
                  <p className='text-red-700 font-medium'>{error}</p>
                </div>
              )}

              {/* Profile Photo Section */}
              <div className='bg-gray-50 rounded-xl p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                  <Camera className='w-5 h-5' />
                  Profile Photo
                </h3>

                <div className='flex items-center gap-6'>
                  <div className='relative'>
                    <Avatar className='w-20 h-20 ring-4 ring-white shadow-lg'>
                      <AvatarImage
                        src={previewUrl || currentProfilePhotoUrl || undefined}
                        alt='Profile photo'
                      />
                      <AvatarFallback className='bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-lg font-semibold'>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {previewUrl && (
                      <button
                        type='button'
                        onClick={removeSelectedFile}
                        className='absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md cursor-pointer'>
                        <X className='w-3 h-3' />
                      </button>
                    )}
                  </div>

                  <div className='flex-1'>
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      onChange={handleFileSelect}
                      className='hidden'
                    />
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      className='bg-white border-2 border-dashed border-gray-300 hover:border-primary text-gray-600 hover:text-primary px-4 py-3 rounded-lg transition-all duration-200 font-medium cursor-pointer'>
                      {selectedFile ? "Change Photo" : "Upload Photo"}
                    </button>
                    <p className='text-sm text-gray-500 mt-2'>
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label
                    htmlFor='firstName'
                    className='text-sm font-medium text-gray-900'>
                    First Name *
                  </label>
                  <input
                    id='firstName'
                    name='firstName'
                    type='text'
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white'
                    placeholder='Enter your first name'
                  />
                </div>

                <div className='space-y-2'>
                  <label
                    htmlFor='lastName'
                    className='text-sm font-medium text-gray-900'>
                    Last Name *
                  </label>
                  <input
                    id='lastName'
                    name='lastName'
                    type='text'
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white'
                    placeholder='Enter your last name'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <label
                  htmlFor='email'
                  className='text-sm font-medium text-gray-900'>
                  Email Address *
                </label>
                <input
                  id='email'
                  name='email'
                  type='email'
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white'
                  placeholder='Enter your email address'
                />
              </div>

              <div className='space-y-2'>
                <label
                  htmlFor='phone'
                  className='text-sm font-medium text-gray-900'>
                  Phone Number
                </label>
                <input
                  id='phone'
                  name='phone'
                  type='tel'
                  value={formData.phone}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white'
                  placeholder='Enter your phone number'
                />
              </div>

              {/* Submit Button */}
              <div className='pt-6'>
                <button
                  type='submit'
                  disabled={isLoading}
                  className='w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:cursor-not-allowed cursor-pointer'>
                  {isLoading ? (
                    <>
                      <Loader2 className='w-5 h-5 animate-spin' />
                      Updating Profile...
                    </>
                  ) : (
                    <>
                      <Save className='w-5 h-5' />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
