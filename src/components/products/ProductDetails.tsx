import React, { useState } from "react";
import {
  Heart,
  ShoppingCart,
  Check,
  Palette,
  Ruler,
  User,
  Shirt,
  Droplets,
  Clock,
  Users,
} from "lucide-react";
import { useCartStore } from "@/lib/cart/cartStore";
import { useWishlistStore } from "@/lib/wishlist/wishlistStore";
import { CartSheet } from "@/components/cart/CartSheet";
import type { Clothing, Footwear, Fragrance, Accessory } from "@/payload-types";

// Union type for all product types
type Product = Clothing | Footwear | Fragrance | Accessory;

interface RichTextNode {
  children?: Array<{
    text?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

interface RichText {
  root?: {
    children?: RichTextNode[];
  };
  [key: string]: any;
}

interface ColorVariation {
  color: string;
  colorCode: string;
  image: {
    url: string;
  };
  additionalImages?: any[];
}

interface SizeVariation {
  size: string;
  inStock: boolean;
}

interface HeightRange {
  min: number;
  max: number;
  label: string;
}

interface ConfettiEmoji {
  id: number;
  emoji: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
}

interface ProductDetailsProps {
  product: Product; // Pass the entire product to handle different types
  onColorSelect?: (
    colorVariation: ColorVariation | { color: string; colorCode: string }
  ) => void;
}

// Standard size options for comparison
const ALL_SIZE_OPTIONS = [
  { label: "S", value: "S" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
  { label: "XL", value: "XL" },
  { label: "XXL", value: "XXL" },
];

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  onColorSelect,
}) => {
  // Extract common properties
  const { id, name, price, description, mainImage } = product;

  // Type-specific property extraction with type guards
  const color = ("color" in product ? product.color : "") || "";
  const colorCode = ("colorCode" in product ? product.colorCode : "") || "";
  const colorVariations =
    "colorVariations" in product ? product.colorVariations || [] : [];
  const sizeVariations =
    "sizeVariations" in product ? product.sizeVariations || [] : [];
  const heightRanges =
    "heightRanges" in product ? product.heightRanges || [] : [];

  // Footwear-specific properties
  const sizeFrom = "sizeFrom" in product ? product.sizeFrom : undefined;
  const sizeTo = "sizeTo" in product ? product.sizeTo : undefined;
  const shoeType = "shoeType" in product ? product.shoeType : undefined;

  // Fragrance-specific properties
  const volume = "volume" in product ? product.volume : undefined;
  const volumeUnit = "volumeUnit" in product ? product.volumeUnit : undefined;
  const longevity = "longevity" in product ? product.longevity : undefined;
  const targetGender =
    "targetGender" in product ? product.targetGender : undefined;
  const occasion = "occasion" in product ? product.occasion : undefined;

  // Accessory-specific properties
  const accessoryType =
    "accessoryType" in product ? product.accessoryType : undefined;
  const availableSizes =
    "availableSizes" in product ? product.availableSizes || [] : [];
  const jewelryType =
    "jewelryType" in product ? product.jewelryType : undefined;
  const metalType = "metalType" in product ? product.metalType : undefined;
  const { addItem: addToCart, isInCart } = useCartStore();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
    items: wishlistItems,
  } = useWishlistStore();

  // Combine main color and color variations for display
  const allColorOptions =
    color && colorCode
      ? [
          {
            color,
            colorCode,
            isMain: true,
            image:
              typeof mainImage === "object" && mainImage?.url
                ? { url: mainImage.url }
                : undefined,
          },
          ...colorVariations.map((v) => ({ ...v, isMain: false })),
        ]
      : colorVariations.map((v) => ({ ...v, isMain: false }));

  // State for selected options
  const [selectedColor, setSelectedColor] = useState<string | null>(
    allColorOptions.length > 0 ? allColorOptions[0]?.colorCode || null : null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizeVariations.length > 0 ? sizeVariations[0]?.size : null
  );
  const [selectedHeight, setSelectedHeight] = useState<string | null>(
    heightRanges.length > 0 ? heightRanges[0]?.label : null
  );

  // State for button confirmations
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const isProductInCart = isInCart(id);
  const isProductInWishlist = isInWishlist(id);

  // Emoji confetti states
  const [cartConfetti, setCartConfetti] = useState<ConfettiEmoji[]>([]);
  const [wishlistConfetti, setWishlistConfetti] = useState<ConfettiEmoji[]>([]);

  // Determine the image to use for cart/wishlist based on selected color
  const getSelectedImage = () => {
    const selectedColorOption = allColorOptions.find(
      (v) => v.colorCode === selectedColor
    );

    // Extract URL from selectedColorOption.image (handle different types)
    let selectedImageUrl: string | undefined;
    if (selectedColorOption?.image) {
      if (typeof selectedColorOption.image === "string") {
        selectedImageUrl = selectedColorOption.image;
      } else if (
        typeof selectedColorOption.image === "object" &&
        "url" in selectedColorOption.image &&
        selectedColorOption.image.url
      ) {
        selectedImageUrl = selectedColorOption.image.url;
      }
    }

    const mainImageUrl =
      typeof mainImage === "object" && mainImage?.url
        ? mainImage.url
        : undefined;
    return selectedImageUrl || mainImageUrl || undefined;
  };

  // Format description for display
  const formattedDescription = React.useMemo(() => {
    if (typeof description === "string") {
      return description;
    } else if (description && description.root && description.root.children) {
      return description.root.children
        .map((node) => {
          if (node.children && Array.isArray(node.children)) {
            return node.children
              .filter((child) => child.text)
              .map((child) => child.text)
              .join(" ");
          }
          return "";
        })
        .join(" ");
    }
    return "No description available";
  }, [description]);

  // Create emoji confetti effect
  const createConfetti = (
    type: "cart" | "wishlist",
    buttonRef: Element | null
  ) => {
    if (!buttonRef) return;

    // Define emojis based on the type
    const emojis = type === "cart" ? ["🛍️", "✨", "💼"] : ["❤️", "💕", "✨"];

    // Get button position for confetti
    const rect = buttonRef.getBoundingClientRect();

    // Create random positions for each emoji
    const confetti = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: Math.random() * 60 - 30, // Random X offset from -30 to 30
      y: -(Math.random() * 60 + 20), // Upward Y offset from -20 to -80
      rotation: Math.random() * 360, // Random rotation
      scale: 0.5 + Math.random() * 1, // Random scale between 0.5 and 1.5
      opacity: 0.8 + Math.random() * 0.2, // Random opacity between 0.8 and 1
    }));

    // Set the confetti state based on type
    if (type === "cart") {
      setCartConfetti(confetti);
      setTimeout(() => setCartConfetti([]), 1000); // Clear after animation
    } else {
      setWishlistConfetti(confetti);
      setTimeout(() => setWishlistConfetti([]), 1000); // Clear after animation
    }
  };

  // Handle color selection
  const handleColorSelect = (colorOption: any) => {
    setSelectedColor(colorOption.colorCode);
    if (onColorSelect) {
      onColorSelect(colorOption);
    }
  };

  // Handle size selection
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  // Handle height selection
  const handleHeightSelect = (heightLabel: string) => {
    setSelectedHeight(heightLabel);
  };

  // Handle Add to Cart
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isProductInCart) {
      addToCart({
        id: id,
        name: name,
        price: price,
        quantity: 1,
        image: getSelectedImage(),
      });
      setIsAddedToCart(true);
      createConfetti("cart", e.currentTarget);
      setTimeout(() => setIsAddedToCart(false), 2000);
    }
  };

  // Handle Wishlist Toggle
  const handleWishlistToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isProductInWishlist) {
      removeFromWishlist(id);
    } else {
      addToWishlist({
        id: id,
        name: name,
        price: price,
        image: getSelectedImage(),
      });
      createConfetti("wishlist", e.currentTarget);
    }
  };

  return (
    <div className='w-full md:w-1/2 space-y-3 sm:space-y-4 mt-4 md:mt-0 relative'>
      {/* Product title and price */}
      <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100'>
        <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight'>
          {name}
        </h1>
        <div className='flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3'>
          <p className='text-xl sm:text-2xl font-bold text-primary'>
            KES {typeof price === "number" ? price.toFixed(2) : "0.00"}
          </p>
          <span className='inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800 w-fit'>
            In Stock
          </span>
        </div>
      </div>

      {/* Description */}
      <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100'>
        <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2'>
          <div className='w-2 h-2 bg-primary rounded-full'></div>
          Product Description
        </h3>
        <p className='text-sm sm:text-base text-gray-600 leading-relaxed'>
          {formattedDescription}
        </p>
      </div>

      {/* Color Selection */}
      {allColorOptions.length > 0 && (
        <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100'>
          <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2'>
            <Palette className='w-4 h-4 sm:w-5 sm:h-5 text-primary' />
            Color
          </h3>
          <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4'>
            <div className='flex gap-2 sm:gap-3 flex-wrap'>
              {allColorOptions.map((colorOption) => (
                <button
                  key={colorOption.colorCode}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-200 touch-manipulation ${
                    selectedColor === colorOption.colorCode
                      ? "border-primary ring-2 ring-primary/20 scale-110"
                      : "border-gray-300 hover:border-primary/60 hover:scale-105 active:scale-95"
                  } ${colorOption.isMain ? "ring-1 ring-gray-400" : ""} focus:outline-none focus:ring-2 focus:ring-primary`}
                  style={{ backgroundColor: colorOption.colorCode || "#gray" }}
                  aria-label={`Select ${colorOption.color} color`}
                  onClick={() => handleColorSelect(colorOption)}
                />
              ))}
            </div>
            {selectedColor && (
              <div className='bg-gray-50 rounded-lg px-3 py-2 w-fit'>
                <p className='text-xs sm:text-sm font-medium text-gray-700'>
                  {
                    allColorOptions.find((v) => v.colorCode === selectedColor)
                      ?.color
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {sizeVariations.length > 0 && (
        <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100'>
          <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2'>
            <User className='w-4 h-4 sm:w-5 sm:h-5 text-primary' />
            Size
          </h3>
          <div className='grid grid-cols-5 gap-2 sm:gap-3'>
            {ALL_SIZE_OPTIONS.map((sizeOption) => {
              const sizeVariation = sizeVariations.find(
                (v) => v.size === sizeOption.value
              );
              const isAvailable = Boolean(sizeVariation?.inStock);

              return (
                <button
                  key={sizeOption.value}
                  className={`py-2 sm:py-3 px-2 sm:px-4 border-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm touch-manipulation ${
                    selectedSize === sizeOption.value
                      ? "border-primary bg-primary text-primary-foreground shadow-lg scale-105"
                      : isAvailable
                        ? "border-gray-300 hover:border-primary/60 hover:bg-primary/5 text-gray-700 active:scale-95"
                        : "border-gray-200 text-gray-400 line-through cursor-not-allowed bg-gray-50"
                  }`}
                  disabled={!isAvailable}
                  onClick={() =>
                    isAvailable && handleSizeSelect(sizeOption.value)
                  }>
                  {sizeOption.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Height Range - Only for Clothing */}
      {heightRanges.length > 0 && (
        <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100'>
          <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2'>
            <Ruler className='w-4 h-4 sm:w-5 sm:h-5 text-primary' />
            Height Range
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3'>
            {heightRanges.map((range) => (
              <button
                key={range.label}
                className={`py-3 sm:py-4 px-3 sm:px-4 border-2 rounded-lg font-medium transition-all duration-200 text-center touch-manipulation ${
                  selectedHeight === range.label
                    ? "border-primary bg-primary text-primary-foreground shadow-lg"
                    : "border-gray-300 hover:border-primary/60 hover:bg-primary/5 text-gray-700 active:scale-95"
                }`}
                onClick={() => handleHeightSelect(range.label)}>
                <div className='font-semibold text-sm sm:text-base'>
                  {range.label}
                </div>
                <div className='text-xs sm:text-sm opacity-90'>
                  ({range.min}-{range.max}cm)
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footwear Size Range */}
      {sizeFrom !== undefined && sizeTo !== undefined && (
        <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100'>
          <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2'>
            <Shirt className='w-4 h-4 sm:w-5 sm:h-5 text-primary' />
            Shoe Sizes Available
          </h3>
          <div className='bg-gray-50 rounded-lg p-4'>
            <p className='text-center font-semibold text-gray-900'>
              {sizeFrom === sizeTo
                ? `Size ${sizeFrom}`
                : `Sizes ${sizeFrom} - ${sizeTo}`}
            </p>
            {shoeType && (
              <p className='text-center text-sm text-gray-600 mt-2'>
                Type: {shoeType}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Fragrance Details */}
      {volume !== undefined && (
        <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100'>
          <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2'>
            <Droplets className='w-4 h-4 sm:w-5 sm:h-5 text-primary' />
            Fragrance Details
          </h3>
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Volume:</span>
              <span className='font-semibold'>
                {volume} {volumeUnit || "ml"}
              </span>
            </div>
            {longevity && (
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Longevity:</span>
                <span className='font-semibold capitalize'>
                  {longevity.replace("-", " ")}
                </span>
              </div>
            )}
            {targetGender && (
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>For:</span>
                <span className='font-semibold capitalize'>{targetGender}</span>
              </div>
            )}
            {occasion && (
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Best For:</span>
                <span className='font-semibold capitalize'>
                  {occasion.replace("-", " ")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Accessory Details */}
      {accessoryType && (
        <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100'>
          <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2'>
            <Users className='w-4 h-4 sm:w-5 sm:h-5 text-primary' />
            Accessory Details
          </h3>
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-600'>Type:</span>
              <span className='font-semibold capitalize'>{accessoryType}</span>
            </div>
            {availableSizes.length > 0 && (
              <div>
                <span className='text-gray-600 block mb-2'>
                  Available Sizes:
                </span>
                <div className='flex gap-2 flex-wrap'>
                  {availableSizes.map((size) => (
                    <span
                      key={size}
                      className='px-3 py-1 bg-gray-100 rounded-md text-sm font-medium'>
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {jewelryType && (
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Jewelry Type:</span>
                <span className='font-semibold capitalize'>{jewelryType}</span>
              </div>
            )}
            {metalType && (
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Metal:</span>
                <span className='font-semibold capitalize'>
                  {metalType.replace("-", " ")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100'>
        <div className='flex gap-3 sm:gap-4 relative'>
          {isProductInCart ? (
            <CartSheet>
              <button className='flex-1 bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground py-3 sm:py-4 px-4 sm:px-6 rounded-lg flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation'>
                <ShoppingCart className='w-4 h-4 sm:w-5 sm:h-5' />
                <span>View Cart</span>
              </button>
            </CartSheet>
          ) : (
            <button
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-lg flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation ${
                isAddedToCart
                  ? "bg-green-600 hover:bg-green-700 active:bg-green-800 text-white"
                  : "bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground"
              }`}
              onClick={handleAddToCart}>
              {isAddedToCart ? (
                <>
                  <Check className='w-4 h-4 sm:w-5 sm:h-5' />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className='w-4 h-4 sm:w-5 sm:h-5' />
                  <span className='hidden xs:inline'>Add to Cart</span>
                  <span className='xs:hidden'>Add</span>
                </>
              )}
            </button>
          )}

          <button
            className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-lg border-2 transition-all duration-200 touch-manipulation ${
              isProductInWishlist
                ? "bg-red-50 border-red-300 text-red-600 hover:bg-red-100 active:bg-red-200"
                : "bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 active:bg-gray-200"
            }`}
            onClick={handleWishlistToggle}
            aria-label={
              isProductInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }>
            <Heart
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-200 ${
                isProductInWishlist
                  ? "fill-current scale-110"
                  : "hover:scale-110"
              }`}
            />
          </button>

          {/* Cart Confetti Effect */}
          {cartConfetti.map((emoji) => (
            <div
              key={emoji.id}
              className='absolute z-10 pointer-events-none'
              style={{
                left: "30%",
                bottom: "0",
                transform: `translate(${emoji.x}px, ${emoji.y}px) rotate(${emoji.rotation}deg) scale(${emoji.scale})`,
                opacity: emoji.opacity,
                animation: "confetti 1s ease-out forwards",
              }}>
              {emoji.emoji}
            </div>
          ))}

          {/* Wishlist Confetti Effect */}
          {wishlistConfetti.map((emoji) => (
            <div
              key={emoji.id}
              className='absolute z-10 pointer-events-none'
              style={{
                right: "12px",
                bottom: "12px",
                transform: `translate(${emoji.x}px, ${emoji.y}px) rotate(${emoji.rotation}deg) scale(${emoji.scale})`,
                opacity: emoji.opacity,
                animation: "confetti 1s ease-out forwards",
              }}>
              {emoji.emoji}
            </div>
          ))}
        </div>
      </div>

      {/* Add confetti animation style */}
      <style jsx global>{`
        @keyframes confetti {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(var(--x, 0), var(--y, -60px))
              rotate(var(--r, 360deg)) scale(var(--s, 1.5));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;
