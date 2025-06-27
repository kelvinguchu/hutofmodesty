import React from "react";

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({
  message = "Loading...",
  fullScreen = true,
}: LoadingProps) {
  return (
    <div
      className={`${
        fullScreen ? "fixed inset-0 z-50" : "absolute inset-0"
      } bg-white/90 backdrop-blur-sm flex items-center justify-center`}>
      <div className='text-center'>
        {/* Elegant spinner */}
        <div className='mb-4 relative'>
          <div className='w-12 h-12 border-3 border-gray-200 rounded-full mx-auto'></div>
          <div className='absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 border-3 border-transparent border-t-primary rounded-full animate-spin'></div>
        </div>

        {/* Loading text */}
        <p className='text-[#382f21] text-lg font-medium'>{message}</p>
      </div>
    </div>
  );
}

// Inline loading component for smaller areas
export function InlineLoading({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className='flex items-center justify-center py-8'>
      <div className='text-center'>
        <div className='mb-3 relative'>
          <div className='w-8 h-8 border-2 border-gray-200 rounded-full mx-auto'></div>
          <div className='absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 border-2 border-transparent border-t-primary rounded-full animate-spin'></div>
        </div>
        <p className='text-[#382f21] text-sm font-medium'>{message}</p>
      </div>
    </div>
  );
}
