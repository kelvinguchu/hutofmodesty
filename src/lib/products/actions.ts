import { cache } from "react";
import { getPayload } from "payload";
import { notFound } from "next/navigation";
import type { Clothing, Footwear, Fragrance, Accessory } from "@/payload-types";
import config from "@/payload.config";

// Union type for all product types
export type UnifiedProduct = Clothing | Footwear | Fragrance | Accessory;

// Collection mapping for efficient queries
const COLLECTION_MAP = {
  clothing: "clothing",
  footwear: "footwear",
  fragrances: "fragrances",
  accessories: "accessories",
} as const;

// Cached function to get payload instance
export const getPayloadInstance = cache(async () => {
  return await getPayload({ config });
});

// Optimized product finder using React cache for deduplication
export const findProductById = cache(
  async (id: string): Promise<UnifiedProduct | null> => {
    const payload = await getPayloadInstance();

    // Use Promise.all to search all collections in parallel instead of sequentially
    const searchPromises = Object.values(COLLECTION_MAP).map(
      async (collection) => {
        try {
          const result = await payload.find({
            collection: collection as any,
            where: {
              id: { equals: id },
            },
            limit: 1,
            depth: 2,
            // Add caching hint for better performance
            draft: false,
          });

          return result.docs.length > 0
            ? { collection, product: result.docs[0] }
            : null;
        } catch (error) {
          return null;
        }
      }
    );

    const results = await Promise.all(searchPromises);
    const found = results.find((result) => result !== null);

    return found ? (found.product as UnifiedProduct) : null;
  }
);

// Cached function for fetching related products
export const findRelatedProducts = cache(
  async (
    product: UnifiedProduct,
    limit: number = 8
  ): Promise<UnifiedProduct[]> => {
    const payload = await getPayloadInstance();

    // Determine source collection more efficiently
    const sourceCollection = getProductCollection(product);

    if (!sourceCollection) {
      console.error("Unable to determine product collection");
      return [];
    }

    try {
      const categoryId =
        typeof product.category === "string"
          ? product.category
          : product.category?.id;

      const result = await payload.find({
        collection: sourceCollection as any,
        where: {
          and: [
            { category: { equals: categoryId } },
            { id: { not_equals: product.id } },
            { status: { equals: "active" } }, // Only fetch active products
          ],
        },
        limit,
        depth: 2,
        sort: "-createdAt",
        draft: false,
      });

      return result.docs as UnifiedProduct[];
    } catch (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
  }
);

// Cached function for fetching products by category
export const findProductsByCategory = cache(
  async (
    categoryId: string,
    collection: string,
    options: {
      sort?: string;
      limit?: number;
      page?: number;
    } = {}
  ): Promise<{ docs: UnifiedProduct[]; totalDocs: number }> => {
    const payload = await getPayloadInstance();
    const { sort = "-createdAt", limit = 12, page = 1 } = options;

    try {
      const result = await payload.find({
        collection: collection as any,
        where: {
          and: [
            { category: { equals: categoryId } },
            { status: { equals: "active" } },
          ],
        },
        sort:
          sort === "price-desc"
            ? "-price"
            : sort === "price-asc"
              ? "price"
              : sort,
        limit,
        page,
        depth: 2,
        draft: false,
      });

      return {
        docs: result.docs as UnifiedProduct[],
        totalDocs: result.totalDocs,
      };
    } catch (error) {
      console.error(
        `Error fetching products for category ${categoryId}:`,
        error
      );
      return { docs: [], totalDocs: 0 };
    }
  }
);

// Helper function to determine product collection based on type guards
function getProductCollection(
  product: UnifiedProduct
): keyof typeof COLLECTION_MAP | null {
  if ("sizeVariations" in product) return "clothing";
  if ("sizeFrom" in product) return "footwear";
  if ("volume" in product) return "fragrances";
  if ("accessoryType" in product) return "accessories";
  return null;
}

// Cached function for fetching category data
export const findCategoryBySlug = cache(async (slug: string) => {
  const payload = await getPayloadInstance();

  try {
    const result = await payload.find({
      collection: "categories",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
      draft: false,
    });

    return result.docs.length > 0 ? result.docs[0] : null;
  } catch (error) {
    console.error(`Error fetching category ${slug}:`, error);
    return null;
  }
});

// Preload function for better performance patterns
export const preloadProduct = (id: string) => {
  // void evaluates the given expression and returns undefined
  // This starts loading the product data early
  void findProductById(id);
};

export const preloadRelatedProducts = (product: UnifiedProduct) => {
  void findRelatedProducts(product);
};
