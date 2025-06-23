"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingBag, Home, Grid } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { useWishlistStore } from "@/lib/wishlist/wishlistStore";
import { WishlistSheet } from "@/components/wishlist/WishlistSheet";
import { CartSheet } from "@/components/cart/CartSheet";
import { UserButton } from "@/components/auth/UserButton";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { CategoryUI } from "@/types/navigation";

interface MobileNavProps {
  categories: CategoryUI[];
}

export default function MobileNav({ categories }: Readonly<MobileNavProps>) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount } = useCart();
  const wishlistCount = useWishlistStore((state) => state.itemCount);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Function to handle search UI
  const handleSearchClick = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <>
      <header
        className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 md:hidden
        ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50" : "bg-white border-b border-gray-100"}`}>
        <div className='max-w-[100%] mx-auto px-4'>
          {/* Main Navbar */}
          <div className='flex items-center justify-between h-14'>
            {/* Logo */}
            <Link href='/' className='relative z-10 group'>
              <div className='flex items-center'>
                <span className='text-xl font-black text-gray-900 tracking-tight group-hover:text-purple-600 transition-colors duration-200'>
                  Hut of Modesty
                </span>
                <div className='ml-2 h-4 w-4 flex items-center justify-center'>
                  <div className='h-2 w-2 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full animate-pulse shadow-sm'></div>
                </div>
              </div>
            </Link>

            {/* Mobile Account Icon */}
            <div className='bg-gray-50 rounded-full p-1 hover:bg-gray-100 transition-colors duration-200'>
              <UserButton className='w-6 h-6' />
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className='fixed left-0 top-14 w-full bg-white/95 backdrop-blur-md z-50 p-4 shadow-lg border-t border-gray-100'>
            <div className='relative'>
              <input
                type='text'
                placeholder='Search for products...'
                className='w-full p-3 bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm rounded-lg transition-all duration-200 placeholder-gray-500'
              />
              <button className='absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md'>
                <Search className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Dock */}
      <div className='md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md z-50 border-t border-gray-200/50 shadow-lg'>
        <div className='flex justify-around items-center px-2 py-2'>
          {/* Home */}
          <Link
            href='/'
            className='flex flex-col items-center p-2 text-gray-700 hover:text-purple-600 transition-all duration-200 hover:bg-purple-50 rounded-lg'>
            <Home className='w-6 h-6 stroke-[1.5]' />
            <span className='text-xs mt-1 font-medium'>Home</span>
          </Link>

          {/* Search */}
          <button
            onClick={handleSearchClick}
            className='flex flex-col items-center p-2 text-gray-700 hover:text-purple-600 transition-all duration-200 hover:bg-purple-50 rounded-lg'
            aria-label='Search'>
            <Search className='w-6 h-6 stroke-[1.5]' />
            <span className='text-xs mt-1 font-medium'>Search</span>
          </button>

          {/* Categories - Using Drawer */}
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <button
                className='flex flex-col items-center p-2 text-gray-700 hover:text-purple-600 transition-all duration-200 hover:bg-purple-50 rounded-lg'
                aria-label='Categories'>
                <Grid className='w-6 h-6 stroke-[1.5]' />
                <span className='text-xs mt-1 font-medium'>Categories</span>
              </button>
            </DrawerTrigger>
            <DrawerContent className='bg-white rounded-t-2xl max-h-[80vh] overflow-hidden border-t border-gray-200 shadow-2xl'>
              <div className='p-6 pb-0'>
                <div className='w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4'></div>
                <DrawerTitle className='text-xl font-bold text-gray-900 text-center mb-6'>
                  Shop by Category
                </DrawerTitle>
              </div>
              <div className='px-6 max-h-[calc(80vh-100px)] overflow-y-auto pb-6'>
                <div className='space-y-1'>
                  {/* Special Categories */}
                  <div className='mb-6'>
                    <div className='bg-gradient-to-r from-purple-50 to-emerald-50 rounded-xl p-4 mb-3 border border-purple-100'>
                      <Link
                        href='/collections'
                        className='flex items-center justify-between text-purple-700 font-semibold hover:text-purple-800 transition-colors'
                        onClick={() => setDrawerOpen(false)}>
                        <span>✨ New Arrivals</span>
                      </Link>
                    </div>

                    <div className='bg-gradient-to-r from-emerald-50 to-purple-50 rounded-xl p-4 border border-emerald-100'>
                      <Link
                        href='/collections'
                        className='flex items-center justify-between text-emerald-700 font-semibold hover:text-emerald-800 transition-colors'
                        onClick={() => setDrawerOpen(false)}>
                        <span>🏷️ Sale</span>
                      </Link>
                    </div>
                  </div>

                  {/* Product Categories */}
                  {categories.map((category, index) => (
                    <div
                      key={category.id}
                      className='border-b border-gray-100 last:border-b-0 pb-4 last:pb-0 mb-4 last:mb-0'>
                      <Link
                        href={`/collections/${category.slug}`}
                        className='flex items-center justify-between p-3 text-gray-900 font-semibold hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200'
                        onClick={() => setDrawerOpen(false)}>
                        <span className='text-base'>{category.name}</span>
                        <div className='w-2 h-2 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full'></div>
                      </Link>

                      {category.subcategories &&
                        category.subcategories.length > 0 && (
                          <div className='ml-4 mt-2 space-y-1'>
                            {category.subcategories.map((subcategory) => (
                              <Link
                                key={subcategory.id}
                                href={`/collections/${category.slug}/${subcategory.slug}`}
                                className='block py-2 px-3 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200'
                                onClick={() => setDrawerOpen(false)}>
                                {subcategory.name}
                              </Link>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Wishlist */}
          <WishlistSheet>
            <button
              className='flex flex-col items-center p-2 text-gray-700 hover:text-purple-600 transition-all duration-200 hover:bg-purple-50 rounded-lg relative'
              aria-label='Wishlist'>
              <Heart className='w-6 h-6 stroke-[1.5]' />
              {wishlistCount > 0 && (
                <span className='absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-xs font-bold shadow-md'>
                  {wishlistCount}
                </span>
              )}
              <span className='text-xs mt-1 font-medium'>Wishlist</span>
            </button>
          </WishlistSheet>

          {/* Cart */}
          <CartSheet>
            <button
              className='flex flex-col items-center p-2 text-gray-700 hover:text-purple-600 transition-all duration-200 hover:bg-purple-50 rounded-lg relative'
              aria-label='Cart'>
              <ShoppingBag className='w-6 h-6 stroke-[1.5]' />
              {itemCount > 0 && (
                <span className='absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full text-xs font-bold shadow-md'>
                  {itemCount}
                </span>
              )}
              <span className='text-xs mt-1 font-medium'>Cart</span>
            </button>
          </CartSheet>
        </div>
      </div>

      {/* Adjusted padding height */}
      <div className='md:hidden h-[56px]'></div>
    </>
  );
}

// IconButton component with optional badge
function IconButton({
  href,
  icon,
  label,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className='p-3 text-gray-700 hover:text-purple-600 transition-all duration-200 rounded-lg hover:bg-purple-50 relative'
      aria-label={label}>
      {icon}
      {badge && (
        <span className='absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-xs font-bold shadow-md'>
          {badge}
        </span>
      )}
    </Link>
  );
}
