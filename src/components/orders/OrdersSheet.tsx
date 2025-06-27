"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Package, Calendar, Truck, CheckCircle, Clock } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { AuthUser } from "@/lib/auth/types";

interface OrdersSheetProps {
  children: React.ReactNode;
  user: AuthUser | null;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  shippingAddress: {
    address: string;
    city: string;
    country: string;
  };
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return <CheckCircle className='w-4 h-4 text-green-600' />;
    case "processing":
      return <Clock className='w-4 h-4 text-yellow-600' />;
    case "shipped":
      return <Truck className='w-4 h-4 text-blue-600' />;
    case "delivered":
      return <CheckCircle className='w-4 h-4 text-green-600' />;
    default:
      return <Package className='w-4 h-4 text-gray-600' />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "text-green-700 bg-green-50 border-green-200";
    case "processing":
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "shipped":
      return "text-blue-700 bg-blue-50 border-blue-200";
    case "delivered":
      return "text-green-700 bg-green-50 border-green-200";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
};

export function OrdersSheet({ children, user }: Readonly<OrdersSheetProps>) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/orders", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.docs ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [user, fetchOrders]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderContent = () => {
    if (!user) {
      return (
        <div className='flex flex-col items-center justify-center h-64 text-center p-6'>
          <div className='w-20 h-20 rounded-2xl flex items-center justify-center mb-6'>
            <Package className='w-10 h-10 text-gray-400' />
          </div>
          <h3 className='text-xl font-bold text-gray-900 mb-3'>
            Sign in required
          </h3>
          <p className='text-gray-500 leading-relaxed mb-6'>
            Please sign in to view your order history
          </p>
          <a
            href='/login'
            className='inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer'>
            Sign In
          </a>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className='flex flex-col items-center justify-center h-64 text-center p-6'>
          <div className='w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6'></div>
          <p className='text-gray-600 font-medium'>Loading your orders...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className='flex flex-col items-center justify-center h-64 text-center p-6'>
          <div className='w-20 h-20 rounded-2xl flex items-center justify-center mb-6'>
            <Package className='w-10 h-10 text-red-500' />
          </div>
          <h3 className='text-xl font-bold text-gray-900 mb-3'>
            Error loading orders
          </h3>
          <p className='text-red-600 font-medium mb-6'>{error}</p>
          <button
            onClick={fetchOrders}
            className='inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer'>
            Try Again
          </button>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center h-64 text-center p-6'>
          <div className='w-20 h-20 rounded-2xl flex items-center justify-center mb-6'>
            <Package className='w-10 h-10 text-gray-400' />
          </div>
          <h3 className='text-xl font-bold text-gray-900 mb-3'>
            No orders yet
          </h3>
          <p className='text-gray-500 leading-relaxed'>
            Your order history will appear here once you make a purchase
          </p>
        </div>
      );
    }

    return (
      <div className='p-4'>
        <ul className='space-y-4'>
          {orders.map((order) => (
            <li
              key={order.id}
              className='bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200'>
              {/* Order Header */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  {getStatusIcon(order.status)}
                  <span
                    className={`text-sm px-3 py-2 rounded-lg font-bold border ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>
                <div className='text-right'>
                  <p className='text-lg font-bold text-gray-900'>
                    ${order.total.toFixed(2)}
                  </p>
                  <p className='text-sm text-gray-500 flex items-center gap-1'>
                    <Calendar className='w-3 h-3' />
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className='space-y-3'>
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className='flex items-center gap-3 bg-gray-50 rounded-lg p-3'>
                    <div className='relative w-12 h-12 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0'>
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
                      <h4 className='text-sm font-semibold text-gray-900 line-clamp-1'>
                        {item.name}
                      </h4>
                      <p className='text-xs text-gray-500'>
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-bold text-gray-900'>
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className='mt-4 pt-4 border-t border-gray-100'>
                  <h4 className='text-sm font-semibold text-gray-900 mb-2'>
                    Shipping Address
                  </h4>
                  <p className='text-sm text-gray-600'>
                    {order.shippingAddress.address}
                    <br />
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.country}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side='right'
        className='sm:min-w-[40vw] min-w-[95vw] bg-white p-0 overflow-y-auto border-l border-gray-200 shadow-2xl'>
        <SheetHeader className='border-b border-gray-100 py-4 px-6 bg-gradient-to-r from-gray-50 to-white'>
          <SheetTitle className='text-xl font-bold text-gray-900 flex items-center gap-3'>
            <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
              <Package className='w-4 h-4 text-primary-foreground' />
            </div>
            Order History
            {orders.length > 0 && (
              <span className='bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full'>
                {orders.length}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto'>{renderContent()}</div>
      </SheetContent>
    </Sheet>
  );
}
