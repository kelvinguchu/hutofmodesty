"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Trash2,
  ShoppingBag,
  Heart,
  Check,
  AlertCircle,
  User,
} from "lucide-react";
import { useWishlistWithSync } from "@/hooks/useWishlistWithSync";
import { useCartWithSync } from "@/hooks/useCartWithSync";
import { useUserDataSync } from "@/hooks/useAuthSync";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { AuthUser } from "@/lib/auth/types";

interface WishlistSheetProps {
  children: React.ReactNode;
  user?: AuthUser | null;
  isAuthenticated?: boolean;
}

export function WishlistSheet({
  children,
  user,
  isAuthenticated,
}: WishlistSheetProps) {
  const { items, removeItem, clearWishlist } = useWishlistWithSync({
    isAuthenticated: !!isAuthenticated,
  });
  const { isInCart, addItem: addToCart } = useCartWithSync({
    isAuthenticated: !!isAuthenticated,
  });
  const { clearWishlistData } = useUserDataSync();
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  // Check if an item is already in the cart
  // isInCart function is now available directly from useCartStore

  const handleAddToCart = async (item: any) => {
    // Only add if not already in cart
    if (!isInCart(item.id)) {
      try {
        await addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.image,
        });

        // Show added indicator
        setAddedItems((prev) => ({ ...prev, [item.id]: true }));

        // Reset after 2 seconds
        setTimeout(() => {
          setAddedItems((prev) => ({ ...prev, [item.id]: false }));
        }, 2000);
      } catch (error) {
        console.error("Failed to add item to cart:", error);
      }
    }
  };

  const handleClearWishlist = async () => {
    if (isAuthenticated && user) {
      // Clear both local and server wishlist data for authenticated users
      await clearWishlistData();
    } else {
      // Clear only local wishlist data for guest users
      clearWishlist();
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side='right'
        className='sm:min-w-[40vw] min-w-[95vw] bg-white p-0 overflow-y-auto border-l border-gray-200 shadow-2xl'>
        <SheetHeader className='border-b border-gray-100 py-4 px-6 bg-gradient-to-r from-gray-50 to-white'>
          <div className='flex items-center justify-between'>
            <SheetTitle className='text-xl font-bold text-gray-900 flex items-center gap-3'>
              <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
                <Heart className='w-4 h-4 text-primary-foreground' />
              </div>
              My Wishlist
              {items.length > 0 && (
                <span className='bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full'>
                  {items.length}
                </span>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto'>
          {items.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-64 text-center p-8'>
              <div className='w-20 h-20 rounded-2xl flex items-center justify-center mb-6 '>
                <Heart className='w-10 h-10 text-gray-400' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>
                Your wishlist is empty
              </h3>
              <p className='text-gray-500 text-sm mb-6 leading-relaxed'>
                Items added to your wishlist will appear here.
                <br />
                Start browsing to find your favorites!
              </p>
            </div>
          ) : (
            <div className='p-4'>
              <ul className='space-y-4'>
                {items.map((item) => (
                  <li
                    key={item.id}
                    className='bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200'>
                    <div className='flex gap-4'>
                      <div className='relative w-20 h-20 bg-gray-50 overflow-hidden rounded-lg flex-shrink-0 border border-gray-100'>
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className='object-cover'
                          />
                        )}
                      </div>
                      <div className='flex-grow min-w-0'>
                        <h3 className='text-sm font-semibold text-gray-900 line-clamp-2 mb-1'>
                          <Link
                            href={`/products/${item.id}`}
                            className='hover:text-primary transition-colors cursor-pointer'>
                            {item.name}
                          </Link>
                        </h3>
                        <p className='text-lg font-bold text-gray-900 mb-2'>
                          KES {item.price.toFixed(2)}
                        </p>

                        {isInCart(item.id) && (
                          <div className='bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3'>
                            <p className='text-xs text-amber-700 flex items-center'>
                              <AlertCircle className='w-3 h-3 mr-1' />
                              Already in your cart
                            </p>
                          </div>
                        )}

                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={isInCart(item.id)}
                            className={`flex items-center text-xs px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                              addedItems[item.id]
                                ? "bg-green-500 text-white shadow-md"
                                : isInCart(item.id)
                                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg"
                            }`}>
                            {addedItems[item.id] ? (
                              <>
                                <Check className='w-3 h-3 mr-2' />
                                Added to Cart
                              </>
                            ) : isInCart(item.id) ? (
                              <>
                                <Check className='w-3 h-3 mr-2' />
                                In Cart
                              </>
                            ) : (
                              <>
                                <ShoppingBag className='w-3 h-3 mr-2' />
                                Add to Cart
                              </>
                            )}
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await removeItem(item.id);
                              } catch (error) {
                                console.error("Failed to remove item:", error);
                              }
                            }}
                            className='flex items-center text-xs text-gray-500 hover:text-red-500 transition-colors cursor-pointer bg-gray-50 hover:bg-red-50 px-3 py-2 rounded-lg'>
                            <Trash2 className='w-3 h-3 mr-1' />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className='border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6'>
            {!isAuthenticated && (
              <div className='bg-primary/5 rounded-xl border border-primary/10 p-4 mb-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0'>
                    <User className='w-4 h-4 text-primary-foreground' />
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-900 mb-1'>
                      Keep your wishlist saved
                    </p>
                    <Link
                      href='/login'
                      className='text-sm text-primary hover:text-primary/80 font-medium cursor-pointer'>
                      Sign in now →
                    </Link>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleClearWishlist}
              className='w-full bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold text-sm uppercase tracking-wider text-center transition-all duration-200 flex items-center justify-center gap-2 py-3 px-4 shadow-md hover:shadow-lg cursor-pointer'>
              <X className='w-4 h-4' />
              Clear Wishlist
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
