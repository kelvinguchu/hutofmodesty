"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaRegHeart, FaShoppingBag } from "react-icons/fa";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { useWishlistStore } from "@/lib/wishlist/wishlistStore";
import { CartSheet } from "@/components/cart/CartSheet";

interface ProductCardProps {
  product: {
    id: string;
    slug?: string;
    name: string;
    price: number;
    mainImage?:
      | string
      | {
          url?: string | null;
        }
      | null;
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
  const { addItem, items } = useCart();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  // Handle image source (either from CMS or static folder)
  let imageSource: string | undefined;

  // Only use the URL if mainImage is populated (is an object with a url)
  if (
    product.mainImage &&
    typeof product.mainImage === "object" &&
    "url" in product.mainImage &&
    product.mainImage.url
  ) {
    imageSource = product.mainImage.url;
  }

  // Fallback to staticImage if imageSource is still undefined
  if (!imageSource && product.staticImage) {
    imageSource = product.staticImage;
  }

  // Provide a default placeholder if no image source is found after checks
  const finalImageSource = imageSource || "/placeholder-product.jpg";

  // Check if the product is in wishlist and cart when component mounts or cart/wishlist changes
  useEffect(() => {
    setIsWishlisted(isInWishlist(product.id));
    setIsInCart(items.some((item) => item.id === product.id));
  }, [isInWishlist, product.id, items]);

  // Handle wishlist toggle
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

  // Handle add to cart
  const handleAddToCart = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (!isInCart) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: imageSource,
      });

      // Show confirmation
      setIsAddedToCart(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setIsAddedToCart(false);
        setIsInCart(true);
      }, 2000);
    }
  };

  const getAccentColors = () => {
    switch (accent) {
      case "emerald":
        return {
          primary: "emerald-500",
          hover: "emerald-600",
          light: "emerald-100",
        };
      case "purple":
        return {
          primary: "purple-500",
          hover: "purple-600",
          light: "purple-100",
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
      {/* Product Image */}
      <Link
        href={`/products/${product.id}`}
        className='block relative overflow-hidden cursor-pointer touch-manipulation'>
        <div className='relative aspect-[5/6] w-full bg-gray-50 rounded-t-lg overflow-hidden'>
          <Image
            src={finalImageSource}
            alt={product.name}
            fill
            sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
            className='object-cover object-center transition-transform duration-700 group-hover:scale-[1.02] group-active:scale-[1.01]'
          />
          {/* Subtle overlay on hover */}
          <div className='absolute inset-0 bg-black/0 group-hover:bg-black/5 group-active:bg-black/10 transition-colors duration-300'></div>
        </div>
      </Link>

      {/* Wishlist button - improved mobile accessibility */}
      <button
        onClick={handleWishlistToggle}
        className='absolute right-2 sm:right-2.5 top-2 sm:top-2.5 flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center bg-white/95 backdrop-blur-sm hover:bg-white active:bg-white transition-all duration-300 rounded-full shadow-sm border border-gray-100/50 hover:border-gray-200 active:border-gray-300 cursor-pointer touch-manipulation focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2'
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}>
        {isWishlisted ? (
          <FaHeart
            className={`text-${colors.primary} w-4 h-4 sm:w-3.5 sm:h-3.5`}
          />
        ) : (
          <FaRegHeart className='text-gray-500 group-hover:text-gray-700 w-4 h-4 sm:w-3.5 sm:h-3.5 transition-colors duration-200' />
        )}
      </button>

      {/* Product Info - responsive padding */}
      <div className='p-3 sm:p-4'>
        {/* Product name and price */}
        <div className='mb-3'>
          <h3 className='text-sm font-semibold text-gray-900 mb-1.5 line-clamp-2 leading-snug'>
            <Link
              href={`/products/${product.id}`}
              className='hover:text-gray-600 active:text-gray-700 transition-colors duration-200 cursor-pointer touch-manipulation'>
              {product.name}
            </Link>
          </h3>

          <div className='flex items-center justify-between'>
            <span className='text-base font-bold text-gray-900'>
              ${product.price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Add to Cart Button - improved mobile accessibility */}
        <div>
          {isInCart ? (
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
                  <FaShoppingBag className='h-4 w-4 sm:h-3.5 sm:w-3.5' />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Subtle bottom accent line */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-${colors.primary}/20 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300`}></div>
    </div>
  );
}
