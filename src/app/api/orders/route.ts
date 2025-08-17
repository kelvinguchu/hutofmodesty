import { getPayload } from "payload";
import { NextResponse, NextRequest } from "next/server";
import config from "@/payload.config";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

type OrderStatus =
  | "pending"
  | "processing"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";
type PaymentStatus = "pending" | "processing" | "complete" | "failed";

interface OrderRequestBody {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    address: string;
    city: string;
    country: string;
    postalCode: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status?: OrderStatus;
  payment?: {
    method?: string;
    transactionId?: string;
    status?: PaymentStatus;
    details?: Record<string, unknown>;
  };
}

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config });
    const body: OrderRequestBody = await request.json();

    const headers = new Headers();
    request.headers.forEach((value, key) => {
      headers.set(key, value);
    });

    const authResult = await payload.auth({ headers });
    const paymentMethod = "mpesa";

    const orderNumber = `HOM-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const order = await payload.create({
      collection: "orders",
      data: {
        user: authResult.user?.id || null,
        orderNumber,
        customer: {
          firstName: body.customer.firstName,
          lastName: body.customer.lastName,
          email: body.customer.email,
          phone: body.customer.phone,
        },
        shippingAddress: {
          address: body.shippingAddress.address,
          city: body.shippingAddress.city,
          country: body.shippingAddress.country,
          postalCode: body.shippingAddress.postalCode,
        },
        items: body.items.map((item: OrderItem) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image ?? null,
        })),
        subtotal: body.subtotal,
        shippingFee: body.shippingFee,
        total: body.total,
        status: body.status ?? "pending",
        payment: {
          method: paymentMethod,
          transactionId: body.payment?.transactionId ?? null,
          status: body.payment?.status ?? "pending",
          details: body.payment?.details ?? {},
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config });

    const { user } = await payload.auth({ headers: request.headers });

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orders = await payload.find({
      collection: "orders",
      where: {
        user: {
          equals: user.id,
        },
      },
      sort: "-createdAt",
      limit: 50,
      depth: 1,
    });

    return NextResponse.json(orders);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message?.includes("session") || error.message?.includes("Session"))
    ) {
      return NextResponse.json({ docs: [], totalDocs: 0, limit: 50, page: 1 });
    }

    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
