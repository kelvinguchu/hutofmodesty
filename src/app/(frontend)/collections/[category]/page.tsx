import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// Import optimized cached data fetching functions
import {
  getPayloadInstance,
  findCategoryBySlug,
  findProductsByCategory,
} from "@/lib/products/actions";

import CategoryDisplay from "@/components/collections/CategoryDisplay";

// Static generation config - Enable ISR with 30 minute revalidation
export const revalidate = 1800; // 30 minutes
export const dynamicParams = true; // Generate new pages on-demand

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;

  try {
    const categoryDoc = await findCategoryBySlug(category);

    if (!categoryDoc) {
      return {
        title: "Category Not Found - Hut of Modesty",
        description: "The requested category could not be found.",
      };
    }

    return {
      title: `${categoryDoc.name} - Hut of Modesty`,
      description:
        categoryDoc.description ||
        `Shop our ${categoryDoc.name} collection at Hut of Modesty. Premium quality products with fast shipping.`,
      openGraph: {
        title: `${categoryDoc.name} - Hut of Modesty`,
        description:
          categoryDoc.description || `Shop ${categoryDoc.name} collection`,
        type: "website",
      },
    };
  } catch (error) {
    console.error("Error generating category metadata:", error);
    return {
      title: "Shop by Category - Hut of Modesty",
      description: "Browse our premium product collections",
    };
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>) {
  const { category } = await params;
  const { sort = "newest" } = await searchParams;

  // Ensure sort is a string
  const sortString = Array.isArray(sort) ? sort[0] : sort;

  try {
    // Use cached payload instance
    const payload = await getPayloadInstance();

    // Find the category using cached function
    const categoryDoc = await findCategoryBySlug(category);

    if (!categoryDoc) {
      notFound();
    }

    // Collection mapping for efficient queries
    const collectionMap: { [key: string]: string } = {
      clothing: "clothing",
      footwear: "footwear",
      accessories: "accessories",
      fragrances: "fragrances",
    };

    const collectionSlug = collectionMap[category];
    if (!collectionSlug) {
      notFound();
    }

    // Fetch subcategories and products in parallel for better performance
    const [subcategoriesData, productsData] = await Promise.all([
      payload.find({
        collection: "subcategories",
        where: {
          category: { equals: categoryDoc.id },
        },
        sort: "displayOrder",
        draft: false,
      }),
      findProductsByCategory(categoryDoc.id, collectionSlug, {
        sort:
          sortString === "price-desc"
            ? "-price"
            : sortString === "price-asc"
              ? "price"
              : "-createdAt",
        limit: 12,
      }),
    ]);

    return (
      <CategoryDisplay
        category={categoryDoc}
        subcategories={subcategoriesData.docs}
        products={productsData.docs}
        totalProducts={productsData.totalDocs}
        currentSort={sortString}
      />
    );
  } catch (error) {
    console.error("Error fetching category data:", error);
    throw error;
  }
}
