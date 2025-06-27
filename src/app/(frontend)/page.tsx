import React from "react";
import { getPayload } from "payload";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";

import config from "@/payload.config";
import type { PaginatedDocs } from "payload";
import type {
  Category,
  Clothing,
  Footwear,
  Fragrance,
  Accessory,
} from "@/payload-types";

// Union type for all product types
type Product = Clothing | Footwear | Fragrance | Accessory;
import Hero from "@/components/home/Hero";
import SectionTitle from "@/components/home/SectionTitle";
import ProductCard from "@/components/home/ProductCard";
import CategoryCard, { CategoryCardData } from "@/components/home/CategoryCard";
import FAQ from "@/components/home/FAQ";

// Import optimized cached data fetching functions
import { getPayloadInstance } from "@/lib/products/actions";

// Static generation with ISR - revalidate every 30 minutes for fresh content
export const revalidate = 1800; 

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

export default async function HomePage() {
  // Use cached payload instance
  const payload = await getPayloadInstance();

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

  let allTrendingProducts: PaginatedDocs<Product> = {
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
    // Fetch trending products from all collections - original approach but with cached payload
    const [
      clothingTrending,
      footwearTrending,
      fragrancesTrending,
      accessoriesTrending,
    ] = await Promise.all([
      payload.find({
        collection: "clothing",
        where: {
          and: [
            { trending: { equals: true } },
            { status: { equals: "active" } },
          ],
        },
        limit: 12,
        depth: 2,
        sort: "-createdAt",
      }),
      payload.find({
        collection: "footwear",
        where: {
          and: [
            { trending: { equals: true } },
            { status: { equals: "active" } },
          ],
        },
        limit: 12,
        depth: 2,
        sort: "-createdAt",
      }),
      payload.find({
        collection: "fragrances",
        where: {
          and: [
            { trending: { equals: true } },
            { status: { equals: "active" } },
          ],
        },
        limit: 12,
        depth: 2,
        sort: "-createdAt",
      }),
      payload.find({
        collection: "accessories",
        where: {
          and: [
            { trending: { equals: true } },
            { status: { equals: "active" } },
          ],
        },
        limit: 12,
        depth: 2,
        sort: "-createdAt",
      }),
    ]);

    // Combine all trending products
    const allTrendingDocs = [
      ...clothingTrending.docs,
      ...footwearTrending.docs,
      ...fragrancesTrending.docs,
      ...accessoriesTrending.docs,
    ];

    // Create a mock PaginatedDocs structure for compatibility
    allTrendingProducts = {
      docs: allTrendingDocs,
      totalDocs: allTrendingDocs.length,
      limit: 50,
      page: 1,
      pagingCounter: 0,
      totalPages: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null,
    };
  } catch (error) {
    console.error("Error fetching trending products:", error);
  }

  const categoriesToDisplay: CategoryCardData[] = [
    ...(featuredCategories.docs as CategoryCardData[]),
  ];

  // Group trending products by main category
  const productsByCategory = new Map<string, Product[]>();

  allTrendingProducts.docs.forEach((product) => {
    if (product.category && typeof product.category === "object") {
      const categorySlug = product.category.slug;
      if (!productsByCategory.has(categorySlug)) {
        productsByCategory.set(categorySlug, []);
      }
      productsByCategory.get(categorySlug)!.push(product);
    }
  });

  // Configuration for each major category section - original design with proper accents
  const categoryConfig = {
    clothing: {
      title: "Trending Clothing",
      subtitle: "Featured Collection",
      accent: "purple" as const,
      link: "/collections/clothing",
      linkText: "View All Clothing",
    },
    footwear: {
      title: "Trending Footwear",
      subtitle: "Step in Style",
      accent: "emerald" as const,
      link: "/collections/footwear",
      linkText: "View All Footwear",
    },
    accessories: {
      title: "Trending Accessories",
      subtitle: "Complete Your Look",
      accent: "purple" as const,
      link: "/collections/accessories",
      linkText: "View All Accessories",
    },
    fragrances: {
      title: "Trending Fragrances",
      subtitle: "Signature Scents",
      accent: "emerald" as const,
      link: "/collections/fragrances",
      linkText: "View All Fragrances",
    },
  };

  // Only get categories that have trending products
  const trendingCategories = Array.from(productsByCategory.keys())
    .filter((slug) => categoryConfig[slug as keyof typeof categoryConfig])
    .slice(0, 4); // All 4 major categories if they have products

  return (
    <div className='bg-white'>
      {/* Hero Section */}
      <div className='-mt-4 md:mt-6'>
        <Hero />
      </div>

      {/* Categories Section - Optimized for 2 categories */}
      <section className='py-0'>
        <div className='grid grid-cols-1 lg:grid-cols-2'>
          {featuredCategories.docs.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Brand Statement */}
      <section className='py-16 sm:py-18 md:py-20 bg-black text-white text-center'>
        <div className='container mx-auto px-4 sm:px-6 max-w-4xl'>
          <h2 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-4 sm:mb-6 leading-tight px-2'>
            Crafting <span className='text-primary'>elegance</span> with a touch
            of modesty
          </h2>
          <p className='text-base sm:text-lg md:text-xl text-gray-400 leading-relaxed px-4 sm:px-0'>
            Where contemporary design meets traditional values. Every piece is
            crafted to empower your authentic self.
          </p>
        </div>
      </section>

      {/* Dynamic Trending Product Sections - using mono color scheme */}
      {trendingCategories.map((categorySlug) => {
        const config =
          categoryConfig[categorySlug as keyof typeof categoryConfig];
        const products = productsByCategory.get(categorySlug) || [];

        return (
          <section key={categorySlug} className='py-4 sm:py-6 md:py-6 bg-white'>
            <div className='container mx-auto px-4 sm:px-6'>
              <SectionTitle
                title={config.title}
                subtitle={config.subtitle}
                accent={config.accent}
              />

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10'>
                {products.slice(0, 8).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    accent={config.accent}
                  />
                ))}
              </div>

              <div className='text-center px-4'>
                <Link
                  href={config.link}
                  className='inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 active:text-primary/70 transition-all duration-200 px-5 sm:px-6 py-3 border border-primary/20 hover:border-primary/40 active:border-primary/60 rounded-lg hover:bg-primary/5 active:bg-primary/10 cursor-pointer group touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'>
                  {config.linkText}
                  <ArrowRight className='w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-active:translate-x-1' />
                </Link>
              </div>
            </div>
          </section>
        );
      })}

      {/* Values Section */}
      <section className='hidden md:block py-12 sm:py-14 md:py-16 bg-gray-50'>
        <div className='container mx-auto px-4 sm:px-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-8'>
            <div className='text-center space-y-3 sm:space-y-4 px-2'>
              <div className='w-11 h-11 sm:w-12 sm:h-12 bg-accent flex items-center justify-center mx-auto'>
                <Zap className='w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground' />
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
              <div className='w-11 h-11 sm:w-12 sm:h-12 bg-primary flex items-center justify-center mx-auto'>
                <Shield className='w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground' />
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
              <div className='w-11 h-11 sm:w-12 sm:h-12 bg-secondary flex items-center justify-center mx-auto'>
                <Truck className='w-5 h-5 sm:w-6 sm:h-6 text-secondary-foreground' />
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
