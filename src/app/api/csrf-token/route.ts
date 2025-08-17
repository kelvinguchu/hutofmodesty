import { NextResponse } from "next/server";
import { generateCSRFToken } from "@/lib/csrf";

export async function GET() {
  try {
    const token = generateCSRFToken();

    return NextResponse.json({
      csrfToken: token,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 }
    );
  }
}
