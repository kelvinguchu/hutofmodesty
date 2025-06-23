"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, MapPin, CreditCard, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { useExchangeRate } from "@/hooks/useExchangeRate";

// Declare IntaSend types to match the JS SDK
declare global {
  interface Window {
    IntaSend: any;
  }
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const {
    exchangeRate,
    isLoading: isExchangeLoading,
  } = useExchangeRate();
  const paymentButtonRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Kenya",
    postalCode: "",
  });
  const [formValid, setFormValid] = useState(false);

  // Fixed shipping fee in USD
  const shippingFee = 2.5;
  const finalTotal = total + shippingFee;
  // Convert final total to KES using real-time exchange rate with proper currency rounding
  // Round to 2 decimal places for currency
  const finalAmountInKES = Math.round(finalTotal * exchangeRate * 100) / 100;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Check form validity whenever form data changes
  useEffect(() => {
    const isValid =
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.address.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.country.trim() !== "" &&
      formData.postalCode.trim() !== "";

    setFormValid(isValid);

    // If we already have the pay button loaded, update its disabled state
    if (paymentButtonRef.current && paymentButtonRef.current.firstChild) {
      const payButton = paymentButtonRef.current
        .firstChild as HTMLButtonElement;
      payButton.disabled = !isValid;

      // Update button styling based on validity
      if (isValid) {
        payButton.style.backgroundColor = "#7c3aed";
        payButton.style.cursor = "pointer";
        payButton.style.opacity = "1";
      } else {
        payButton.style.backgroundColor = "#d1d5db";
        payButton.style.cursor = "not-allowed";
        payButton.style.opacity = "0.7";
      }
    }
  }, [formData]);

  // Load IntaSend script
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://unpkg.com/intasend-inlinejs-sdk@3.0.3/build/intasend-inline.js";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Initialize IntaSend when script is loaded and form is valid
  useEffect(() => {
    if (!isScriptLoaded || !paymentButtonRef.current) return;

    // Clear any existing buttons first
    if (paymentButtonRef.current.firstChild) {
      paymentButtonRef.current.innerHTML = "";
    }

    // Create the button element
    const button = document.createElement("button");
    button.className = "intaSendPayButton";
    button.setAttribute("data-amount", finalAmountInKES.toString());
    button.setAttribute("data-currency", "KES");
    button.setAttribute("data-email", formData.email || "customer@example.com");
    button.setAttribute("data-first_name", formData.firstName || "Customer");
    button.setAttribute("data-last_name", formData.lastName || "");
    button.setAttribute("data-phone_number", formData.phone);
    button.setAttribute(
      "data-country",
      (formData.country || "Kenya").substring(0, 2).toUpperCase()
    );
    button.textContent = "Pay Now";

    // Initially disable the button if form is not valid
    button.disabled = !formValid;

    // Style the button to match our design
    button.style.width = "100%";
    button.style.marginTop = "0";
    button.style.padding = "0.75rem 1.5rem";
    button.style.backgroundColor = formValid ? "#7c3aed" : "#d1d5db";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "0.5rem";
    button.style.fontFamily = "system-ui, sans-serif";
    button.style.fontWeight = "600";
    button.style.fontSize = "1rem";
    button.style.cursor = formValid ? "pointer" : "not-allowed";
    button.style.opacity = formValid ? "1" : "0.7";
    button.style.transition = "all 0.2s ease";
    button.style.boxShadow = formValid
      ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      : "none";

    // Append button to container
    paymentButtonRef.current.appendChild(button);

    // Initialize IntaSend
    const intaSend = new window.IntaSend({
      publicAPIKey: process.env.NEXT_PUBLIC_INTASEND_PUBLIC_KEY,
      live: false,
    });

    intaSend
      .on("COMPLETE", async (results: any) => {
        setIsProcessing(true);

        try {
          // Create the order after successful payment
          const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customer: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
              },
              shippingAddress: {
                address: formData.address,
                city: formData.city,
                country: formData.country,
                postalCode: formData.postalCode,
              },
              items: items.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
              })),
              subtotal: total,
              shippingFee,
              total: finalTotal,
              payment: {
                method: results.method ?? "card",
                transactionId: results.transactionId ?? results.id,
                status: "complete",
                details: results,
              },
              status: "paid",
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to create order");
          }

          const order = await response.json();

          // Clear cart and redirect to confirmation page
          clearCart();
          router.push(`/checkout/confirmation?order=${order.id}`);
        } catch (error) {
          console.error("Error creating order:", error);
          setPaymentError(
            "Payment received but failed to create order. Please contact support."
          );
          setIsProcessing(false);
        }
      })
      .on("FAILED", (results: any) => {
        console.error("Payment failed", results);
        setPaymentError(
          "Payment failed. Please try again or use a different payment method."
        );
      })
      .on("IN-PROGRESS", (results: any) => {
        setIsProcessing(true);
      });
  }, [
    isScriptLoaded,
    formData,
    finalAmountInKES,
    router,
    clearCart,
    total,
    finalTotal,
    shippingFee,
    items,
    formValid,
    exchangeRate,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission is handled by the IntaSend payment button
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-8'>
      {/* Customer Information Section */}
      <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-6'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
            <User className='w-5 h-5 text-purple-600' />
          </div>
          <h2 className='text-xl font-bold text-gray-900'>
            Customer Information
          </h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label
              htmlFor='firstName'
              className='block text-sm font-semibold text-gray-700 mb-2'>
              First Name*
            </label>
            <div className='relative'>
              <input
                type='text'
                id='firstName'
                name='firstName'
                value={formData.firstName}
                onChange={handleChange}
                className='w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white'
                placeholder='Enter your first name'
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor='lastName'
              className='block text-sm font-semibold text-gray-700 mb-2'>
              Last Name*
            </label>
            <div className='relative'>
              <input
                type='text'
                id='lastName'
                name='lastName'
                value={formData.lastName}
                onChange={handleChange}
                className='w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white'
                placeholder='Enter your last name'
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor='email'
              className='block text-sm font-semibold text-gray-700 mb-2'>
              Email Address*
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Mail className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white'
                placeholder='Enter your email'
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor='phone'
              className='block text-sm font-semibold text-gray-700 mb-2'>
              Phone Number*
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Phone className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='tel'
                id='phone'
                name='phone'
                value={formData.phone}
                onChange={handleChange}
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white'
                placeholder='Enter your phone number'
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address Section */}
      <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-6'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center'>
            <MapPin className='w-5 h-5 text-emerald-600' />
          </div>
          <h2 className='text-xl font-bold text-gray-900'>Shipping Address</h2>
        </div>

        <div className='space-y-6'>
          <div>
            <label
              htmlFor='address'
              className='block text-sm font-semibold text-gray-700 mb-2'>
              Street Address*
            </label>
            <input
              type='text'
              id='address'
              name='address'
              value={formData.address}
              onChange={handleChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white'
              placeholder='Enter your street address'
              required
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <label
                htmlFor='city'
                className='block text-sm font-semibold text-gray-700 mb-2'>
                City*
              </label>
              <input
                type='text'
                id='city'
                name='city'
                value={formData.city}
                onChange={handleChange}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white'
                placeholder='Enter your city'
                required
              />
            </div>

            <div>
              <label
                htmlFor='postalCode'
                className='block text-sm font-semibold text-gray-700 mb-2'>
                Postal Code*
              </label>
              <input
                type='text'
                id='postalCode'
                name='postalCode'
                value={formData.postalCode}
                onChange={handleChange}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white'
                placeholder='Enter postal code'
                required
              />
            </div>

            <div>
              <label
                htmlFor='country'
                className='block text-sm font-semibold text-gray-700 mb-2'>
                Country*
              </label>
              <select
                id='country'
                name='country'
                value={formData.country}
                onChange={handleChange}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white'
                required>
                <option value='Kenya'>Kenya</option>
                <option value='Uganda'>Uganda</option>
                <option value='Tanzania'>Tanzania</option>
                <option value='Rwanda'>Rwanda</option>
                <option value='Ethiopia'>Ethiopia</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Show order summary on mobile devices before payment section */}
      <div className='lg:hidden'>
        <OrderSummary />
      </div>

      {/* Payment Section */}
      <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-6'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
            <CreditCard className='w-5 h-5 text-blue-600' />
          </div>
          <h2 className='text-xl font-bold text-gray-900'>Payment</h2>
        </div>

        <div className='bg-gray-50 rounded-lg p-4 mb-6'>
          <div className='text-sm text-gray-700 space-y-2'>
            <div className='flex justify-between items-center'>
              <span className='font-medium'>Total Amount:</span>
              <span className='font-bold text-lg'>
                KES {finalAmountInKES.toFixed(2)} (${finalTotal.toFixed(2)})
              </span>
            </div>
            {!isExchangeLoading && (
              <div className='text-xs text-gray-500'>
                Exchange Rate: 1 USD = {exchangeRate.toFixed(2)} KES
              </div>
            )}
          </div>
        </div>

        {paymentError && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2'>
            <div className='w-2 h-2 bg-red-500 rounded-full'></div>
            {paymentError}
          </div>
        )}

        {isProcessing ? (
          <div className='text-center py-8'>
            <Loader2 className='w-8 h-8 animate-spin text-purple-600 mx-auto mb-4' />
            <p className='text-lg font-medium text-gray-900'>
              Processing your payment...
            </p>
            <p className='text-sm text-gray-600 mt-2'>
              Please do not close this window
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            <div ref={paymentButtonRef} className='w-full'>
              {!isScriptLoaded && (
                <div className='text-center py-8'>
                  <Loader2 className='w-8 h-8 animate-spin text-purple-600 mx-auto mb-4' />
                  <p className='text-lg font-medium text-gray-900'>
                    Loading payment options...
                  </p>
                </div>
              )}
            </div>

            {!formValid && (
              <div className='bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-center'>
                <p className='text-sm font-medium'>
                  Please fill in all required fields to enable payment
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
