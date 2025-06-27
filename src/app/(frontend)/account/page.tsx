import React from "react";
import { redirect } from "next/navigation";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";
import config from "@/payload.config";
import { AccountDashboard } from "@/components/account/AccountDashboard";

export const metadata = {
  title: "My Account - Hut of Modesty",
  description: "Manage your Hut of Modesty account",
};

export default async function AccountPage() {
  const headers = await getHeaders();
  const payload = await getPayload({ config });

  try {
    // Convert Next.js headers to the format Payload expects (same as other routes)
    const convertedHeaders = new Headers();
    headers.forEach((value, key) => {
      convertedHeaders.set(key, value);
    });

    const { user } = await payload.auth({ headers: convertedHeaders });

    if (!user) {
      redirect(
        "/login?error=You must be logged in to access your account&redirect=/account"
      );
    }

    // Fetch user with profile photo data
    const userWithPhoto = await payload.findByID({
      collection: "users",
      id: user.id,
      depth: 2, // Include related media data
    });

    return (
      <div>
        <AccountDashboard user={userWithPhoto} />
      </div>
    );
  } catch (error) {
    // Check if it's a redirect error (which is expected behavior)
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      // Re-throw redirect errors so they work properly
      throw error;
    }

    // Authentication failed - redirect to login
    redirect("/login?error=Authentication failed&redirect=/account");
  }
}
