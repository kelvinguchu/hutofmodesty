"use server";

import IntaSend from "intasend-node";

const intasend = new IntaSend(
  process.env.INTASEND_PUBLIC_KEY,
  process.env.INTASEND_SECRET_KEY,
  false
);

export interface PaymentData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  amount: number;
  apiRef: string;
  host?: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export async function validateIntaSendCredentials(): Promise<PaymentResponse> {
  try {
    if (!process.env.INTASEND_PUBLIC_KEY || !process.env.INTASEND_SECRET_KEY) {
      return {
        success: false,
        error: "Missing IntaSend credentials",
        message: "INTASEND_PUBLIC_KEY or INTASEND_SECRET_KEY not set",
      };
    }

    const collection = intasend.collection();

    if (collection) {
      return {
        success: true,
        message: "IntaSend credentials validated successfully",
      };
    }

    return {
      success: false,
      error: "Failed to create collection instance",
      message: "Invalid IntaSend credentials",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Credential validation failed",
      message: "Invalid IntaSend credentials",
    };
  }
}

export async function initiatePayment(
  paymentData: PaymentData
): Promise<PaymentResponse> {
  try {
    const collection = intasend.collection();

    const requestData = {
      first_name: paymentData.firstName,
      last_name: paymentData.lastName,
      email: paymentData.email,
      host:
        paymentData.host ||
        process.env.NEXT_PUBLIC_SERVER_URL ||
        "https://localhost:3000",
      amount: paymentData.amount,
      phone_number: paymentData.phoneNumber,
      api_ref: paymentData.apiRef,
    };

    const response = await collection.mpesaStkPush(requestData);

    return {
      success: true,
      data: response,
      message:
        "Payment initiated successfully. Please check your phone for M-Pesa prompt.",
    };
  } catch (error: any) {
    let errorMessage = error.message || "Payment initiation failed";
    if (error.response && error.response.data) {
      try {
        const responseData =
          typeof error.response.data === "string"
            ? JSON.parse(error.response.data)
            : error.response.data;
        errorMessage =
          responseData.message || responseData.error || errorMessage;
      } catch (parseError) {}
    }

    return {
      success: false,
      error: errorMessage,
      message: "Failed to initiate payment. Please try again.",
    };
  }
}

export async function checkPaymentStatus(
  invoiceId: string
): Promise<PaymentResponse> {
  try {
    if (!process.env.INTASEND_PUBLIC_KEY || !process.env.INTASEND_SECRET_KEY) {
      return {
        success: false,
        error: "Missing IntaSend credentials",
        message: "Server configuration error",
        data: {
          isAuthError: true,
          shouldStopPolling: true,
        },
      };
    }

    const collection = intasend.collection();
    const response = await collection.status(invoiceId);

    return {
      success: true,
      data: response,
      message: "Payment status retrieved successfully",
    };
  } catch (error: any) {
    let errorMessage = error.message || "Failed to check payment status";
    if (error.response && Buffer.isBuffer(error.response)) {
      try {
        const errorData = JSON.parse(error.response.toString());
        errorMessage =
          errorData.errors?.[0]?.message || errorData.message || errorMessage;
      } catch (parseError) {}
    }

    const isAuthError =
      error.message?.includes("401") ||
      error.message?.includes("not_auth") ||
      error.message?.includes("unauthorized") ||
      errorMessage.includes("not_auth") ||
      errorMessage.includes("unauthorized");

    const isNetworkError =
      error.message?.includes("ECONNREFUSED") ||
      error.message?.includes("ETIMEDOUT") ||
      error.message?.includes("network");

    return {
      success: false,
      error: errorMessage,
      message: "Could not retrieve payment status",
      data: {
        isAuthError,
        isNetworkError,
        shouldStopPolling: isAuthError,
      },
    };
  }
}
