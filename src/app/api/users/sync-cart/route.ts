import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config });

    // Convert Next.js headers to the format Payload expects (same as /api/users/me)
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      headers.set(key, value);
    });

    // Get the authenticated user
    const authResult = await payload.auth({ headers });

    if (!authResult.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { cartItems } = await request.json();

    // Update user's cart data
    await payload.update({
      collection: "users",
      id: authResult.user.id,
      data: {
        cart: cartItems,
      },
    });

    return NextResponse.json({
      message: "Cart synced successfully",
      cartItems,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to sync cart" },
      { status: 500 }
    );
  }
}
