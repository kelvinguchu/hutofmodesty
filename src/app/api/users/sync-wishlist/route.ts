import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config });

    const headers = new Headers();
    request.headers.forEach((value, key) => {
      headers.set(key, value);
    });

    const authResult = await payload.auth({ headers });

    if (!authResult.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { wishlistItems } = body;

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
      overrideAccess: true,
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
