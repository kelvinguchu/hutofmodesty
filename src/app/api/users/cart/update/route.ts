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
    const { itemId, quantity } = body;

    if (
      !itemId ||
      typeof itemId !== "string" ||
      typeof quantity !== "number" ||
      quantity < 0
    ) {
      return NextResponse.json(
        { message: "Invalid item ID or quantity" },
        { status: 400 }
      );
    }

    const currentUser = await payload.findByID({
      collection: "users",
      id: authResult.user.id,
    });

    const currentCart: any[] = Array.isArray(currentUser.cart)
      ? currentUser.cart
      : [];

    let updatedCart: any[];
    if (quantity === 0) {
      updatedCart = currentCart.filter(
        (cartItem: any) => cartItem.id !== itemId
      );
    } else {
      updatedCart = currentCart.map((cartItem: any) =>
        cartItem.id === itemId ? { ...cartItem, quantity } : cartItem
      );
    }

    await payload.update({
      collection: "users",
      id: authResult.user.id,
      data: {
        cart: updatedCart,
      },
      overrideAccess: true,
    });

    return NextResponse.json({
      message:
        quantity === 0
          ? "Item removed from cart successfully"
          : "Cart updated successfully",
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      {
        message: "Failed to update cart",
        success: false,
      },
      { status: 500 }
    );
  }
}
