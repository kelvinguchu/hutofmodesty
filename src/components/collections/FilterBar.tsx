"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaChevronDown } from "react-icons/fa";
import { SlidersHorizontal, RefreshCw } from "lucide-react";
import SortSelect from "./SortSelect";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Use Payload-generated types
import type { Category, Subcategory } from "@/payload-types";

interface FilterBarProps {
  category: Category;
  subcategory?: Subcategory; // Optional for CategoryDisplay
  siblingSubcategories?: Subcategory[]; // Optional for CategoryDisplay
  currentSort: string;
}

export default function FilterBar({
  category,
  subcategory,
  siblingSubcategories,
  currentSort,
}: FilterBarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  interface FiltersState {
    sizes: string[];
    featured: boolean;
    trending: boolean;
    sort: string;
  }

  const [selectedFilters, setSelectedFilters] = useState<FiltersState>({
    sizes: [],
    featured: false,
    trending: false,
    sort: currentSort || "latest",
  });

  const basePath = subcategory
    ? `/collections/${category.slug}/${subcategory.slug}`
    : `/collections/${category.slug}`;

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];

  const toggleSize = (size: string) => {
    setSelectedFilters((prev) => {
      const sizes = [...prev.sizes];
      const index = sizes.indexOf(size);
      if (index >= 0) {
        sizes.splice(index, 1);
      } else {
        sizes.push(size);
      }
      return { ...prev, sizes };
    });
  };

  const toggleFeatured = () => {
    setSelectedFilters((prev) => ({
      ...prev,
      featured: !prev.featured,
    }));
  };

  const toggleTrending = () => {
    setSelectedFilters((prev) => ({
      ...prev,
      trending: !prev.trending,
    }));
  };

  const setSort = (sortValue: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      sort: sortValue,
    }));
  };

  const resetFilters = () => {
    setSelectedFilters({
      sizes: [],
      featured: false,
      trending: false,
      sort: "latest",
    });
  };

  // Calculate active filter count
  const activeFilterCount = () => {
    let count = 0;

    // Count selected sizes
    count += selectedFilters.sizes.length;

    // Count boolean filters
    if (selectedFilters.featured) count++;
    if (selectedFilters.trending) count++;

    // Count sort if not default
    if (selectedFilters.sort !== "latest") count++;

    return count;
  };

  // Check if any filters are active
  const hasActiveFilters =
    selectedFilters.sizes.length > 0 ||
    selectedFilters.featured ||
    selectedFilters.trending ||
    selectedFilters.sort !== "latest";

  // Apply filters function
  const applyFilters = () => {
    let queryParams = new URLSearchParams();

    // Add sort parameter if not default
    if (selectedFilters.sort !== "latest") {
      queryParams.set("sort", selectedFilters.sort);
    }

    // Add size filter parameters
    if (selectedFilters.sizes.length > 0) {
      queryParams.set("sizes", selectedFilters.sizes.join(","));
    }

    // Add boolean filters
    if (selectedFilters.featured) {
      queryParams.set("featured", "true");
    }

    if (selectedFilters.trending) {
      queryParams.set("trending", "true");
    }

    // Create the URL with query parameters
    const targetUrl = queryParams.toString()
      ? `${basePath}?${queryParams.toString()}`
      : basePath;

    // Navigate to the filtered URL
    router.push(targetUrl);
    setOpen(false);
  };

  return (
    <>
      {/* Desktop Filter Bar */}
      <div className='hidden md:flex items-center justify-between flex-wrap gap-4 py-4 border border-gray-200 rounded-xl mb-8 overflow-x-auto bg-white/80 backdrop-blur-sm shadow-sm px-6'>
        {/* Filters Section */}
        <div className='flex items-center gap-3 flex-nowrap'>
          {/* Collection filter dropdown */}
          {siblingSubcategories && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='text-sm cursor-pointer whitespace-nowrap border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 font-medium'>
                  Collection
                  <FaChevronDown className='ml-2 h-3 w-3' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='start'
                className='w-56 z-50 bg-white border-gray-200 shadow-lg'>
                <DropdownMenuLabel className='font-bold text-gray-900'>
                  Select Collection
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/collections/${category.slug}`}
                    className={`w-full cursor-pointer ${!subcategory ? "font-bold bg-purple-50 text-purple-700" : "hover:bg-gray-50"}`}>
                    All {category.name}
                  </Link>
                </DropdownMenuItem>
                {siblingSubcategories.map((sibling) => (
                  <DropdownMenuItem key={sibling.id} asChild>
                    <Link
                      href={`/collections/${category.slug}/${sibling.slug}`}
                      className={`w-full cursor-pointer ${subcategory?.id === sibling.id ? "font-bold bg-purple-50 text-purple-700" : "hover:bg-gray-50"}`}>
                      {sibling.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Price filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='text-sm cursor-pointer whitespace-nowrap border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 font-medium '>
                Price
                <FaChevronDown className='ml-2 h-3 w-3' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='start'
              className='w-48 z-50 bg-white border-gray-200 shadow-lg'>
              <DropdownMenuLabel className='font-bold text-gray-900'>
                Sort by Price
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`${basePath}?sort=price-asc`}
                  className={`w-full cursor-pointer ${currentSort === "price-asc" ? "font-bold bg-purple-50 text-purple-700" : "hover:bg-gray-50"}`}>
                  Low to High
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`${basePath}?sort=price-desc`}
                  className={`w-full cursor-pointer ${currentSort === "price-desc" ? "font-bold bg-purple-50 text-purple-700" : "hover:bg-gray-50"}`}>
                  High to Low
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Size filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='text-sm whitespace-nowrap border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 font-medium cursor-pointer'>
                Size
                <FaChevronDown className='ml-2 h-3 w-3' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='start'
              className='w-48 z-50 bg-white border-gray-200 shadow-lg'>
              <DropdownMenuLabel className='font-bold text-gray-900'>
                Filter by Size
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className='p-3 grid grid-cols-3 gap-2'>
                {sizeOptions.map((size) => (
                  <DropdownMenuItem key={size} asChild className='p-0'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='w-full h-auto text-sm p-2 border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 cursor-pointer'>
                      {size}
                    </Button>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sort Section */}
        <div className='flex-shrink-0'>
          <SortSelect
            category={category.slug}
            subcategory={subcategory?.slug}
            currentSort={currentSort}
          />
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className='md:hidden mb-6'>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className='fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200'
              aria-label='Filter'>
              <SlidersHorizontal className='w-6 h-6' />
              {hasActiveFilters && (
                <div className='absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md'>
                  {activeFilterCount()}
                </div>
              )}
            </button>
          </SheetTrigger>
          <SheetContent
            side='left'
            className='sm:min-w-[40vw] min-w-[95vw] bg-white p-0 overflow-y-auto flex flex-col border-l border-gray-200 shadow-2xl'>
            <div className='border-b border-gray-100 py-4 px-6 bg-white'>
              <SheetTitle className='text-xl font-bold text-gray-900'>
                Filter & Sort
              </SheetTitle>
            </div>

            <div className='flex-1 font-montserrat overflow-y-auto divide-y divide-gray-100'>
              {/* Sort section */}
              <div className='p-6'>
                <h3 className='font-bold text-gray-900 mb-4'>Sort By</h3>
                <div className='space-y-3'>
                  {[
                    { value: "latest", label: "Latest" },
                    { value: "price-asc", label: "Price: Low to High" },
                    { value: "price-desc", label: "Price: High to Low" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      className={`block py-3 text-sm text-left w-full rounded-lg px-3 transition-all duration-200 cursor-pointer ${
                        selectedFilters.sort === option.value
                          ? "font-bold text-purple-700 bg-purple-50"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      onClick={() => setSort(option.value)}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size filter section */}
              <div className='p-6'>
                <h3 className='font-bold text-gray-900 mb-4'>Size</h3>
                <div className='flex flex-wrap gap-3'>
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      className={`min-w-16 py-3 px-4 text-sm rounded-lg border-2 font-medium transition-all duration-200 cursor-pointer ${
                        selectedFilters.sizes.includes(size)
                          ? "bg-purple-600 text-white border-purple-600 shadow-md"
                          : "border-gray-200 text-gray-700 bg-white hover:border-purple-300 hover:bg-purple-50"
                      }`}
                      onClick={() => toggleSize(size)}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special filters */}
              <div className='p-6'>
                <h3 className='font-bold text-gray-900 mb-4'>Product Type</h3>
                <div className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <Label
                      htmlFor='filter-featured'
                      className='text-sm font-medium text-gray-700 cursor-pointer'>
                      Featured Products
                    </Label>
                    <Switch
                      id='filter-featured'
                      checked={selectedFilters.featured}
                      onCheckedChange={toggleFeatured}
                    />
                  </div>
                  <div className='flex items-center justify-between'>
                    <Label
                      htmlFor='filter-trending'
                      className='text-sm font-medium text-gray-700 cursor-pointer'>
                      Trending Products
                    </Label>
                    <Switch
                      id='filter-trending'
                      checked={selectedFilters.trending}
                      onCheckedChange={toggleTrending}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Apply filters and reset buttons */}
            <div className='border-t border-gray-100 px-6 py-4 mt-auto bg-white'>
              <div className='flex gap-3'>
                <Button
                  className={`flex-1 text-sm font-bold transition-all duration-200 cursor-pointer ${
                    hasActiveFilters
                      ? "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                      : "bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}>
                  <RefreshCw className='w-4 h-4 mr-2' />
                  Reset
                </Button>
                <Button
                  className='flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 font-bold transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer'
                  onClick={applyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
