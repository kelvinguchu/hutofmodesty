import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/cart/cartStore";
import { useWishlistStore } from "@/lib/wishlist/wishlistStore";
import { normalizeMediaURL } from "@/lib/utils";

// Updated interface to match our new collection structure
interface Product {
  id: string;
  name: string;
  price: number;
  mainImage?:
    | {
        url: string;
      }
    | string; // Can be Media object or string
  category?:
    | {
        id: string;
        name: string;
        slug: string;
      }
    | string; // Can be Category object or string
}

interface RelatedProductsProps {
  products: Product[];
  currentProductId: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({
  products,
  currentProductId,
}) => {
  const { addItem: addToCart, isInCart } = useCartStore();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();

  // Filter out the current product
  const relatedProducts = products.filter(
    (product) => product.id !== currentProductId
  );

  if (relatedProducts.length === 0) {
    return null;
  }

  // Helper function to get image URL
  const getImageUrl = (mainImage: Product["mainImage"]): string | undefined => {
    if (!mainImage) return undefined;

    if (typeof mainImage === "string") {
      return normalizeMediaURL(mainImage) || mainImage;
    }

    if (typeof mainImage === "object" && "url" in mainImage && mainImage.url) {
      return normalizeMediaURL(mainImage.url) || mainImage.url;
    }

    return undefined;
  };

  // Helper function to get category info
  const getCategoryInfo = (
    category: Product["category"]
  ): { name: string; slug: string } | null => {
    if (!category) return null;

    if (
      typeof category === "object" &&
      "name" in category &&
      "slug" in category
    ) {
      return { name: category.name, slug: category.slug };
    }

    return null;
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: getImageUrl(product.mainImage),
    });
  };

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: getImageUrl(product.mainImage),
      });
    }
  };

  const isProductInCart = (productId: string) => {
    return isInCart(productId);
  };

  return (
    <div className='bg-white py-8 sm:py-12 lg:py-16'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-6 sm:mb-8 lg:mb-12'>
          <h2 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3'>
            You Might Also Like
          </h2>
          <div className='w-16 sm:w-20 lg:w-24 h-0.5 bg-primary mx-auto'></div>
        </div>

        {/* Products Grid */}
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'>
          {relatedProducts.slice(0, 8).map((product) => {
            const imageUrl = getImageUrl(product.mainImage);
            const categoryInfo = getCategoryInfo(product.category);

            return (
              <div
                key={product.id}
                className='group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden'>
                {/* Product Image */}
                <Link href={`/products/${product.id}`} className='block'>
                  <div className='aspect-[3/4] sm:aspect-[4/5] relative overflow-hidden bg-gray-100'>
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className='object-cover group-hover:scale-[1.02] transition-transform duration-300'
                        sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
                      />
                    ) : (
                      <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                        <span className='text-gray-400 text-xs sm:text-sm'>
                          No Image
                        </span>
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleWishlistToggle(product);
                      }}
                      className={`absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 touch-manipulation ${
                        isInWishlist(product.id)
                          ? "bg-red-100 text-red-600 hover:bg-red-200 active:bg-red-300"
                          : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-600 active:bg-gray-100"
                      } backdrop-blur-sm shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1`}
                      aria-label={
                        isInWishlist(product.id)
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }>
                      <Heart
                        className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-200 ${
                          isInWishlist(product.id)
                            ? "fill-current scale-110"
                            : "hover:scale-110"
                        }`}
                      />
                    </button>
                  </div>
                </Link>

                {/* Product Info */}
                <div className='p-3 sm:p-4 space-y-2 sm:space-y-3'>
                  {/* Category */}
                  {categoryInfo && (
                    <Link
                      href={`/collections/${categoryInfo.slug}`}
                      className='inline-block text-xs text-primary hover:text-primary/80 font-medium transition-colors duration-200'>
                      {categoryInfo.name}
                    </Link>
                  )}

                  {/* Product Name */}
                  <Link href={`/products/${product.id}`}>
                    <h3 className='text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 hover:text-primary transition-colors duration-200 leading-tight'>
                      {product.name}
                    </h3>
                  </Link>

                  {/* Price */}
                  <p className='text-base sm:text-lg font-bold text-primary'>
                    ${product.price.toFixed(2)}
                  </p>

                  {/* Add to Cart Button */}
                  {isProductInCart(product.id) ? (
                    <Link href='/checkout'>
                      <button className='w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation'>
                        <ShoppingCart className='w-3 h-3 sm:w-4 sm:h-4' />
                        <span>View Cart</span>
                      </button>
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(product)}
                      className='w-full bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1'>
                      <ShoppingCart className='w-3 h-3 sm:w-4 sm:h-4' />
                      <span className='hidden xs:inline'>Add to Cart</span>
                      <span className='xs:hidden'>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* View More Link */}
        {relatedProducts.length > 8 && (
          <div className='text-center mt-6 sm:mt-8 lg:mt-12'>
            <Link
              href='/collections'
              className='inline-flex items-center gap-2 bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'>
              <span className='text-sm sm:text-base'>View More Products</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatedProducts;
