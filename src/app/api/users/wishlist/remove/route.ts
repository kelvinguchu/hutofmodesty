import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

export async function POST(request: NextRequest) {
  let payload;

  try {
    payload = await getPayload({ config });

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
    const { itemId } = body;

    if (!itemId || typeof itemId !== "string") {
      return NextResponse.json({ message: "Invalid item ID" }, { status: 400 });
    }

    const currentUser = await payload.findByID({
      collection: "users",
      id: authResult.user.id,
      depth: 0,
    });

    const currentWishlist: any[] = Array.isArray(currentUser.wishlist)
      ? currentUser.wishlist
      : [];

    const updatedWishlist = currentWishlist.filter(
      (wishlistItem: any) => wishlistItem.id !== itemId
    );

    const updateResult = await payload.update({
      collection: "users",
      id: authResult.user.id,
      data: {
        wishlist: updatedWishlist,
      },
      overrideAccess: true,
      depth: 0,
    });

    if (!updateResult) {
      throw new Error("Failed to update user wishlist");
    }

    return NextResponse.json({
      message: "Item removed from wishlist successfully",
      success: true,
      wishlist: updatedWishlist,
    });
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (
        error.message.includes("Authentication") ||
        error.message.includes("Unauthorized")
      ) {
        return NextResponse.json(
          { message: "Authentication required", success: false },
          { status: 401 }
        );
      }

      if (
        error.message.includes("timeout") ||
        error.message.includes("ECONNRESET")
      ) {
        return NextResponse.json(
          { message: "Request timeout - please try again", success: false },
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Failed to remove item from wishlist",
        success: false,
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
