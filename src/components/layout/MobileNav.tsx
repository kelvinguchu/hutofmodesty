"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Heart,
  ShoppingBag,
  Home,
  Grid,
  Phone,
  Mail,
} from "lucide-react";
import { BiLogoInstagram, BiLogoTiktok } from "react-icons/bi";
import { useCartStore } from "@/lib/cart/cartStore";
import { useWishlistStore } from "@/lib/wishlist/wishlistStore";
import { WishlistSheet } from "@/components/wishlist/WishlistSheet";
import { CartSheet } from "@/components/cart/CartSheet";
import { UserButton } from "@/components/auth/UserButton";
import { SearchDialog } from "@/components/search/SearchDialog";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { CategoryUI } from "@/types/navigation";
import type { AuthUser } from "@/lib/auth/types";
import Logo from "@/components/admin/Logo";

interface MobileNavProps {
  categories: CategoryUI[];
  user: AuthUser | null;
  isAuthenticated: boolean;
}

export default function MobileNav({
  categories,
  user,
  isAuthenticated,
}: Readonly<MobileNavProps>) {
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount } = useCartStore();
  const wishlistCount = useWishlistStore((state) => state.itemCount);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Optimized scroll handler with throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
                <Logo width={60} height={52} />
              </div>
            </Link>

            {/* Mobile Account Icon - Clean Mobile Variant */}
            <UserButton
              variant='mobile'
              className='w-8 h-8'
              user={user}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Dock */}
      <div className='md:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md z-50 border-t border-gray-200/50 shadow-lg'>
        <div className='flex justify-around items-center px-2 py-2'>
          {/* Home */}
          <Link
            href='/'
            className='flex flex-col items-center p-2 text-gray-700 hover:text-primary transition-all duration-200 hover:bg-primary/5 rounded-lg'>
            <Home className='w-6 h-6 stroke-[1.5]' />
            <span className='text-xs mt-1 font-medium'>Home</span>
          </Link>

          {/* Search */}
          <button
            onClick={() => setIsSearchDialogOpen(true)}
            className='flex flex-col items-center p-2 text-gray-700 hover:text-primary transition-all duration-200 hover:bg-primary/5 rounded-lg'
            aria-label='Search'>
            <Search className='w-6 h-6 stroke-[1.5]' />
            <span className='text-xs mt-1 font-medium'>Search</span>
          </button>

          {/* Categories - Using Drawer */}
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <button
                className='flex flex-col items-center p-2 text-gray-700 hover:text-primary transition-all duration-200 hover:bg-primary/5 rounded-lg'
                aria-label='Categories'>
                <Grid className='w-6 h-6 stroke-[1.5]' />
                <span className='text-xs mt-1 font-medium'>Categories</span>
              </button>
            </DrawerTrigger>
            <DrawerContent className='bg-white rounded-t-2xl max-h-[80vh] flex flex-col border-t border-gray-200 shadow-2xl'>
              <div className='p-6 pb-4 border-b border-gray-100'>
                <DrawerTitle className='text-xl font-bold text-gray-900 text-center'>
                  Shop by Category
                </DrawerTitle>
              </div>
              <div className='flex-grow px-6 pt-4 overflow-y-auto'>
                <div className='space-y-1'>
                  {/* Product Categories */}
                  {categories.map((category, index) => (
                    <div
                      key={category.id}
                      className='border-b border-gray-100 last:border-b-0 pb-4 last:pb-0 mb-4 last:mb-0'>
                      <Link
                        href={`/collections/${category.slug}`}
                        className='flex items-center justify-between p-3 text-gray-900 font-semibold hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200'
                        onClick={() => setDrawerOpen(false)}>
                        <span className='text-base'>{category.name}</span>
                        <div className='w-2 h-2 bg-primary rounded-full'></div>
                      </Link>

                      {category.subcategories &&
                        category.subcategories.length > 0 && (
                          <div className='ml-4 mt-2 space-y-1'>
                            {category.subcategories.map((subcategory) => (
                              <Link
                                key={subcategory.id}
                                href={`/collections/${category.slug}/${subcategory.slug}`}
                                className='block py-2 px-3 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200'
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
              <div className='mt-auto p-4 border-t border-gray-200 bg-gray-50'>
                <div className='flex items-center justify-center space-x-6'>
                  <a
                    href='tel:+254748355387'
                    className='flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors'>
                    <Phone className='w-4 h-4' />
                  </a>
                  <a
                    href='https://www.instagram.com/hut_of_modesty?igsh=MWNvc21zMHg2MXo4aw%3D%3D&utm_source=qr'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-gray-500 hover:text-primary transition-colors'
                    aria-label='Instagram'>
                    <BiLogoInstagram className='h-5 w-5' />
                  </a>
                  <a
                    href='https://www.tiktok.com/@hut_of_modesty?_t=ZM-8xdIUgVuXw6&_r=1'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-gray-500 hover:text-primary transition-colors'
                    aria-label='Tiktok'>
                    <BiLogoTiktok className='h-5 w-5' />
                  </a>
                  <a
                    href='mailto:info@hutofmodesty.com'
                    className='text-gray-500 hover:text-primary transition-colors'
                    aria-label='Email'>
                    <Mail className='h-5 w-5' />
                  </a>
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Wishlist */}
          <WishlistSheet user={user} isAuthenticated={isAuthenticated}>
            <button
              className='flex flex-col items-center p-2 text-gray-700 hover:text-primary transition-all duration-200 hover:bg-primary/5 rounded-lg relative'
              aria-label='Wishlist'>
              <Heart className='w-6 h-6 stroke-[1.5]' />
              {wishlistCount > 0 && (
                <span className='absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-bold shadow-md'>
                  {wishlistCount}
                </span>
              )}
              <span className='text-xs mt-1 font-medium'>Wishlist</span>
            </button>
          </WishlistSheet>

          {/* Cart */}
          <CartSheet user={user} isAuthenticated={isAuthenticated}>
            <button
              className='flex flex-col items-center p-2 text-gray-700 hover:text-primary transition-all duration-200 hover:bg-primary/5 rounded-lg relative'
              aria-label='Cart'>
              <ShoppingBag className='w-6 h-6 stroke-[1.5]' />
              {itemCount > 0 && (
                <span className='absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-bold shadow-md'>
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

      {/* Search Dialog */}
      <SearchDialog
        open={isSearchDialogOpen}
        onOpenChange={setIsSearchDialogOpen}
      />
    </>
  );
}
