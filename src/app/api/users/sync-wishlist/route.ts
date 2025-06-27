import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config });

    // Convert Next.js headers to the format Payload expects
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      headers.set(key, value);
    });

    // Get the authenticated user using Payload's auth method
    const authResult = await payload.auth({ headers });

    if (!authResult.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { wishlistItems } = body;

    // Validate wishlistItems is an array
    if (!Array.isArray(wishlistItems)) {
      return NextResponse.json(
        { message: "Invalid wishlist data format" },
        { status: 400 }
      );
    }

    // Update user's wishlist data in the database
    await payload.update({
      collection: "users",
      id: authResult.user.id,
      data: {
        wishlist: wishlistItems,
      },
      overrideAccess: false, // Enforce access control
    });

    return NextResponse.json({
      message: "Wishlist synchronized successfully",
      success: true,
    });
  } catch (error) {
    // Return generic error message for security
    return NextResponse.json(
      {
        message: "Failed to synchronize wishlist data",
        success: false,
      },
      { status: 500 }
    );
  }
}
