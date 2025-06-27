"use client";

import React, { useState, useEffect } from "react";
import ProductGallery from "./ProductGallery";
import ProductDetails from "./ProductDetails";
import type { Clothing, Footwear, Fragrance, Accessory } from "@/payload-types";

// Union type for all product types
type Product = Clothing | Footwear | Fragrance | Accessory;

interface ProductImage {
  url: string;
  alt?: string;
}

interface ProductViewWithColorSelectionProps {
  product: Product;
  additionalImages: ProductImage[];
}

const ProductViewWithColorSelection: React.FC<
  ProductViewWithColorSelectionProps
> = ({ product, additionalImages }) => {
  // Early return if product is undefined
  if (!product) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Product not found
          </h2>
          <p className='text-gray-600'>
            The product you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // Type-specific property extraction for color handling (only clothing has color variations)
  const colorCode = ("colorCode" in product ? product.colorCode : "") || "";
  const colorVariations =
    "colorVariations" in product ? product.colorVariations || [] : [];

  // Initialize with main color if available, otherwise first color variation
  const defaultColor =
    colorCode ||
    (colorVariations.length > 0 ? colorVariations[0]?.colorCode : null);

  // State for the selected color
  const [selectedColorCode, setSelectedColorCode] = useState<
    string | undefined
  >(defaultColor ?? undefined);

  // Handle color selection
  const handleColorSelect = (colorVariation: any) => {
    setSelectedColorCode(colorVariation.colorCode);
  };

  // Update color when product changes
  useEffect(() => {
    setSelectedColorCode(defaultColor ?? undefined);
  }, [product, defaultColor]);

  // Helper to convert mainImage to ProductImage format
  const getMainImageForGallery = () => {
    if (!product.mainImage) return null;

    if (typeof product.mainImage === "string") {
      return { url: product.mainImage };
    }

    if (
      typeof product.mainImage === "object" &&
      "url" in product.mainImage &&
      product.mainImage.url
    ) {
      return { url: product.mainImage.url };
    }

    return null;
  };

  // Helper to convert colorVariations to the expected format
  const getColorVariationsForGallery = () => {
    return colorVariations
      .filter((variation: any) => variation.colorCode && variation.color) // Filter out invalid variations
      .map((variation: any) => ({
        color: variation.color,
        colorCode: variation.colorCode,
        image: variation.image || { url: "" },
        additionalImages: variation.additionalImages || [],
      }));
  };

  return (
    <div className='flex flex-col md:flex-row gap-4 md:gap-8 px-2 md:px-0'>
      <ProductGallery
        mainImage={getMainImageForGallery()}
        additionalImages={additionalImages}
        productName={product.name}
        colorVariations={getColorVariationsForGallery()}
        selectedColorCode={selectedColorCode}
      />

      <ProductDetails product={product} onColorSelect={handleColorSelect} />
    </div>
  );
};

export default ProductViewWithColorSelection;
