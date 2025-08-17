"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartWithSync } from "@/hooks/useCartWithSync";
import { useUserDataSync } from "@/hooks/useAuthSync";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { AuthUser } from "@/lib/auth/types";

interface CartSheetProps {
  children: React.ReactNode;
  user?: AuthUser | null;
  isAuthenticated?: boolean;
}

export function CartSheet({ children, user, isAuthenticated }: CartSheetProps) {
  const [open, setOpen] = useState(false);
  const { items, itemCount, total, removeItem, updateQuantity, clearCart } =
    useCartWithSync({ isAuthenticated: !!isAuthenticated });
  const { clearCartData } = useUserDataSync();

  const handleIncreaseQuantity = async (
    id: string,
    currentQuantity: number
  ) => {
    try {
      await updateQuantity(id, currentQuantity + 1);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleDecreaseQuantity = async (
    id: string,
    currentQuantity: number
  ) => {
    try {
      if (currentQuantity > 1) {
        await updateQuantity(id, currentQuantity - 1);
      } else {
        await removeItem(id);
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleCheckout = () => {
    setOpen(false);
  };

  const handleClearCart = async () => {
    if (isAuthenticated && user) {
      await clearCartData();
    } else {
      clearCart();
    }
  };

  const getCheckoutUrl = () => {
    if (!isAuthenticated || !user) {
      return `/login?redirect=${encodeURIComponent("/checkout")}`;
    }
    return "/checkout";
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side='right'
        className='sm:min-w-[40vw] min-w-[95vw] bg-white p-0 overflow-y-auto flex flex-col border-l border-gray-200 shadow-2xl'>
        <SheetHeader className='border-b border-gray-100 py-4 px-6 bg-gradient-to-r from-gray-50 to-white'>
          <div className='flex items-center justify-between'>
            <SheetTitle className='text-xl font-bold text-gray-900 flex items-center gap-3'>
              <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
                <ShoppingBag className='w-4 h-4 text-primary-foreground' />
              </div>
              Shopping Cart
              {itemCount > 0 && (
                <span className='bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full'>
                  {itemCount}
                </span>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto'>
          {items.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-64 text-center p-8'>
              <div className='w-20 h-20 rounded-2xl flex items-center justify-center mb-6 '>
                <ShoppingBag className='w-10 h-10 text-gray-400' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-3'>
                Your cart is empty
              </h3>
              <p className='text-gray-500 text-sm leading-relaxed'>
                Items added to your cart will appear here.
                <br />
                Start shopping to fill it up!
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
                        <p className='text-lg font-bold text-gray-900 mb-3'>
                          KES{item.price.toFixed(2)}
                        </p>

                        <div className='flex items-center justify-between'>
                          <div className='flex items-center bg-gray-50 rounded-lg border border-gray-200'>
                            <button
                              onClick={() =>
                                handleDecreaseQuantity(item.id, item.quantity)
                              }
                              className='p-2 text-gray-600 hover:text-primary hover:bg-primary/5 transition-all duration-200 rounded-l-lg cursor-pointer'>
                              <Minus className='w-4 h-4' />
                            </button>
                            <span className='px-4 py-2 text-sm font-semibold min-w-[40px] text-center bg-white border-x border-gray-200'>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleIncreaseQuantity(item.id, item.quantity)
                              }
                              className='p-2 text-gray-600 hover:text-primary hover:bg-primary/5 transition-all duration-200 rounded-r-lg cursor-pointer'>
                              <Plus className='w-4 h-4' />
                            </button>
                          </div>
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
                        <div className='mt-3 pt-3 border-t border-gray-100'>
                          <p className='text-sm text-right text-gray-600'>
                            Subtotal:{" "}
                            <span className='font-semibold text-gray-900'>
                              KES {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </p>
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
            <div className='bg-white rounded-xl border border-gray-100 p-4 mb-4'>
              <div className='flex justify-between items-center mb-2'>
                <span className='text-lg font-semibold text-gray-900'>
                  Total
                </span>
                <div className='text-right'>
                  <span className='text-2xl font-bold text-gray-900'>
                    KES {total.toFixed(2)}
                  </span>
                  <p className='text-xs text-gray-500'>
                    Shipping & taxes calculated at checkout
                  </p>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <button
                onClick={handleClearCart}
                className='text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer'>
                <X className='w-4 h-4 mr-2' />
                Clear Cart
              </button>
              <Link
                href={getCheckoutUrl()}
                onClick={handleCheckout}
                className='flex-1 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider text-center transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer'>
                <ShoppingBag className='h-4 w-4' />
                {isAuthenticated && user ? "Checkout" : "Continue"}
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
