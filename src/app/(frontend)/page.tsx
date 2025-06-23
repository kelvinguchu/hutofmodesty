import React from "react";
import { getPayload } from "payload";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";

import config from "@/payload.config";
import type { PaginatedDocs } from "payload";
import type { Category, Product } from "@/payload-types";
import Hero from "@/components/home/Hero";
import SectionTitle from "@/components/home/SectionTitle";
import ProductCard from "@/components/home/ProductCard";
import CategoryCard, { CategoryCardData } from "@/components/home/CategoryCard";
import FAQ from "@/components/home/FAQ";

// Static data for FAQs
const faqData = [
  {
    question: "What is your return policy?",
    answer:
      "We accept returns within 14 days of delivery for unworn items in their original packaging. Items must be in perfect condition with all original tags attached.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping typically takes 5-7 business days. Express shipping options are available at checkout for 2-3 business day delivery.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to most countries worldwide. International shipping typically takes 7-14 business days depending on the destination.",
  },
  {
    question: "How do I care for my garments?",
    answer:
      "We recommend dry cleaning for most of our items to maintain their quality and appearance. Specific care instructions are included with each garment.",
  },
  {
    question: "What sizes do you offer?",
    answer:
      "We offer a full range of sizes from S to XXL. Please refer to our size guide on each product page to find your perfect fit.",
  },
];

// Fallback component when no products are available
interface EmptyProductsSectionProps {
  collectionType: string;
  collectionName: string;
}

const EmptyProductsSection: React.FC<EmptyProductsSectionProps> = ({
  collectionType,
  collectionName,
}) => {
  // Map collection types to their correct image paths
  const getImagePath = (type: string) => {
    switch (type) {
      case "abayas":
        return "/abayas/abaya2.webp";
      case "qamis":
        return "/qamis/qamis2.webp";
      default:
        return "/abayas/abaya.webp";
    }
  };

  return (
    <div className='bg-black text-white p-12 text-center'>
      <div className='mb-6 relative h-[200px] w-[200px] mx-auto'>
        <Image
          src={getImagePath(collectionType)}
          alt={`${collectionName} Image`}
          fill
          sizes='200px'
          className='object-cover grayscale'
        />
      </div>
      <h3 className='text-2xl font-black uppercase mb-4'>
        {collectionName} Coming Soon
      </h3>
      <p className='text-gray-400 mb-6 text-base'>
        We're crafting something extraordinary. Stay tuned.
      </p>
      <Link
        href={`/collections/${collectionType}`}
        className='inline-flex items-center px-6 py-3 bg-white text-black font-medium uppercase tracking-wider hover:bg-gray-200 transition-colors'>
        Notify Me <ArrowRight className='ml-2 w-4 h-4' />
      </Link>
    </div>
  );
};

export default async function HomePage() {
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });

  // Initialize with empty data in case of errors (typed as PaginatedDocs<...>)
  let featuredCategories: PaginatedDocs<Category> = {
    docs: [],
    totalDocs: 0,
    limit: 0,
    page: 1,
    pagingCounter: 0,
    totalPages: 0,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  };

  let trendingAbayas: PaginatedDocs<Product> = {
    docs: [],
    totalDocs: 0,
    limit: 0,
    page: 1,
    pagingCounter: 0,
    totalPages: 0,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  };

  let trendingQamis: PaginatedDocs<Product> = {
    docs: [],
    totalDocs: 0,
    limit: 0,
    page: 1,
    pagingCounter: 0,
    totalPages: 0,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  };

  try {
    // Fetch featured categories
    featuredCategories = await payload.find({
      collection: "categories",
      where: {
        featured: {
          equals: true,
        },
      },
      sort: "displayOrder",
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  try {
    // Fetch trending Abayas
    trendingAbayas = await payload.find({
      collection: "products",
      where: {
        and: [
          {
            "category.slug": {
              equals: "abaya",
            },
          },
          {
            trending: {
              equals: true,
            },
          },
          {
            status: {
              equals: "active",
            },
          },
        ],
      },
      limit: 8,
      depth: 1,
    });
  } catch (error) {
    console.error("Error fetching abayas:", error);
  }

  try {
    // Fetch trending Qamis
    trendingQamis = await payload.find({
      collection: "products",
      where: {
        and: [
          {
            "category.slug": {
              equals: "qamis",
            },
          },
          {
            trending: {
              equals: true,
            },
          },
          {
            status: {
              equals: "active",
            },
          },
        ],
      },
      limit: 8,
      depth: 1,
    });
  } catch (error) {
    console.error("Error fetching qamis:", error);
  }

  const categoriesToDisplay: CategoryCardData[] = [
    ...(featuredCategories.docs as CategoryCardData[]),
  ];

  // Use CMS data directly without static fallbacks for products
  const abayasToDisplay = trendingAbayas.docs;
  const qamisToDisplay = trendingQamis.docs;

  return (
    <div className='bg-white'>
      {/* Hero Section */}
      <div className='-mt-4 md:mt-6'>
        <Hero />
      </div>

      {/* Categories Section - Optimized for 2 categories */}
      <section className='py-0'>
        <div className='grid grid-cols-1 lg:grid-cols-2'>
          {categoriesToDisplay.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Brand Statement */}
      <section className='py-16 sm:py-18 md:py-20 bg-black text-white text-center'>
        <div className='container mx-auto px-4 sm:px-6 max-w-4xl'>
          <h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-4 sm:mb-6 leading-tight px-2'>
            Redefining <span className='text-purple-400'>Modern</span> Modest
            Wear
          </h2>
          <p className='text-base sm:text-lg md:text-xl text-gray-400 leading-relaxed px-4 sm:px-0'>
            Where contemporary design meets traditional values. Every piece is
            crafted to empower your authentic self.
          </p>
        </div>
      </section>

      {/* Trending Abayas Section */}
      <section className='py-12 sm:py-14 md:py-16 bg-white'>
        <div className='container mx-auto px-4 sm:px-6'>
          <SectionTitle
            title='Trending Abayas'
            subtitle='Featured Collection'
            accent='purple'
          />

          {abayasToDisplay.length > 0 ? (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-10 sm:mb-12'>
                {abayasToDisplay.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    accent='purple'
                  />
                ))}
              </div>

              <div className='text-center px-4'>
                <Link
                  href='/collections/abaya'
                  className='inline-flex items-center gap-2 text-sm font-semibold text-purple-500 hover:text-purple-600 active:text-purple-700 transition-all duration-200 px-5 sm:px-6 py-3 border border-purple-500/20 hover:border-purple-500/40 active:border-purple-500/60 rounded-lg hover:bg-purple-50 active:bg-purple-100 cursor-pointer group touch-manipulation focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'>
                  View All Abayas
                  <ArrowRight className='w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-active:translate-x-1' />
                </Link>
              </div>
            </>
          ) : (
            <EmptyProductsSection
              collectionType='abayas'
              collectionName='Abayas'
            />
          )}
        </div>
      </section>

      {/* Values Section */}
      <section className='hidden md:block py-12 sm:py-14 md:py-16 bg-gray-50'>
        <div className='container mx-auto px-4 sm:px-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-8'>
            <div className='text-center space-y-3 sm:space-y-4 px-2'>
              <div className='w-11 h-11 sm:w-12 sm:h-12 bg-emerald-500 flex items-center justify-center mx-auto'>
                <Zap className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
              </div>
              <h3 className='text-lg sm:text-xl font-bold uppercase tracking-wide'>
                Premium Quality
              </h3>
              <p className='text-gray-600 leading-relaxed text-sm sm:text-base'>
                Meticulously crafted using the finest materials and contemporary
                techniques.
              </p>
            </div>

            <div className='text-center space-y-3 sm:space-y-4 px-2'>
              <div className='w-11 h-11 sm:w-12 sm:h-12 bg-purple-500 flex items-center justify-center mx-auto'>
                <Shield className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
              </div>
              <h3 className='text-lg sm:text-xl font-bold uppercase tracking-wide'>
                Authentic Design
              </h3>
              <p className='text-gray-600 leading-relaxed text-sm sm:text-base'>
                Honoring tradition while embracing modern aesthetics and
                functionality.
              </p>
            </div>

            <div className='text-center space-y-3 sm:space-y-4 px-2'>
              <div className='w-11 h-11 sm:w-12 sm:h-12 bg-black flex items-center justify-center mx-auto'>
                <Truck className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
              </div>
              <h3 className='text-lg sm:text-xl font-bold uppercase tracking-wide'>
                Global Delivery
              </h3>
              <p className='text-gray-600 leading-relaxed text-sm sm:text-base'>
                Fast, reliable shipping to bring our collections to your
                doorstep worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Qamis Section */}
      <section className='py-12 sm:py-14 md:py-16 bg-white'>
        <div className='container mx-auto px-4 sm:px-6'>
          <SectionTitle
            title='Trending Qamis'
            subtitle='Handcrafted Excellence'
            accent='emerald'
          />

          {qamisToDisplay.length > 0 ? (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-10 sm:mb-12'>
                {qamisToDisplay.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    accent='emerald'
                  />
                ))}
              </div>

              <div className='text-center px-4'>
                <Link
                  href='/collections/qamis'
                  className='inline-flex items-center gap-2 text-sm font-semibold text-emerald-500 hover:text-emerald-600 active:text-emerald-700 transition-all duration-200 px-5 sm:px-6 py-3 border border-emerald-500/20 hover:border-emerald-500/40 active:border-emerald-500/60 rounded-lg hover:bg-emerald-50 active:bg-emerald-100 cursor-pointer group touch-manipulation focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2'>
                  View All Qamis
                  <ArrowRight className='w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-active:translate-x-1' />
                </Link>
              </div>
            </>
          ) : (
            <EmptyProductsSection
              collectionType='qamis'
              collectionName='Qamis'
            />
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className='py-12 mb-12 md:mb-0 sm:py-14 md:py-16 bg-black text-white'>
        <div className='container mx-auto px-4 sm:px-6 max-w-4xl'>
          <SectionTitle
            title='Questions & Answers'
            subtitle='Need Help?'
            accent='emerald'
            darkMode={true}
          />
          <div className='space-y-1 sm:space-y-2'>
            <FAQ faqs={faqData} accent='emerald' />
          </div>
        </div>
      </section>
    </div>
  );
}
