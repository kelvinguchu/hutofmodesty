import { NextRequest, NextResponse } from "next/server";
import { initiatePayment, type PaymentData } from "@/lib/intasend/pay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, amount, apiRef, host } =
      body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !amount ||
      !apiRef
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "All fields are required for payment initiation",
        },
        { status: 400 }
      );
    }

    if (typeof phoneNumber !== "string" || phoneNumber.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid phone number",
          message: "Please provide a valid phone number",
        },
        { status: 400 }
      );
    }

    let formattedPhone = phoneNumber.replace(/\s+/g, "");

    if (formattedPhone.startsWith("+254")) {
      formattedPhone = formattedPhone.substring(1);
    } else if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone;
    }

    if (!/^254\d{9}$/.test(formattedPhone)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid phone number format",
          message:
            "Please provide a valid Kenyan phone number (e.g., +254712345678)",
        },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid amount",
          message: "Amount must be a positive number",
        },
        { status: 400 }
      );
    }

    const paymentData: PaymentData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phoneNumber: formattedPhone,
      amount,
      apiRef,
      host:
        host || process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
    };

    const result = await initiatePayment(paymentData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        message: "Failed to initiate payment. Please try again.",
      },
      { status: 500 }
    );
  }
}
