"use client";

import React from "react";
import Image from "next/image";
import { Package, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";

export function OrderSummary() {
  const { items, itemCount, total } = useCart();
  const shippingFee = 2.5; // Fixed shipping fee in USD
  const finalTotal = total + shippingFee;

  return (
    <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-6'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center'>
          <Package className='w-5 h-5 text-emerald-600' />
        </div>
        <h2 className='text-xl font-bold text-gray-900'>Order Summary</h2>
      </div>

      {items.length === 0 ? (
        <div className='text-center py-8'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <ShoppingCart className='w-8 h-8 text-gray-400' />
          </div>
          <p className='text-gray-500 font-medium'>Your cart is empty</p>
          <p className='text-sm text-gray-400 mt-1'>
            Add some items to get started
          </p>
        </div>
      ) : (
        <div className='space-y-6'>
          {/* Items List */}
          <div className='space-y-4'>
            {items.map((item) => (
              <div
                key={item.id}
                className='flex gap-4 p-4 bg-gray-50 rounded-lg'>
                <div className='relative w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 shadow-sm'>
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
                  <h3 className='text-sm font-medium text-gray-900 mb-1 line-clamp-2'>
                    {item.name}
                  </h3>
                  <div className='flex justify-between items-center'>
                    <p className='text-sm text-gray-600'>
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                    <p className='text-sm font-bold text-gray-900'>
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Totals */}
          <div className='space-y-3 pt-4 border-t border-gray-200'>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>
                Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
              <span className='text-gray-900 font-medium'>
                ${total.toFixed(2)}
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>Shipping</span>
              <span className='text-gray-900 font-medium'>
                ${shippingFee.toFixed(2)}
              </span>
            </div>
            <div className='flex justify-between text-lg font-bold pt-3 border-t border-gray-200'>
              <span className='text-gray-900'>Total</span>
              <span className='text-gray-900'>${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Items Count Badge */}
          <div className='bg-purple-50 rounded-lg p-3 text-center'>
            <p className='text-sm text-purple-700'>
              <span className='font-bold'>{itemCount}</span>{" "}
              {itemCount === 1 ? "item" : "items"} in your order
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
