import React from "react";
import "../global.css";
import { cinzel, cormorant, montserrat, dmSans } from "../fonts";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart/CartContext";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { AuthSyncWrapper } from "@/components/auth/AuthSyncWrapper";
import { NavigationLoadingProvider } from "@/components/providers/NavigationLoadingProvider";
import { Toaster } from "@/components/ui/sonner";
import { getPayload } from "payload";
import config from "@/payload.config";
import type { Metadata, Viewport } from "next";
import type { CategoryUI } from "@/types/navigation";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFFFFF",
};

export const metadata: Metadata = {
  title: "Hut of Modesty - Premium Qamis & Abaya Clothing",
  description:
    "Premium Qamis & Abaya clothing store featuring elegant collections for men and women",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hut of Modesty",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/favicon.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/favicon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/favicon.png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Fetch categories on the server
  let categories: CategoryUI[] = [];

  try {
    const payload = await getPayload({ config });

    // Fetch categories and subcategories in parallel
    const [categoriesData, subcategoriesData] = await Promise.all([
      payload.find({
        collection: "categories",
        sort: "displayOrder",
        depth: 1,
      }),
      payload.find({
        collection: "subcategories",
        depth: 1,
      }),
    ]);

    // Create a map of categories by ID for quick lookup
    const categoriesMap: Record<string, CategoryUI> = {};
    categoriesData.docs.forEach((cat) => {
      categoriesMap[cat.id] = {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        subcategories: [],
      };
    });

    // Organize subcategories
    subcategoriesData.docs.forEach((subcat) => {
      const categoryId =
        typeof subcat.category === "object"
          ? subcat.category?.id
          : subcat.category;
      if (categoryId && categoriesMap[categoryId]) {
        categoriesMap[categoryId].subcategories.push({
          id: subcat.id,
          name: subcat.name,
          slug: subcat.slug,
        });
      }
    });

    categories = Object.values(categoriesMap);
  } catch (error) {
    console.error("Error fetching categories in layout:", error);
    // Re-throw the error to be handled by Next.js error boundaries
    throw error;
  }

  return (
    <html
      lang='en'
      className={`${cinzel.variable} 
      ${cormorant.variable} ${montserrat.variable} ${dmSans.className}`}>
      <head>
        <meta name='application-name' content='Hut of Modesty' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='Hut of Modesty' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='msapplication-TileColor' content='#FFFFFF' />
        <meta name='theme-color' content='#FFFFFF' />
        <link rel='icon' href='/icons/favicon.png' />
        <link rel='apple-touch-icon' href='/icons/icon512_maskable.png' />
        <link rel='apple-touch-startup-image' href='/icons/splash.png' />
      </head>
      <body className='font-body bg-[#f9f6f2]'>
        <AuthProvider>
          <CartProvider>
            <NavigationLoadingProvider>
              <AuthSyncWrapper>
                <Navbar categories={categories} />
                <main className='md:pt-[76px]'>{children}</main>
                <Footer />
              </AuthSyncWrapper>
              <Toaster />
            </NavigationLoadingProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
