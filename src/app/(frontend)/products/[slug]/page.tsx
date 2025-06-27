import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// Import our optimized cached data fetching functions
import {
  findProductById,
  findRelatedProducts,
  preloadProduct,
  preloadRelatedProducts,
  type UnifiedProduct,
} from "@/lib/products/actions";

import RelatedProducts from "@/components/products/RelatedProducts";
import Breadcrumb from "@/components/products/Breadcrumb";

// Client component wrapper for product details section with dynamic color selection
import dynamic from "next/dynamic";

// Import the client component for handling color selection
const ProductViewWithColorSelection = dynamic(
  () => import("@/components/products/ProductViewWithColorSelection"),
  { ssr: true }
);

// Static generation config - Enable ISR with 1 hour revalidation
export const revalidate = 3600; // 1 hour
export const dynamicParams = true; // Generate new pages on-demand for unknown product IDs

// Generate static params for popular products at build time
export async function generateStaticParams() {
  // You can implement this to pre-generate popular product pages
  // For now, we'll let Next.js generate them on-demand
  return [];
}

// Optimized metadata generation using cached functions
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    // Use cached function for better performance
    const product = await findProductById(slug);

    if (!product) {
      return {
        title: "Product Not Found - Hut of Modesty",
        description: "The requested product could not be found.",
      };
    }

    // Extract description text from rich text field
    let descriptionText = "";
    if (product.description) {
      const descUnknown = product.description as unknown;

      if (typeof descUnknown === "string") {
        descriptionText = descUnknown.slice(0, 160);
      } else if (
        typeof descUnknown === "object" &&
        descUnknown !== null &&
        "root" in descUnknown &&
        (descUnknown as any).root?.children
      ) {
        descriptionText = (descUnknown as any).root.children
          .map((node: any) => {
            if (node.children && Array.isArray(node.children)) {
              return node.children
                .filter((child: any) => child.text)
                .map((child: any) => child.text)
                .join(" ");
            }
            return "";
          })
          .join(" ")
          .slice(0, 160);
      }
    }

    // Get product image for Open Graph
    let imageUrl = "";
    if (product.mainImage) {
      if (typeof product.mainImage === "object" && "url" in product.mainImage) {
        imageUrl = product.mainImage.url || "";
      }
    }

    return {
      title: `${product.name} - Hut of Modesty`,
      description:
        descriptionText ||
        `Shop ${product.name} at Hut of Modesty. Premium quality products with fast shipping.`,
      openGraph: {
        title: `${product.name} - Hut of Modesty`,
        description:
          descriptionText || `Shop ${product.name} at Hut of Modesty`,
        images: imageUrl ? [{ url: imageUrl, alt: product.name }] : undefined,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} - Hut of Modesty`,
        description:
          descriptionText || `Shop ${product.name} at Hut of Modesty`,
        images: imageUrl ? [imageUrl] : undefined,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Product - Hut of Modesty",
      description: "View product details at Hut of Modesty",
    };
  }
}

export default async function ProductPage({
  params,
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;

  // Preload the product data early (starts fetching immediately)
  preloadProduct(slug);

  // Use cached function for optimized data fetching
  const product = await findProductById(slug);

  if (!product) {
    notFound();
  }

  // Preload related products while we prepare the response
  preloadRelatedProducts(product);

  // Fetch related products using cached function
  const relatedProducts = await findRelatedProducts(product, 8);

  // Extract additional images from color variations (clothing specific)
  const additionalImages: { url: string; alt: string }[] = [];

  if ("colorVariations" in product && product.colorVariations) {
    product.colorVariations.forEach((variation: any) => {
      if (
        variation.additionalImages &&
        Array.isArray(variation.additionalImages)
      ) {
        variation.additionalImages.forEach((img: any) => {
          if (img.image && typeof img.image === "object" && img.image.url) {
            additionalImages.push({
              url: img.image.url,
              alt: `${product.name} - ${variation.color}`,
            });
          }
        });
      }
    });
  }

  return (
    <div className='w-full bg-white md:mt-4 pb-24 md:pb-0'>
      <Breadcrumb productName={product.name} category={product.category} />

      <div className='container mx-auto px-4 py-8'>
        <ProductViewWithColorSelection
          product={product}
          additionalImages={additionalImages}
        />

        {relatedProducts.length > 0 && (
          <div className=''>
            <RelatedProducts
              products={relatedProducts as any}
              currentProductId={product.id}
            />
          </div>
        )}
      </div>
    </div>
  );
}
