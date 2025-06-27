import React from "react";
import Link from "next/link";
import { TbBoxOff } from "react-icons/tb";
import ProductCard from "@/components/home/ProductCard";
import FilterBar from "./FilterBar";

import type {
  Subcategory,
  Category,
  Clothing,
  Footwear,
  Fragrance,
  Accessory,
} from "@/payload-types";

// Union type for all product types
type Product = Clothing | Footwear | Fragrance | Accessory;

interface SubcategoryDisplayProps {
  category: Category;
  subcategory: Subcategory;
  siblingSubcategories: Subcategory[];
  products: Product[];
  totalProducts: number;
  currentSort: string;
}

export default function SubcategoryDisplay({
  category,
  subcategory,
  siblingSubcategories,
  products,
  totalProducts,
  currentSort,
}: SubcategoryDisplayProps) {
  // Use unified accent color for all categories
  const accentColor: "purple" = "purple";

  return (
    <div className='w-full bg-gradient-to-br from-gray-50 via-white to-purple-50/20 lg:mt-4'>
      {/* Compact header with breadcrumb */}
      <div className='font-montserrat border-b border-gray-200 h-[50px] flex items-center overflow-x-auto bg-white/80 backdrop-blur-sm shadow-sm'>
        <div className='container mx-auto px-4 sm:px-6'>
          <div className='flex items-center text-sm whitespace-nowrap'>
            <Link
              href='/'
              className='text-gray-600 hover:text-primary transition-colors font-medium cursor-pointer'>
              Home
            </Link>
            <span className='mx-3 text-gray-400'>/</span>
            <Link
              href='/collections'
              className='text-gray-600 hover:text-primary transition-colors font-medium cursor-pointer'>
              Collections
            </Link>
            <span className='mx-3 text-gray-400'>/</span>
            <Link
              href={`/collections/${category.slug}`}
              className='text-gray-600 hover:text-primary transition-colors font-medium cursor-pointer'>
              {category.name}
            </Link>
            <span className='mx-3 text-gray-400'>/</span>
            <span className='font-bold text-gray-900'>{subcategory.name}</span>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 sm:px-2 py-4'>
        {/* Elegant centered subcategory title */}
        <div className='mb-8 text-center'>
          <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 inline-block relative mb-3'>
            {subcategory.name}
            <div className='absolute left-1/2 transform -translate-x-1/2 -bottom-1 w-12 h-1 bg-primary rounded-full'></div>
          </h2>
          <p className='text-gray-600 font-medium'>
            {totalProducts} {totalProducts === 1 ? "product" : "products"} in{" "}
            {category.name}
          </p>
        </div>

        {/* Use the new FilterBar component */}
        <FilterBar
          category={category}
          subcategory={subcategory}
          siblingSubcategories={siblingSubcategories}
          currentSort={currentSort}
        />

        {/* Product grid */}
        {products.length > 0 ? (
          <>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  accent={accentColor}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalProducts > 12 && (
              <div className='mt-12 flex justify-center'>
                <nav className='inline-flex border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white'>
                  <button
                    disabled
                    className='bg-white text-gray-400 px-4 py-3 text-sm border-r border-gray-200 cursor-not-allowed'>
                    Previous
                  </button>
                  <span className='bg-primary text-primary-foreground font-bold px-4 py-3 text-sm border-r border-gray-200'>
                    1
                  </span>
                  <button
                    disabled
                    className='bg-white text-gray-400 px-4 py-3 text-sm cursor-not-allowed'>
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className='text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-white/80 backdrop-blur-sm'>
            <div className='mb-6'>
              <TbBoxOff
                className='mx-auto text-gray-400 w-16 h-16'
                strokeWidth={1}
              />
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-3'>
              No Products Found
            </h3>
            <p className='text-gray-600 mb-8 max-w-md mx-auto leading-relaxed'>
              We couldn't find any products in this subcategory. Try browsing
              the main category or check back later.
            </p>
            <Link
              href={`/collections/${category.slug}`}
              className='inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer'>
              View All {category.name}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
