"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  ArrowRight,
  ShoppingBag,
  User,
  Mail,
  Phone,
  CreditCard,
  Package,
} from "lucide-react";

interface OrderDetails {
  id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  payment: {
    method: string;
    transactionId?: string;
  };
}

export default function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order information found");
      setLoading(false);
      return;
    }

    async function fetchOrderDetails() {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(
          "Could not load order details. Please contact customer support."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    // Return null or a minimal loader here, the main loader is in the Suspense fallback
    return null;
  }

  if (error || !order) {
    return (
      <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center'>
        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
          <Package className='w-8 h-8 text-red-600' />
        </div>
        <h1 className='text-2xl font-bold text-gray-900 mb-4'>
          Order Not Found
        </h1>
        <p className='text-gray-600 mb-8 max-w-md mx-auto'>
          {error ||
            "Could not find order information. Please check your order number or contact support."}
        </p>
        <Link
          href='/'
          className='inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer'>
          <ShoppingBag className='w-5 h-5' />
          Return to Home
        </Link>
      </div>
    );
  }

  // Format payment method for display
  const paymentMethodDisplay = () => {
    switch (order.payment.method) {
      case "mpesa":
        return "M-Pesa";
      case "card":
        return "Card Payment";
      case "bank":
        return "Bank Transfer";
      default:
        return order.payment.method;
    }
  };

  return (
    <div className='space-y-8'>
      {/* Success Header */}
      <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center'>
        <div className='w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6'>
          <CheckCircle className='w-10 h-10 text-green-600' />
        </div>
        <h1 className='text-3xl font-bold text-gray-900 mb-3'>
          Order Confirmed!
        </h1>
        <p className='text-gray-600 text-lg mb-4'>
          Thank you for your purchase! Your order has been received and is being
          processed.
        </p>
        <div className='bg-gray-50 rounded-lg p-4 inline-block'>
          <p className='text-sm text-gray-600 mb-1'>Order Number</p>
          <p className='text-xl font-bold text-gray-900'>
            #{order.orderNumber}
          </p>
        </div>
        <p className='text-sm text-gray-500 mt-4'>
          A confirmation email has been sent to{" "}
          <span className='font-medium text-gray-700'>
            {order.customer.email}
          </span>
        </p>
      </div>

      {/* Order Details Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Customer & Payment Info */}
        <div className='space-y-6'>
          {/* Customer Information */}
          <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                <User className='w-5 h-5 text-purple-600' />
              </div>
              <h2 className='text-xl font-bold text-gray-900'>
                Customer Information
              </h2>
            </div>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <User className='w-4 h-4 text-gray-400' />
                <span className='text-gray-900 font-medium'>
                  {order.customer.firstName} {order.customer.lastName}
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <Mail className='w-4 h-4 text-gray-400' />
                <span className='text-gray-700'>{order.customer.email}</span>
              </div>
              <div className='flex items-center gap-3'>
                <Phone className='w-4 h-4 text-gray-400' />
                <span className='text-gray-700'>{order.customer.phone}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                <CreditCard className='w-5 h-5 text-blue-600' />
              </div>
              <h2 className='text-xl font-bold text-gray-900'>
                Payment Details
              </h2>
            </div>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Payment Method:</span>
                <span className='text-gray-900 font-medium'>
                  {paymentMethodDisplay()}
                </span>
              </div>
              {order.payment.transactionId && (
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Transaction ID:</span>
                  <span className='text-gray-900 font-mono text-sm'>
                    {order.payment.transactionId}
                  </span>
                </div>
              )}
              <div className='flex justify-between items-center pt-3 border-t border-gray-200'>
                <span className='text-gray-600'>Status:</span>
                <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800'>
                  Paid
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-6'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center'>
              <Package className='w-5 h-5 text-emerald-600' />
            </div>
            <h2 className='text-xl font-bold text-gray-900'>Order Summary</h2>
          </div>

          {/* Items */}
          <div className='space-y-4 mb-6'>
            {order.items.map((item, index) => (
              <div key={index} className='flex gap-4 p-4 bg-gray-50 rounded-lg'>
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
                  <h3 className='text-sm font-medium text-gray-900 mb-1'>
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

          {/* Totals */}
          <div className='space-y-3 pt-4 border-t border-gray-200'>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>Subtotal:</span>
              <span className='text-gray-900 font-medium'>
                ${order.subtotal.toFixed(2)}
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-600'>Shipping:</span>
              <span className='text-gray-900 font-medium'>
                ${order.shippingFee.toFixed(2)}
              </span>
            </div>
            <div className='flex justify-between text-lg font-bold pt-3 border-t border-gray-200'>
              <span className='text-gray-900'>Total:</span>
              <span className='text-gray-900'>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='bg-white rounded-xl shadow-lg border border-gray-100 p-6'>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            href='/'
            className='inline-flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer'>
            <ShoppingBag className='w-5 h-5' />
            Continue Shopping
          </Link>
          <Link
            href='/account'
            className='inline-flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer'>
            View Account
            <ArrowRight className='w-5 h-5' />
          </Link>
        </div>

        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600 mb-2'>
            Need help with your order?
          </p>
          <p className='text-sm'>
            <a
              href='mailto:support@hutofmodesty.com'
              className='text-purple-600 hover:text-purple-700 font-medium cursor-pointer'>
              Contact Support
            </a>
            {" or "}
            <a
              href='tel:+254700123456'
              className='text-purple-600 hover:text-purple-700 font-medium cursor-pointer'>
              Call Us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
