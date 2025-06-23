"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  mainImage?: string;
}

interface MobileCollectionViewProps {
  categories: Category[];
}

export default function MobileCollectionView({
  categories,
}: MobileCollectionViewProps) {
  // We'll show only the first 2 categories for simplicity
  const displayCategories = categories.slice(0, 2);

  // Determine accent color based on category slug
  const getAccentColor = (slug: string) => {
    if (slug === "abaya") return "from-purple-500 to-purple-600";
    if (slug === "qamis") return "from-emerald-500 to-emerald-600";
    return "from-gray-600 to-gray-700";
  };

  const getButtonColor = (slug: string) => {
    if (slug === "abaya")
      return "bg-purple-600 hover:bg-purple-700 border-purple-600 hover:border-purple-700";
    if (slug === "qamis")
      return "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 hover:border-emerald-700";
    return "bg-gray-600 hover:bg-gray-700 border-gray-600 hover:border-gray-700";
  };

  return (
    <div className='flex flex-col md:hidden w-full h-[calc(100vh-52px)]'>
      {displayCategories.map((category, index) => (
        <div
          key={category.id}
          className='relative h-1/2 w-full overflow-hidden group'>
          {/* Image with top-center alignment */}
          <div className='absolute inset-0'>
            <Image
              src={category.mainImage || `/qamis/qamis${index + 1}.webp`}
              alt={category.name}
              fill
              className='object-cover object-top transition-transform duration-700 group-hover:scale-105'
              sizes='100vw'
              priority={index === 0}
              quality={90}
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 group-hover:from-black/60 group-hover:via-black/30 group-hover:to-black/10 transition-all duration-500'></div>
          </div>

          {/* Overlay content */}
          <div className='absolute inset-0 flex flex-col items-center justify-center p-6 z-10'>
            <div
              className={`w-16 h-1 bg-gradient-to-r ${getAccentColor(category.slug)} rounded-full mb-6 opacity-90`}></div>

            <h2 className='text-4xl font-bold text-white mb-3 tracking-wide text-center leading-tight'>
              {category.name}
            </h2>
            <p className='text-gray-200 text-sm text-center mb-6 font-medium'>
              Discover our exclusive collection
            </p>

            <div
              className={`w-16 h-1 bg-gradient-to-r ${getAccentColor(category.slug)} rounded-full mb-8 opacity-90`}></div>

            <Link
              href={`/collections/${category.slug}`}
              className={`inline-flex items-center justify-center ${getButtonColor(category.slug)} text-white border-2 py-3 px-8 rounded-lg uppercase tracking-wider text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer touch-manipulation`}>
              Explore Collection
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
