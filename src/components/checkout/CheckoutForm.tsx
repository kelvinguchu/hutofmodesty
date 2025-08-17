"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Loader2,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { useCartStore } from "@/lib/cart/cartStore";
import { OrderSummary } from "@/components/checkout/OrderSummary";

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });
  const [formValid, setFormValid] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [originalFormData, setOriginalFormData] =
    useState<CheckoutFormData | null>(null);

  const finalTotal = total;

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch("/api/users/profile", {
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          const userFormData = {
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.savedShippingAddress?.address || "",
            city: userData.savedShippingAddress?.city || "",
          };
          setFormData(userFormData);
          setOriginalFormData(userFormData);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setIsLoadingUserData(false);
      }
    };

    loadUserData();
  }, []);

  const updateUserProfile = async (formData: CheckoutFormData) => {
    try {
      await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: "Kenya",
          postalCode: "",
        }),
      });
    } catch (error) {
      console.error("Failed to update user profile:", error);
    }
  };

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
      formData.city.trim() !== "";

    setFormValid(isValid);
  }, [formData]);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  // Reset payment state
  const resetPaymentState = () => {
    setPaymentError(null);
    setPaymentSuccess(null);
    setIsProcessing(false);
  };

  // Handle payment initiation
  const handlePayment = async () => {
    if (!formValid) {
      setPaymentError("Please fill in all required fields");
      return;
    }

    // If there's an error, reset and try again
    if (paymentError) {
      resetPaymentState();
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);
    setPaymentSuccess(null);

    try {
      const paymentData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phone,
        amount: finalTotal,
        apiRef: `order_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        host: window.location.origin,
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setPaymentSuccess(result.message || "Payment initiated successfully");

        // Extract invoice_id from the response structure
        const invoiceId =
          result.data.invoice?.invoice_id ||
          result.data.invoice?.id ||
          result.data.id;

        // Start polling for payment status
        if (invoiceId) {
          startPaymentStatusPolling(invoiceId);
        } else {
          setPaymentError("Failed to get payment reference. Please try again.");
          setIsProcessing(false);
        }
      } else {
        setPaymentError(result.message || "Failed to initiate payment");
        setIsProcessing(false);
      }
    } catch (error) {
      setPaymentError("An unexpected error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  // Poll payment status
  const startPaymentStatusPolling = async (invoiceId: string) => {
    // Clear any existing polling interval
    if (pollInterval) {
      clearInterval(pollInterval);
    }

    const maxAttempts = 30; // Poll for up to 5 minutes (30 * 10 seconds)
    const maxConsecutiveFailures = 5; // Stop after 5 consecutive failures
    let attempts = 0;
    let consecutiveFailures = 0;

    const newPollInterval = setInterval(async () => {
      attempts++;

      try {
        // Call the API route instead of direct function call
        const response = await fetch("/api/payment-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ invoiceId }),
        });

        const statusResponse = await response.json();

        if (statusResponse.success && statusResponse.data) {
          consecutiveFailures = 0; // Reset failure counter on success

          // Extract status from the correct nested structure
          const invoice = statusResponse.data.invoice;
          const status = invoice?.state || invoice?.status;

          if (
            status === "COMPLETE" ||
            status === "PAID" ||
            status === "SUCCESS" ||
            status === "COMPLETED"
          ) {
            clearInterval(newPollInterval);
            setPollInterval(null);
            await handlePaymentSuccess(statusResponse.data);
          } else if (
            status === "FAILED" ||
            status === "CANCELLED" ||
            status === "EXPIRED" ||
            status === "REJECTED"
          ) {
            clearInterval(newPollInterval);
            setPollInterval(null);
            setPaymentError(
              `Payment ${status.toLowerCase()}. Please try again.`
            );
            setIsProcessing(false);
          } else if (status === "PENDING" || status === "PROCESSING") {
            // Continue polling for pending/processing statuses
          } else if (attempts >= maxAttempts) {
            clearInterval(newPollInterval);
            setPollInterval(null);
            setPaymentError(
              "Payment status check timed out. Please contact support if payment was deducted."
            );
            setIsProcessing(false);
          } else {
            // Continue polling for unknown statuses
          }
          // Continue polling for other statuses (PENDING, PROCESSING, etc.)
        } else {
          consecutiveFailures++;

          // Check if we should stop polling due to specific error types
          const shouldStopPolling = statusResponse.data?.shouldStopPolling;
          const isAuthError = statusResponse.data?.isAuthError;

          if (shouldStopPolling || isAuthError) {
            clearInterval(newPollInterval);
            setPollInterval(null);
            setPaymentError(
              "Authentication error while checking payment status. Payment may have been processed. Please contact support to verify."
            );
            setIsProcessing(false);
            return;
          }

          // Stop polling after too many consecutive failures or max attempts
          if (
            consecutiveFailures >= maxConsecutiveFailures ||
            attempts >= maxAttempts
          ) {
            clearInterval(newPollInterval);
            setPollInterval(null);
            setPaymentError(
              "Unable to verify payment status after multiple attempts. Please contact support if payment was deducted."
            );
            setIsProcessing(false);
          }
        }
      } catch (error) {
        consecutiveFailures++;

        if (
          consecutiveFailures >= maxConsecutiveFailures ||
          attempts >= maxAttempts
        ) {
          clearInterval(newPollInterval);
          setPollInterval(null);
          setPaymentError(
            "Unable to verify payment status due to technical issues. Please contact support if payment was deducted."
          );
          setIsProcessing(false);
        }
      }
    }, 10000); // Poll every 10 seconds

    // Store the interval reference
    setPollInterval(newPollInterval);
  };

  // Handle successful payment
  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      // Extract transaction details from the nested structure
      const invoice = paymentData.invoice;
      const transactionId = invoice?.invoice_id || invoice?.id;
      const paymentMethod = invoice?.provider?.toLowerCase() || "mpesa";

      const orderData = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          country: "Kenya",
          postalCode: "",
        },
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        subtotal: total,
        shippingFee: 0,
        total: finalTotal,
        payment: {
          method: paymentMethod,
          transactionId: transactionId,
          status: "complete",
          details: paymentData,
        },
        status: "paid",
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create order: ${response.status} - ${errorText}`
        );
      }

      const order = await response.json();

      // Update user profile if data has changed
      if (
        originalFormData &&
        JSON.stringify(formData) !== JSON.stringify(originalFormData)
      ) {
        await updateUserProfile(formData);
      }

      // Clear cart and redirect to confirmation page
      clearCart();
      router.push(`/checkout/confirmation?order=${order.id}`);
    } catch (error) {
      setPaymentError(
        "Payment received but failed to create order. Please contact support."
      );
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePayment();
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-8'>
      {/* Customer Information Section */}
      <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-6'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
            <User className='w-5 h-5 text-primary' />
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
                className='w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white'
                placeholder='John'
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
                className='w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white'
                placeholder='Doe'
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
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white'
                placeholder='john.doe@example.com'
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
                className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white'
                placeholder='+254712345678'
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Information Section */}
      <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-6'>
        <div className='flex items-center gap-3 mb-6'>
          <div className='w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center'>
            <MapPin className='w-5 h-5 text-emerald-600' />
          </div>
          <h2 className='text-xl font-bold text-gray-900'>
            Delivery Information
          </h2>
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
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white'
              placeholder='123 Main St'
              required
            />
          </div>

          <div>
            <label
              htmlFor='city'
              className='block text-sm font-semibold text-gray-700 mb-2'>
              City/Town*
            </label>
            <input
              type='text'
              id='city'
              name='city'
              value={formData.city}
              onChange={handleChange}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white'
              placeholder='Nairobi'
              required
            />
          </div>

          <div className='bg-gray-50 rounded-lg p-4'>
            <div className='flex items-center gap-3'>
              <MapPin className='w-5 h-5 text-gray-600' />
              <div>
                <p className='font-medium text-gray-900'>Country: Kenya</p>
              </div>
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
                KES {finalTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {isProcessing ? (
          <div className='text-center py-8'>
            <Loader2 className='w-8 h-8 animate-spin text-primary mx-auto mb-4' />
            <p className='text-lg font-medium text-gray-900'>
              {paymentSuccess
                ? "Verifying your payment..."
                : "Processing your payment..."}
            </p>
            <p className='text-sm text-gray-600 mt-2'>
              {paymentSuccess
                ? "Please wait while we confirm your M-Pesa payment"
                : "Please check your phone for M-Pesa prompt"}
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            <button
              type='submit'
              disabled={!formValid && !paymentError}
              className={`w-full py-4 cursor-pointer px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                paymentError
                  ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                  : paymentSuccess
                    ? "bg-green-500 text-white cursor-not-allowed"
                    : formValid
                      ? "bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl text-white"
                      : "bg-gray-300 cursor-not-allowed text-gray-500"
              }`}>
              {paymentError ? (
                <div className='flex items-center gap-2'>
                  <RefreshCw className='w-4 h-4' />
                  Try Again - {paymentError}
                </div>
              ) : paymentSuccess ? (
                <div className='flex items-center gap-2'>
                  <CheckCircle className='w-4 h-4' />
                  {paymentSuccess}
                </div>
              ) : (
                <>Pay with M-Pesa - KES {finalTotal.toFixed(2)}</>
              )}
            </button>

            {!formValid && !paymentError && !paymentSuccess && (
              <div className='bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-center'>
                <p className='text-sm font-medium'>
                  Please fill in all required fields to enable payment
                </p>
              </div>
            )}

            {!paymentError && !paymentSuccess && (
              <div className='text-center text-sm text-gray-500'>
                <p>You will receive an M-Pesa prompt on your phone</p>
                <p>Enter your M-Pesa PIN to complete the payment</p>
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
