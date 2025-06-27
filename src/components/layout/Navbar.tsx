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
import { useCartStore } from "@/lib/cart/cartStore";
import { useWishlistStore } from "@/lib/wishlist/wishlistStore";
import { WishlistSheet } from "@/components/wishlist/WishlistSheet";
import { CartSheet } from "@/components/cart/CartSheet";
import { UserButton } from "@/components/auth/UserButton";
import { SearchDialog } from "@/components/search/SearchDialog";
import MobileNav from "./MobileNav";
import type { CategoryUI } from "@/types/navigation";
import type { AuthUser } from "@/lib/auth/types";
import Logo from "@/components/admin/Logo";

interface NavbarProps {
  categories: CategoryUI[];
  user: AuthUser | null;
  isAuthenticated: boolean;
}

export default function Navbar({
  categories,
  user,
  isAuthenticated,
}: Readonly<NavbarProps>) {
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { itemCount } = useCartStore();
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
        <MobileNav
          categories={categories}
          user={user}
          isAuthenticated={isAuthenticated}
        />
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
                className='hover:text-primary/80 transition-colors duration-200 hover:scale-110 transform cursor-pointer'>
                <BiLogoInstagram className='h-4 w-4' />
              </a>
              <a
                href='https://facebook.com'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-primary/80 transition-colors duration-200 hover:scale-110 transform cursor-pointer'>
                <BiLogoFacebook className='h-4 w-4' />
              </a>
              <a
                href='https://twitter.com'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-primary/80 transition-colors duration-200 hover:scale-110 transform cursor-pointer'>
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
              <Logo width={80} height={70} />
            </Link>

            {/* Desktop Navigation */}
            <nav className='flex items-center space-x-2'>
              <NavItem href='/' label='Home' />

              {/* Render categories */}
              {categories.map((category) => (
                <div key={category.id} className='relative group'>
                  <button
                    className='flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 cursor-pointer'
                    onClick={() => toggleDropdown(category.slug)}>
                    <span>{category.name}</span>
                    <ChevronDown className='ml-2 h-4 w-4 transition-transform duration-200 group-hover:rotate-180' />
                  </button>

                  <div className='absolute left-0 top-full w-56 bg-white shadow-xl rounded-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 overflow-hidden'>
                    <div className='p-2'>
                      <Link
                        href={`/collections/${category.slug}`}
                        className='block px-4 py-3 text-sm font-semibold text-gray-900 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 border-b border-gray-100 mb-2 cursor-pointer'>
                        All {category.name}
                      </Link>

                      {category.subcategories &&
                      category.subcategories.length > 0 ? (
                        category.subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.id}
                            href={`/collections/${category.slug}/${subcategory.slug}`}
                            className='block px-4 py-2 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 cursor-pointer'>
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
            </nav>

            {/* Desktop Icons */}
            <div className='flex items-center space-x-2'>
              {/* Search */}
              <button
                onClick={() => setIsSearchDialogOpen(true)}
                className='p-2 text-gray-700 hover:text-primary transition-all duration-200 rounded-lg hover:bg-primary/5 cursor-pointer'
                aria-label='Search'>
                <Search className='w-5 h-5 stroke-[1.5]' />
              </button>

              {/* Wishlist */}
              <WishlistSheet user={user} isAuthenticated={isAuthenticated}>
                <button
                  className='p-2 text-gray-700 hover:text-primary transition-all duration-200 rounded-lg hover:bg-primary/5 relative cursor-pointer'
                  aria-label='Wishlist'>
                  <Heart className='w-5 h-5 stroke-[1.5]' />
                  {wishlistCount > 0 && (
                    <span className='absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] font-bold shadow-md'>
                      {wishlistCount}
                    </span>
                  )}
                </button>
              </WishlistSheet>

              {/* User Account */}
              <UserButton user={user} isAuthenticated={isAuthenticated} />

              {/* Shopping Bag */}
              <CartSheet user={user} isAuthenticated={isAuthenticated}>
                <button
                  className='p-2 text-gray-700 hover:text-primary transition-all duration-200 rounded-lg hover:bg-primary/5 relative cursor-pointer'
                  aria-label='Shopping Cart'>
                  <ShoppingBag className='w-5 h-5 stroke-[1.5]' />
                  {itemCount > 0 && (
                    <span className='absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] font-bold shadow-md'>
                      {itemCount}
                    </span>
                  )}
                </button>
              </CartSheet>
            </div>
          </div>
        </div>

        {/* Search Dialog */}
        <SearchDialog
          open={isSearchDialogOpen}
          onOpenChange={setIsSearchDialogOpen}
        />
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
      className='px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 cursor-pointer'>
      {label}
    </Link>
  );
}
