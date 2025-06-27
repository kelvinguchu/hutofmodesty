"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaCrown, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    image: "/hero/hero-abaya.jpg",
    title: "ELEGANT CLOTHING",
    subtitle: "Grace Redefined",
    description:
      "Discover our exquisite collection of abayas, dresses, and dirac designs crafted for timeless elegance",
    cta: "/collections/clothing",
    ctaText: "Explore Collection",
    accent: "purple",
  },
  {
    image: "/hero/hom-shoes.jpg",
    title: "PREMIUM FOOTWEAR",
    subtitle: "Step in Style",
    description:
      "Walk with confidence in our carefully curated collection of elegant shoes",
    cta: "/collections/footwear",
    ctaText: "Shop Footwear",
    accent: "emerald",
  },
  {
    image: "/hero/hom-bag.avif",
    title: "LUXURY ACCESSORIES",
    subtitle: "Complete Your Look",
    description:
      "Enhance your style with our premium collection of bags and jewelry",
    cta: "/collections/accessories",
    ctaText: "Browse Accessories",
    accent: "amber",
  },
  {
    image: "/hero/bakhoor.jpg",
    title: "EXQUISITE FRAGRANCES",
    subtitle: "Scents of Sophistication",
    description:
      "Immerse yourself in our captivating collection of perfumes and bakhoor",
    cta: "/collections/fragrances",
    ctaText: "Discover Scents",
    accent: "rose",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentSlide(index);
      setProgress(0);
      setTimeout(() => setIsTransitioning(false), 800);
    },
    [isTransitioning]
  );

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
  }, [currentSlide, goToSlide]);

  // Auto-advance with progress
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    setProgress(0);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + 1;
      });
    }, 100); // 10 seconds total (100 * 100ms)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentSlide, nextSlide]);

  const currentAccent = slides[currentSlide].accent;

  return (
    <section className='relative h-[calc(100vh-120px)] md:h-[calc(100vh-100px)] min-h-[600px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
      {/* Ornate Border Frame */}
      <div className='absolute top-8 md:top-4 left-4 right-4 bottom-4 z-30 pointer-events-none'>
        <div className='w-full h-full border-2 border-gradient-to-r from-amber-400/40 via-amber-300/60 to-amber-400/40 rounded-lg'>
          {/* Corner Ornaments */}
          <div className='absolute -top-1 -left-1 w-8 h-8 border-l-2 border-t-2 border-amber-400/80 rounded-tl-lg'></div>
          <div className='absolute -top-1 -right-1 w-8 h-8 border-r-2 border-t-2 border-amber-400/80 rounded-tr-lg'></div>
          <div className='absolute -bottom-1 -left-1 w-8 h-8 border-l-2 border-b-2 border-amber-400/80 rounded-bl-lg'></div>
          <div className='absolute -bottom-1 -right-1 w-8 h-8 border-r-2 border-b-2 border-amber-400/80 rounded-br-lg'></div>
        </div>
      </div>

      <AnimatePresence mode='wait'>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className='absolute inset-0'>
          {/* Background Image with Overlay */}
          <div className='relative w-full h-full'>
            {/* Shared Image for both mobile and desktop */}
            <Image
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              fill
              priority={currentSlide === 0}
              className='object-cover object-center'
              quality={95}
            />
            {/* Royal Gradient Overlay */}
            <div className='absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-slate-900/30'></div>
            {/* Accent Gradient */}
            <div
              className={`absolute inset-0 ${
                currentAccent === "emerald"
                  ? "bg-gradient-to-br from-emerald-900/20 to-transparent"
                  : currentAccent === "purple"
                    ? "bg-gradient-to-br from-purple-900/20 to-transparent"
                    : currentAccent === "amber"
                      ? "bg-gradient-to-br from-amber-900/20 to-transparent"
                      : "bg-gradient-to-br from-rose-900/20 to-transparent"
              }`}></div>
          </div>

          {/* Main Content */}
          <div className='absolute top-8 md:top-0 left-0 right-0 bottom-0 z-20 flex items-center'>
            <div className='container mx-auto px-8 lg:px-16'>
              <div className='max-w-3xl'>
                {/* Crown Icon */}
                <motion.div
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className='mb-6'>
                  <FaCrown
                    className={`text-4xl ${
                      currentAccent === "emerald"
                        ? "text-emerald-400"
                        : currentAccent === "purple"
                          ? "text-purple-400"
                          : currentAccent === "amber"
                            ? "text-amber-400"
                            : "text-rose-400"
                    }`}
                  />
                </motion.div>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className={`text-sm md:text-base uppercase tracking-[0.3em] font-light mb-4 ${
                    currentAccent === "emerald"
                      ? "text-emerald-300"
                      : currentAccent === "purple"
                        ? "text-purple-300"
                        : currentAccent === "amber"
                          ? "text-amber-300"
                          : "text-rose-300"
                  }`}>
                  {slides[currentSlide].subtitle}
                </motion.p>

                {/* Main Title */}
                <motion.h1
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className='text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-none tracking-tight'>
                  {slides[currentSlide].title}
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className='text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed'>
                  {slides[currentSlide].description}
                </motion.p>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}>
                  <Link
                    href={slides[currentSlide].cta}
                    className={`group relative inline-flex items-center px-8 py-4 text-white font-medium text-lg uppercase tracking-wider transition-all duration-300 overflow-hidden border-2 ${
                      currentAccent === "emerald"
                        ? "border-emerald-400 hover:border-emerald-300"
                        : currentAccent === "purple"
                          ? "border-purple-400 hover:border-purple-300"
                          : currentAccent === "amber"
                            ? "border-amber-400 hover:border-amber-300"
                            : "border-rose-400 hover:border-rose-300"
                    }`}>
                    <span
                      className={`absolute inset-0 ${
                        currentAccent === "emerald"
                          ? "bg-emerald-400"
                          : currentAccent === "purple"
                            ? "bg-purple-400"
                            : currentAccent === "amber"
                              ? "bg-amber-400"
                              : "bg-rose-400"
                      } transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300`}></span>
                    <span className='relative z-10 group-hover:text-slate-900 transition-colors duration-300'>
                      {slides[currentSlide].ctaText}
                    </span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30'>
        <div className='flex items-center space-x-6'>
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className='w-12 h-12 rounded-full border border-white/30 text-white/80 hover:text-white hover:border-white/60 transition-all duration-300 flex items-center justify-center backdrop-blur-sm'>
            <FaChevronLeft className='text-sm' />
          </button>

          {/* Slide Indicators with Progress */}
          <div className='flex items-center space-x-4'>
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className='relative'>
                <div
                  className={`w-12 h-1 rounded-full ${
                    currentSlide === index ? "bg-white/40" : "bg-white/20"
                  }`}>
                  {currentSlide === index && (
                    <div
                      className={`h-full rounded-full transition-all duration-100 ${
                        slide.accent === "emerald"
                          ? "bg-emerald-400"
                          : slide.accent === "purple"
                            ? "bg-purple-400"
                            : slide.accent === "amber"
                              ? "bg-amber-400"
                              : "bg-rose-400"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className='w-12 h-12 rounded-full border border-white/30 text-white/80 hover:text-white hover:border-white/60 transition-all duration-300 flex items-center justify-center backdrop-blur-sm'>
            <FaChevronRight className='text-sm' />
          </button>
        </div>
      </div>
    </section>
  );
}
