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

interface DesktopCollectionViewProps {
  categories: Category[];
}

export default function DesktopCollectionView({
  categories,
}: DesktopCollectionViewProps) {
  // We'll show only the first 2 categories for simplicity
  const displayCategories = categories.slice(0, 2);

  // Map images for categories - 2 images per category side by side
  const categoryImages: Record<string, string[]> = {
    Abayas: ["/abayas/abaya10.webp", "/abayas/abaya2.webp"],
    Qamis: ["/qamis/qamis3.webp", "/qamis/qamis9.webp"],
  };

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
    <div className='hidden md:flex w-full h-[calc(100vh-94px)]'>
      {displayCategories.map((category, index) => (
        <div key={category.id} className='flex flex-1 h-full relative group'>
          {/* Two portrait images side by side for each category */}
          <div className='flex w-full h-full'>
            {/* First image */}
            <div className='w-1/2 h-full relative overflow-hidden'>
              <Image
                src={
                  category.mainImage ||
                  categoryImages[category.name]?.[0] ||
                  `/abayas/abaya${index + 1}.webp`
                }
                alt={category.name}
                fill
                className='object-cover transition-transform duration-700 group-hover:scale-110'
                sizes='25vw'
                priority
                quality={90}
              />
            </div>

            {/* Second image */}
            <div className='w-1/2 h-full relative overflow-hidden'>
              <Image
                src={
                  categoryImages[category.name]?.[1] ||
                  `/abayas/abaya${index + 2}.webp`
                }
                alt={category.name}
                fill
                className='object-cover transition-transform duration-700 group-hover:scale-110'
                sizes='25vw'
                priority
                quality={90}
              />
            </div>
          </div>

          {/* Enhanced gradient overlay across both images */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20 group-hover:from-black/70 group-hover:via-black/40 group-hover:to-black/10 transition-all duration-500'></div>

          {/* Text overlay on top of both images */}
          <div className='absolute inset-0 flex flex-col items-center justify-center z-10 transition-all duration-500 group-hover:scale-105'>
            <div
              className={`w-20 h-1 bg-gradient-to-r ${getAccentColor(category.slug)} rounded-full mb-8 opacity-90`}></div>

            <h2 className='text-6xl font-bold text-white mb-4 tracking-wide text-center leading-tight'>
              {category.name}
            </h2>
            <p className='text-gray-200 text-lg text-center mb-8 font-medium max-w-md'>
              Discover our exclusive collection of premium{" "}
              {category.name.toLowerCase()}
            </p>

            <div
              className={`w-20 h-1 bg-gradient-to-r ${getAccentColor(category.slug)} rounded-full mb-10 opacity-90`}></div>

            <Link
              href={`/collections/${category.slug}`}
              className={`inline-flex items-center justify-center ${getButtonColor(category.slug)} text-white border-2 py-4 px-12 rounded-lg uppercase tracking-wider text-base font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 cursor-pointer`}>
              Explore Collection
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
