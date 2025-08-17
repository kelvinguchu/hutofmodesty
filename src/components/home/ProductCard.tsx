"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Check, ShoppingCart, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart/cartStore";
import { useWishlistStore } from "@/lib/wishlist/wishlistStore";
import { CartSheet } from "@/components/cart/CartSheet";
import { normalizeMediaURL } from "@/lib/utils";
import type { Clothing, Footwear, Fragrance, Accessory } from "@/payload-types";

type Product = Clothing | Footwear | Fragrance | Accessory;

interface ProductCardProps {
  product: Product & {
    staticImage?: string;
  };
  imageWidth?: number;
  imageHeight?: number;
  accent?: "emerald" | "purple" | "default";
}

export default function ProductCard({
  product,
  imageWidth = 400,
  imageHeight = 500,
  accent = "default",
}: Readonly<ProductCardProps>) {
  const { addItem, isInCart } = useCartStore();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  let imageSource: string | undefined;

  if (
    product.mainImage &&
    typeof product.mainImage === "object" &&
    "url" in product.mainImage &&
    product.mainImage.url
  ) {
    imageSource = normalizeMediaURL(product.mainImage.url);
  }

  if (!imageSource && product.staticImage) {
    imageSource = product.staticImage;
  }

  const finalImageSource =
    imageSource ||
    "https://hwn6k89767.ufs.sh/f/k0Qi0uf9dUswVZpzzikaMTreiOA9qxR5j0HCbX2aKGJDgfuy";

  // Optimized hydration - single effect
  useEffect(() => {
    setIsHydrated(true);
    setIsWishlisted(isInWishlist(product.id));
  }, [isInWishlist, product.id]);

  const productIsInCart = isHydrated ? isInCart(product.id) : false;

  const handleWishlistToggle = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (isWishlisted) {
      removeFromWishlist(product.id);
      setIsWishlisted(false);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: imageSource,
      });
      setIsWishlisted(true);
    }
  };

  const handleAddToCart = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (!productIsInCart) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: imageSource,
      });

      setIsAddedToCart(true);

      setTimeout(() => {
        setIsAddedToCart(false);
      }, 2000);
    }
  };

  const getAccentColors = () => {
    switch (accent) {
      case "emerald":
        return {
          primary: "primary",
          hover: "primary/90",
          light: "primary/10",
        };
      case "purple":
        return {
          primary: "primary",
          hover: "primary/90",
          light: "primary/10",
        };
      default:
        return {
          primary: "black",
          hover: "gray-900",
          light: "gray-100",
        };
    }
  };

  const colors = getAccentColors();

  return (
    <div className='group relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:shadow-gray-900/10 transition-all duration-500 hover:border-gray-300 hover:-translate-y-1 active:scale-[0.98] active:shadow-md overflow-hidden'>
      <Link
        href={`/products/${product.slug}`}
        className='block relative overflow-hidden cursor-pointer touch-manipulation'>
        <div className='relative aspect-[5/6] w-full bg-gray-50 rounded-t-lg overflow-hidden'>
          <Image
            src={finalImageSource}
            alt={product.name}
            fill
            sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
            className='object-cover object-center transition-transform duration-700 group-hover:scale-[1.02] group-active:scale-[1.01]'
          />
          <div className='absolute inset-0 bg-black/0 group-hover:bg-black/5 group-active:bg-black/10 transition-colors duration-300'></div>
        </div>
      </Link>

      <button
        onClick={handleWishlistToggle}
        className='absolute right-2 sm:right-2.5 top-2 sm:top-2.5 flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center bg-white/95 backdrop-blur-sm hover:bg-white active:bg-white transition-all duration-300 rounded-full shadow-sm border border-gray-100/50 hover:border-gray-200 active:border-gray-300 cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2'
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}>
        <Heart
          className={`w-4 h-4 sm:w-3.5 sm:h-3.5 transition-colors duration-200 ${
            isWishlisted
              ? `text-${colors.primary} fill-current`
              : "text-gray-500 group-hover:text-gray-700"
          }`}
        />
      </button>

      <div className='p-3 sm:p-4'>
        <div className='mb-3'>
          <h3 className='text-sm font-semibold text-gray-900 mb-1.5 line-clamp-2 leading-snug'>
            <Link
              href={`/products/${product.slug}`}
              className='hover:text-gray-600 active:text-gray-700 transition-colors duration-200 cursor-pointer touch-manipulation'>
              {product.name}
            </Link>
          </h3>

          <div className='flex items-center justify-between'>
            <span className='text-base font-bold text-gray-900'>
              KES {product.price.toFixed(2)}
            </span>
          </div>
        </div>

        <div>
          {productIsInCart ? (
            <CartSheet>
              <button
                className={`w-full flex items-center justify-center gap-2 bg-${colors.primary} hover:bg-${colors.hover} active:bg-${colors.hover} text-white px-3 py-3 sm:py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-${colors.primary} focus:ring-offset-2 cursor-pointer touch-manipulation rounded-md`}>
                <ShoppingCart className='h-4 w-4 sm:h-3.5 sm:w-3.5' />
                <span>View in Cart</span>
              </button>
            </CartSheet>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isAddedToCart}
              className={`w-full flex items-center justify-center gap-2 transition-all duration-300 px-3 py-3 sm:py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md touch-manipulation ${
                isAddedToCart
                  ? `bg-${colors.primary} text-white cursor-default ring-${colors.primary}`
                  : `bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-900 hover:text-black active:text-black border border-gray-200 hover:border-gray-300 active:border-gray-400 focus:ring-gray-300 cursor-pointer`
              }`}>
              {isAddedToCart ? (
                <>
                  <Check className='h-4 w-4 sm:h-3.5 sm:w-3.5' />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag className='h-4 w-4 sm:h-3.5 sm:w-3.5' />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-${colors.primary}/20 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300`}></div>
    </div>
  );
}
