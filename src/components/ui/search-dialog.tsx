"use client";

import React, { useState, useTransition, useActionState } from "react";
import { Search, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchAction, SearchResponse } from "@/lib/search/actions";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialState: SearchResponse = {
  results: [],
  totalResults: 0,
  hasMore: false,
};

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [searchState, searchActionDispatch] = useActionState(
    searchAction,
    initialState
  );

  // Handle form submission with server action
  const handleSubmit = (formData: FormData) => {
    const searchQuery = formData.get("query") as string;
    if (searchQuery && searchQuery.trim().length >= 2) {
      startTransition(() => {
        searchActionDispatch(formData);
      });
    }
  };

  // Handle input change with immediate server action call
  const handleInputChange = (value: string) => {
    setQuery(value);

    if (value.trim().length >= 2) {
      const formData = new FormData();
      formData.append("query", value);
      formData.append("limit", "8");

      startTransition(() => {
        searchActionDispatch(formData);
      });
    }
  };

  // Reset state when dialog closes - simplified without calling action
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      // Don't call searchActionDispatch here - just reset local state
      // The searchState will remain as is until next search
    }
  }, [open]);

  const handleResultClick = () => {
    onOpenChange(false);
  };

  const getProductUrl = (result: (typeof searchState.results)[0]) => {
    if (result.category && result.subcategory) {
      return `/collections/${result.category.slug}/${result.subcategory.slug}/${result.slug}`;
    }
    return `/products/${result.slug}`;
  };

  const hasSearched = query.trim().length >= 2;
  const isLoading = isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[80vh] p-0'>
        <DialogHeader className='p-6 pb-0'>
          <DialogTitle className='text-xl font-bold'>
            Search Products
          </DialogTitle>
          <DialogDescription>
            Find your perfect modest fashion pieces
          </DialogDescription>
        </DialogHeader>

        <div className='px-6'>
          <form action={handleSubmit}>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
              <Input
                name='query'
                type='text'
                placeholder='Search for abayas, dresses, accessories...'
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                className='pl-10 pr-4 py-3 text-base border-2 focus:border-primary'
                autoFocus
              />
              <input type='hidden' name='limit' value='8' />
            </div>
          </form>
        </div>

        <div className='flex-1 overflow-hidden'>
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
              <span className='ml-3 text-gray-600'>Searching...</span>
            </div>
          ) : hasSearched && searchState.results.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 px-6 text-center'>
              <Package className='w-12 h-12 text-gray-300 mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                No products found
              </h3>
              <p className='text-gray-500'>
                Try searching with different keywords or browse our collections
              </p>
            </div>
          ) : searchState.results.length > 0 ? (
            <div className='px-6 pb-6'>
              <div className='max-h-96 overflow-y-auto'>
                <div className='space-y-2'>
                  {searchState.results.map((result) => (
                    <Link
                      key={result.id}
                      href={getProductUrl(result)}
                      onClick={handleResultClick}
                      className='flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group'>
                      <div className='w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0'>
                        {result.mainImage?.url ? (
                          <Image
                            src={result.mainImage.url}
                            alt={result.name}
                            width={64}
                            height={64}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center'>
                            <Package className='w-6 h-6 text-gray-400' />
                          </div>
                        )}
                      </div>

                      <div className='flex-1 min-w-0'>
                        <h3 className='font-medium text-gray-900 truncate group-hover:text-primary'>
                          {result.name}
                        </h3>
                        <p className='text-sm text-gray-500 truncate'>
                          {result.category?.name}
                          {result.subcategory &&
                            ` • ${result.subcategory.name}`}
                        </p>
                        <p className='text-sm font-semibold text-primary'>
                          ${result.price.toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                {searchState.hasMore && (
                  <div className='text-center mt-4 text-sm text-gray-500'>
                    Showing {searchState.results.length} of{" "}
                    {searchState.totalResults} results
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-12 px-6 text-center'>
              <Search className='w-12 h-12 text-gray-300 mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Start searching
              </h3>
              <p className='text-gray-500'>
                Enter keywords to find your perfect modest fashion pieces
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
