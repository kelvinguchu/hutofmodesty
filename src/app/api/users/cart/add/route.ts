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
      typeof item.price !== "number" ||
      typeof item.quantity !== "number"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid item data format. Required: id, name, price, quantity",
        },
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

    const existingItemIndex = currentCart.findIndex(
      (cartItem: any) => cartItem.id === item.id
    );

    let updatedCart: any[];
    if (existingItemIndex >= 0) {
      updatedCart = [...currentCart];
      const existingItem = updatedCart[existingItemIndex] as any;
      updatedCart[existingItemIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + item.quantity,
        name: item.name,
        price: item.price,
        image: item.image,
      };
    } else {
      updatedCart = [...currentCart, item];
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
      message: "Item added to cart successfully",
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to add item to cart",
        success: false,
      },
      { status: 500 }
    );
  }
}
