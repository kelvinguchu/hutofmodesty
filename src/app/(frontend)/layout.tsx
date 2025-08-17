import React from "react";
import "../global.css";
import { cinzel, cormorant, montserrat, dmSans } from "../fonts";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { NavigationLoadingProvider } from "@/components/providers/NavigationLoadingProvider";
import { Toaster } from "@/components/ui/sonner";
import { getPayload } from "payload";
import config from "@/payload.config";
import { verifySession } from "@/lib/auth/dal";
import type { Metadata, Viewport } from "next";
import type { CategoryUI } from "@/types/navigation";
import { cache } from "react";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFFFFF",
};

// Cached function to get categories - this will significantly improve performance
const getCachedCategories = cache(async (): Promise<CategoryUI[]> => {
  try {
    const payload = await getPayload({ config });

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

    const categoriesMap: Record<string, CategoryUI> = {};
    categoriesData.docs.forEach((cat: any) => {
      categoriesMap[cat.id] = {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        subcategories: [],
      };
    });

    subcategoriesData.docs.forEach((subcat: any) => {
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

    return Object.values(categoriesMap);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
});

export const metadata: Metadata = {
  title: "Hut of Modesty - Premium Modest Fashion & Accessories",
  description:
    "Premium modest fashion store featuring elegant clothing, footwear, accessories, and fragrances",
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
  let categories: CategoryUI[] = [];
  let sessionData: { isAuth: boolean; user: any } = {
    isAuth: false,
    user: null,
  };

  try {
    // Only verify session - move categories to a separate cached function
    sessionData = await verifySession();

    // Use cached categories - this will be much faster
    categories = await getCachedCategories();
  } catch (error) {
    if (error instanceof Error && error.message?.includes("categories")) {
      throw error;
    }
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
        <NavigationLoadingProvider>
          <Navbar
            categories={categories}
            user={sessionData.user}
            isAuthenticated={sessionData.isAuth}
          />
          <main className='md:pt-[76px]'>{children}</main>
          <Footer />
          <Toaster />
        </NavigationLoadingProvider>
      </body>
    </html>
  );
}
