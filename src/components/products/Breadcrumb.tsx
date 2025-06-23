import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface Category {
  name: string;
  slug: string;
  id: string;
}

interface BreadcrumbProps {
  productName: string;
  category: string | Category;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ productName, category }) => {
  // Handle category, which could be a string or an object
  const categoryName =
    typeof category === "string" ? category : category?.name || "Category";
  const categorySlug =
    typeof category === "string" ? category : category?.slug || "";

  return (
    <div className='bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 py-2 sm:py-3'>
      <div className='container mx-auto px-2 sm:px-4 w-full'>
        <nav
          className='flex items-center text-xs sm:text-sm'
          aria-label='Breadcrumb'>
          {/* Home - Always visible */}
          <Link
            href='/'
            className='inline-flex items-center gap-1 sm:gap-1.5 text-gray-600 hover:text-purple-600 transition-colors duration-200 flex-shrink-0 group'>
            <Home className='w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform duration-200' />
            <span className='font-medium hidden xs:inline'>Home</span>
          </Link>

          <ChevronRight className='w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0 mx-1' />

          {/* Collections - Hidden on very small screens */}
          <Link
            href='/collections'
            className='text-gray-600 hover:text-purple-600 transition-colors duration-200 flex-shrink-0 font-medium hidden sm:block'>
            Collections
          </Link>

          <ChevronRight className='w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0 mx-1 hidden sm:block' />

          {/* Category - Responsive truncation */}
          <Link
            href={`/collections/${categorySlug}`}
            className='text-gray-600 hover:text-purple-600 transition-colors duration-200 flex-shrink-0 font-medium truncate max-w-[60px] xs:max-w-[80px] sm:max-w-[120px] md:max-w-none'
            title={categoryName}>
            {categoryName}
          </Link>

          <ChevronRight className='w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0 mx-1' />

          {/* Product Name - Responsive truncation */}
          <span
            className='font-semibold text-gray-900 flex-shrink-0 truncate max-w-[80px] xs:max-w-[120px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-none'
            title={productName}>
            {productName}
          </span>
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;
