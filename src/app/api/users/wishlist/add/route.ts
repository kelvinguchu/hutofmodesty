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
    const { item } = body;

    if (
      !item ||
      typeof item !== "object" ||
      !item.id ||
      !item.name ||
      typeof item.price !== "number"
    ) {
      return NextResponse.json(
        { message: "Invalid item data format. Required: id, name, price" },
        { status: 400 }
      );
    }

    const currentUser = await payload.findByID({
      collection: "users",
      id: authResult.user.id,
    });

    const currentWishlist: any[] = Array.isArray(currentUser.wishlist)
      ? currentUser.wishlist
      : [];

    const itemExists = currentWishlist.some(
      (wishlistItem: any) => wishlistItem.id === item.id
    );

    if (itemExists) {
      return NextResponse.json({
        message: "Item already in wishlist",
        success: true,
        wishlist: currentWishlist,
      });
    }

    const updatedWishlist = [...currentWishlist, item];

    await payload.update({
      collection: "users",
      id: authResult.user.id,
      data: {
        wishlist: updatedWishlist,
      },
      overrideAccess: true,
    });

    return NextResponse.json({
      message: "Item added to wishlist successfully",
      success: true,
      wishlist: updatedWishlist,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to add item to wishlist",
        success: false,
      },
      { status: 500 }
    );
  }
}
