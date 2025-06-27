import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Category as PayloadCategory } from "@/payload-types";
import { normalizeMediaURL } from "@/lib/utils";

export type CategoryCardData = PayloadCategory;

interface CategoryCardProps {
  category: CategoryCardData;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  // Handle image source
  const imageUrl =
    typeof category.image === "object" && category.image?.url
      ? (normalizeMediaURL(category.image.url) ?? "/images/placeholder.jpg")
      : "/images/placeholder.jpg";

  const linkUrl = `/collections/${category.slug}`;

  return (
    <Link href={linkUrl} className='group block cursor-pointer'>
      <div className='relative h-[60vh] sm:h-[65vh] md:h-[70vh] min-h-[400px] sm:min-h-[450px] md:min-h-[500px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-black'>
        {/* Background Image with refined overlays */}
        <div className='absolute inset-0'>
          <Image
            src={imageUrl}
            alt={category.name}
            fill
            sizes='(max-width: 768px) 100vw, 50vw'
            className='object-cover transition-all duration-1000 group-hover:scale-105 group-active:scale-105'
          />
          {/* Sophisticated gradient overlays */}
          <div className='absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-black/70 group-hover:from-black/60 group-hover:to-black/80 group-active:from-black/60 group-active:to-black/80 transition-all duration-700' />
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent' />
          <div className='absolute inset-0 bg-gradient-to-r from-amber-900/10 via-transparent to-purple-900/10 group-hover:from-amber-900/20 group-hover:to-purple-900/20 group-active:from-amber-900/20 group-active:to-purple-900/20 transition-all duration-700' />
        </div>

        {/* Minimal elegant border frame - responsive */}
        <div className='absolute inset-3 sm:inset-4 md:inset-6 border border-amber-400/20 group-hover:border-amber-400/40 group-active:border-amber-400/40 transition-all duration-500 pointer-events-none'>
          {/* Simple corner accents - responsive sizing */}
          <div className='absolute -top-px -left-px w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border-l border-t border-amber-400/60 group-hover:border-amber-400 group-active:border-amber-400 transition-colors duration-300'></div>
          <div className='absolute -top-px -right-px w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border-r border-t border-amber-400/60 group-hover:border-amber-400 group-active:border-amber-400 transition-colors duration-300'></div>
          <div className='absolute -bottom-px -left-px w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border-l border-b border-amber-400/60 group-hover:border-amber-400 group-active:border-amber-400 transition-colors duration-300'></div>
          <div className='absolute -bottom-px -right-px w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border-r border-b border-amber-400/60 group-hover:border-amber-400 group-active:border-amber-400 transition-colors duration-300'></div>
        </div>

        {/* Content - responsive padding and layout */}
        <div className='relative z-10 h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-12'>
          {/* Top Section - Refined header */}
          <div className='flex justify-between items-start'>
            <div className='space-y-3 sm:space-y-4'>
              {/* Subtle decorative line - responsive */}
              <div className='w-8 sm:w-10 md:w-12 h-px bg-gradient-to-r from-amber-400 to-transparent group-hover:w-12 sm:group-hover:w-16 md:group-hover:w-20 transition-all duration-500'></div>
            </div>

            {/* White arrow button - always visible */}
            <div className='relative'>
              <div className='w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 border border-white bg-white text-black transition-all duration-300 flex items-center justify-center touch-manipulation'>
                <ArrowUpRight className='w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5' />
              </div>
              {/* Amber accent dot - always visible */}
              <div className='absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400'></div>
            </div>
          </div>

          {/* Bottom Section - Enhanced typography with responsive sizing */}
          <div className='space-y-4 sm:space-y-5 md:space-y-6'>
            {/* Category Name with sophisticated styling - responsive text sizes */}
            <div className='relative'>
              <h3 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase tracking-tight text-white leading-[0.8] transform group-hover:translate-x-1 sm:group-hover:translate-x-2 group-active:translate-x-1 sm:group-active:translate-x-2 transition-all duration-500'>
                {category.name}
              </h3>
              {/* Subtle text accent - responsive */}
              <div className='absolute inset-0 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase tracking-tight text-amber-400/10 leading-[0.8] transform translate-x-0.5 translate-y-0.5 sm:translate-x-1 sm:translate-y-1 -z-10 group-hover:text-amber-400/20 group-active:text-amber-400/20 transition-all duration-500'>
                {category.name}
              </div>
            </div>

            {/* Description with elegant styling - responsive */}
            <div className='relative max-w-xs sm:max-w-sm md:max-w-md'>
              <p className='text-white/80 text-base sm:text-lg md:text-xl leading-relaxed font-light group-hover:text-white/90 group-active:text-white/90 transition-colors duration-300'>
                {category.description || "Discover our exquisite collection"}
              </p>
              {/* Minimal quote accent - responsive */}
              <div className='absolute -left-2 sm:-left-3 top-0 text-xl sm:text-2xl text-amber-400/30 font-serif group-hover:text-amber-400/50 group-active:text-amber-400/50 transition-colors duration-300'>
                "
              </div>
            </div>

            {/* Action Bar - always visible */}
            <div className='flex items-center gap-3 sm:gap-4'>
              <div className='flex items-center gap-1.5 sm:gap-2'>
                <div className='w-4 sm:w-5 md:w-6 h-px bg-amber-400'></div>
                <div className='w-0.5 h-0.5 sm:w-1 sm:h-1 bg-amber-400'></div>
                <div className='w-2 sm:w-3 h-px bg-white/60'></div>
              </div>
              <span className='text-white text-xs sm:text-sm uppercase tracking-[0.1em] sm:tracking-[0.15em] font-medium'>
                Explore
              </span>
              <div className='flex items-center gap-1'>
                <div className='w-6 sm:w-8 h-px bg-gradient-to-r from-white/60 to-transparent'></div>
                <ArrowUpRight className='w-2.5 h-2.5 sm:w-3 sm:h-3 text-white' />
              </div>
            </div>
          </div>
        </div>

        {/* Single geometric accent - minimal and responsive */}
        <div className='absolute top-4 sm:top-6 md:top-8 right-4 sm:right-6 md:right-8 pointer-events-none'>
          <div className='w-0 h-0 border-l-[20px] sm:border-l-[25px] md:border-l-[30px] border-l-transparent border-b-[20px] sm:border-b-[25px] md:border-b-[30px] border-b-amber-400/20 group-hover:border-b-amber-400/50 group-active:border-b-amber-400/50 transition-all duration-500'></div>
        </div>

        {/* Subtle corner decorations - responsive */}
        <div className='absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 flex gap-2 sm:gap-3 opacity-40 group-hover:opacity-70 group-active:opacity-70 transition-all duration-500 pointer-events-none'>
          <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400'></div>
          <div className='w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white mt-0.5'></div>
          <div className='w-2 sm:w-3 h-px bg-amber-400 mt-0.5 sm:mt-1'></div>
        </div>
      </div>
    </Link>
  );
}
