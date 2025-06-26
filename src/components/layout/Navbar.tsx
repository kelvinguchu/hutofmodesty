"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BiLogoInstagram, BiLogoFacebook, BiLogoTwitter } from "react-icons/bi";
import {
  Search,
  Heart,
  ShoppingBag,
  ChevronDown,
  Phone,
  Mail,
} from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";
import { useWishlistStore } from "@/lib/wishlist/wishlistStore";
import { WishlistSheet } from "@/components/wishlist/WishlistSheet";
import { CartSheet } from "@/components/cart/CartSheet";
import { UserButton } from "@/components/auth/UserButton";
import MobileNav from "./MobileNav";
import type { CategoryUI } from "@/types/navigation";
import Logo from "@/components/admin/Logo";

interface NavbarProps {
  categories: CategoryUI[];
}

export default function Navbar({ categories }: Readonly<NavbarProps>) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { itemCount } = useCart();
  const wishlistCount = useWishlistStore((state) => state.itemCount);

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

  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
    }
  };

  return (
    <>
      {/* Mobile Navigation */}
      <div className='md:hidden'>
        <MobileNav categories={categories} />
      </div>

      {/* Desktop Navigation */}
      <header
        className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 hidden md:block
        ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white"}`}>
        <div className='w-full'>
          {/* Top Bar */}
          <div className='flex justify-between items-center py-2 text-xs bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-4 text-white border-b border-gray-700'>
            <div className='flex items-center space-x-4'>
              <a
                href='https://instagram.com'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-purple-400 transition-colors duration-200 hover:scale-110 transform cursor-pointer'>
                <BiLogoInstagram className='h-4 w-4' />
              </a>
              <a
                href='https://facebook.com'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-purple-400 transition-colors duration-200 hover:scale-110 transform cursor-pointer'>
                <BiLogoFacebook className='h-4 w-4' />
              </a>
              <a
                href='https://twitter.com'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-purple-400 transition-colors duration-200 hover:scale-110 transform cursor-pointer'>
                <BiLogoTwitter className='h-4 w-4' />
              </a>
            </div>
            <div className='flex items-center space-x-4 text-gray-300'>
              <span className='flex items-center gap-2'>
                <Phone className='h-3 w-3' />
                <span className='hover:text-white transition-colors cursor-pointer'>
                  +254 700 123 456
                </span>
              </span>
              <span className='text-gray-500'>|</span>
              <span className='flex items-center gap-2'>
                <Mail className='h-3 w-3' />
                <span className='hover:text-white transition-colors cursor-pointer'>
                  info@hutofmodesty.com
                </span>
              </span>
            </div>
          </div>

          {/* Main Navbar */}
          <div className='flex items-center justify-between px-4 py-3'>
            {/* Logo */}
            <Link href='/' className='relative z-10 group cursor-pointer'>
              <Logo />
            </Link>

            {/* Desktop Navigation */}
            <nav className='flex items-center space-x-2'>
              <NavItem href='/' label='Home' />

              {/* Render categories */}
              {categories.map((category) => (
                <div key={category.id} className='relative group'>
                  <button
                    className='flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 cursor-pointer'
                    onClick={() => toggleDropdown(category.slug)}>
                    <span>{category.name}</span>
                    <ChevronDown className='ml-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-180' />
                  </button>

                  <div className='absolute left-0 top-full w-56 bg-white shadow-xl rounded-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 overflow-hidden'>
                    <div className='p-2'>
                      <Link
                        href={`/collections/${category.slug}`}
                        className='block px-4 py-3 text-sm font-semibold text-gray-900 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 border-b border-gray-100 mb-2 cursor-pointer'>
                        All {category.name}
                      </Link>

                      {category.subcategories &&
                      category.subcategories.length > 0 ? (
                        category.subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.id}
                            href={`/collections/${category.slug}/${subcategory.slug}`}
                            className='block px-4 py-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 cursor-pointer'>
                            {subcategory.name}
                          </Link>
                        ))
                      ) : (
                        <div className='px-4 py-2 text-sm text-gray-400'>
                          No subcategories
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <NavItem href='/collections' label='New Arrivals' />
              <NavItem href='/collections' label='Sale' />
            </nav>

            {/* Desktop Icons */}
            <div className='flex items-center space-x-2'>
              {/* Search */}
              <div className='relative'>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className='p-2 text-gray-700 hover:text-purple-600 transition-all duration-200 rounded-lg hover:bg-purple-50 cursor-pointer'
                  aria-label='Search'>
                  <Search className='w-5 h-5 stroke-[1.5]' />
                </button>

                {isSearchOpen && (
                  <div className='absolute right-0 top-full mt-3 w-80 bg-white shadow-xl rounded-xl border border-gray-100 p-4 z-50'>
                    <div className='flex items-center gap-3'>
                      <input
                        type='text'
                        placeholder='Search for products...'
                        className='flex-1 p-3 bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm rounded-lg transition-all duration-200 placeholder-gray-500'
                      />
                      <button className='p-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md cursor-pointer'>
                        <Search className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <WishlistSheet>
                <button
                  className='p-2 text-gray-700 hover:text-purple-600 transition-all duration-200 rounded-lg hover:bg-purple-50 relative cursor-pointer'
                  aria-label='Wishlist'>
                  <Heart className='w-5 h-5 stroke-[1.5]' />
                  {wishlistCount > 0 && (
                    <span className='absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full text-[10px] font-bold shadow-md'>
                      {wishlistCount}
                    </span>
                  )}
                </button>
              </WishlistSheet>

              {/* User Account */}
              <UserButton />

              {/* Shopping Bag */}
              <CartSheet>
                <button
                  className='p-2 text-gray-700 hover:text-purple-600 transition-all duration-200 rounded-lg hover:bg-purple-50 relative cursor-pointer'
                  aria-label='Shopping Cart'>
                  <ShoppingBag className='w-5 h-5 stroke-[1.5]' />
                  {itemCount > 0 && (
                    <span className='absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full text-[10px] font-bold shadow-md'>
                      {itemCount}
                    </span>
                  )}
                </button>
              </CartSheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

// NavItem component for consistent styling
function NavItem({
  href,
  label,
}: Readonly<{
  href: string;
  label: string;
}>) {
  return (
    <Link
      href={href}
      className='px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 cursor-pointer'>
      {label}
    </Link>
  );
}

// IconButton component with optional badge
function IconButton({
  href,
  icon,
  label,
  badge,
}: Readonly<{
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}>) {
  return (
    <Link
      href={href}
      className='p-3 text-gray-700 hover:text-purple-600 transition-all duration-200 rounded-lg hover:bg-purple-50 relative cursor-pointer'
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
