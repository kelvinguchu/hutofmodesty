import { NextRequest, NextResponse } from "next/server";
import { checkPaymentStatus } from "@/lib/intasend/pay";

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    const result = await checkPaymentStatus(invoiceId);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to check payment status",
      },
      { status: 500 }
    );
  }
}
