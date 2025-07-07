"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/cart/cartStore";
import {
  CheckoutForm,
  CheckoutFormData,
} from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";

export default function CheckoutPage() {
  const { items, total, itemCount } = useCartStore();
  const [customerData, setCustomerData] = useState<CheckoutFormData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Check if cart is empty
  if (items.length === 0) {
    return (
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <h1 className='text-2xl font-bold text-gray-800 mb-6'>Checkout</h1>
        <div className='bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm'>
          <p className='text-gray-500 mb-6'>Your cart is empty.</p>
          <a
            href='/'
            className='inline-block bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-semibold text-sm uppercase tracking-wider text-center transition-colors'>
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto px-4 py-4 md:py-8 bg-gray-50'>
      <h1 className='text-3xl font-bold text-gray-800 mb-8'>Checkout</h1>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6'>
          {error}
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2'>
          <CheckoutForm />
        </div>

        <div className='lg:col-span-1'>
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
