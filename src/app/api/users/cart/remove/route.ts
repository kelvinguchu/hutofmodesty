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
    const { itemId } = body;

    if (!itemId || typeof itemId !== "string") {
      return NextResponse.json({ message: "Invalid item ID" }, { status: 400 });
    }

    const currentUser = await payload.findByID({
      collection: "users",
      id: authResult.user.id,
    });

    const currentCart: any[] = Array.isArray(currentUser.cart)
      ? currentUser.cart
      : [];

    const updatedCart = currentCart.filter(
      (cartItem: any) => cartItem.id !== itemId
    );

    await payload.update({
      collection: "users",
      id: authResult.user.id,
      data: {
        cart: updatedCart,
      },
      overrideAccess: true,
    });

    return NextResponse.json({
      message: "Item removed from cart successfully",
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to remove item from cart",
        success: false,
      },
      { status: 500 }
    );
  }
}
