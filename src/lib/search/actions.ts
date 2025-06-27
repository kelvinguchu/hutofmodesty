"use server";

import { cache } from "react";
import { getPayload } from "payload";
import config from "@/payload.config";

export interface SearchResult {
  id: string;
  name: string;
  price: number;
  mainImage?: {
    url?: string;
  } | null;
  category?: {
    name: string;
    slug: string;
  } | null;
  subcategory?: {
    name: string;
    slug: string;
  } | null;
  collection: "clothing" | "footwear" | "fragrances" | "accessories";
  createdAt: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  hasMore: boolean;
}

// Cache search results for 30 seconds to reduce database load
export const searchProducts = cache(
  async (query: string, limit: number = 8): Promise<SearchResponse> => {
    if (!query || query.trim().length < 2) {
      return {
        results: [],
        totalResults: 0,
        hasMore: false,
      };
    }

    try {
      const payload = await getPayload({ config });

      // Optimized search using Promise.all with proper where conditions
      const searchPromises = [
        payload.find({
          collection: "clothing",
          where: {
            and: [
              { status: { equals: "active" } },
              {
                or: [
                  { name: { like: query } }, // More efficient than contains
                  { description: { like: query } },
                ],
              },
            ],
          },
          limit: Math.ceil(limit / 2), // Prioritize clothing and accessories
          depth: 1, // Reduced depth for performance
          sort: "-createdAt",
        }),
        payload.find({
          collection: "accessories",
          where: {
            and: [
              { status: { equals: "active" } },
              {
                or: [
                  { name: { like: query } },
                  { description: { like: query } },
                ],
              },
            ],
          },
          limit: Math.ceil(limit / 2),
          depth: 1,
          sort: "-createdAt",
        }),
        payload.find({
          collection: "footwear",
          where: {
            and: [
              { status: { equals: "active" } },
              {
                or: [
                  { name: { like: query } },
                  { description: { like: query } },
                ],
              },
            ],
          },
          limit: Math.ceil(limit / 4),
          depth: 1,
          sort: "-createdAt",
        }),
        payload.find({
          collection: "fragrances",
          where: {
            and: [
              { status: { equals: "active" } },
              {
                or: [
                  { name: { like: query } },
                  { description: { like: query } },
                ],
              },
            ],
          },
          limit: Math.ceil(limit / 4),
          depth: 1,
          sort: "-createdAt",
        }),
      ];

      const [
        clothingResults,
        accessoriesResults,
        footwearResults,
        fragrancesResults,
      ] = await Promise.all(searchPromises);

      // Helper function to map Payload document to SearchResult
      const mapToSearchResult = (
        doc: any,
        collection: SearchResult["collection"]
      ): SearchResult => {
        return {
          id: doc.id,
          name: doc.name,
          price: doc.price,
          mainImage:
            typeof doc.mainImage === "object" && doc.mainImage?.url
              ? { url: doc.mainImage.url }
              : null,
          category:
            typeof doc.category === "object"
              ? { name: doc.category.name, slug: doc.category.slug }
              : null,
          subcategory:
            typeof doc.subcategory === "object"
              ? { name: doc.subcategory.name, slug: doc.subcategory.slug }
              : null,
          collection,
          createdAt: doc.createdAt,
        };
      };

      // Combine and format results with collection type
      const allResults: SearchResult[] = [
        ...clothingResults.docs.map((doc) =>
          mapToSearchResult(doc, "clothing")
        ),
        ...accessoriesResults.docs.map((doc) =>
          mapToSearchResult(doc, "accessories")
        ),
        ...footwearResults.docs.map((doc) =>
          mapToSearchResult(doc, "footwear")
        ),
        ...fragrancesResults.docs.map((doc) =>
          mapToSearchResult(doc, "fragrances")
        ),
      ];

      // Sort by relevance (name matches first, then by creation date)
      const sortedResults = allResults
        .sort((a, b) => {
          const aNameMatch = a.name.toLowerCase().includes(query.toLowerCase());
          const bNameMatch = b.name.toLowerCase().includes(query.toLowerCase());

          if (aNameMatch && !bNameMatch) return -1;
          if (!aNameMatch && bNameMatch) return 1;

          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        })
        .slice(0, limit);

      const totalResults =
        clothingResults.totalDocs +
        accessoriesResults.totalDocs +
        footwearResults.totalDocs +
        fragrancesResults.totalDocs;

      return {
        results: sortedResults,
        totalResults,
        hasMore: totalResults > limit,
      };
    } catch (error) {
      console.error("Search error:", error);
      return {
        results: [],
        totalResults: 0,
        hasMore: false,
      };
    }
  }
);

// Action for useActionState - correct signature with state as first parameter
export async function searchAction(
  prevState: SearchResponse,
  formData: FormData
): Promise<SearchResponse> {
  const query = formData.get("query") as string;
  const limit = parseInt(formData.get("limit") as string) || 8;

  return await searchProducts(query, limit);
}
