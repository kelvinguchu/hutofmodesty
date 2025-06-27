import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/search/actions";

// Cache this route for 60 seconds with revalidation
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "8");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        results: [],
        totalResults: 0,
        hasMore: false,
      });
    }

    // Use the cached search function
    const searchResponse = await searchProducts(query, limit);

    return NextResponse.json(searchResponse, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-Search-Query": query,
        "X-Total-Results": searchResponse.totalResults.toString(),
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      {
        results: [],
        totalResults: 0,
        hasMore: false,
        error: "Search failed",
      },
      { status: 500 }
    );
  }
}
