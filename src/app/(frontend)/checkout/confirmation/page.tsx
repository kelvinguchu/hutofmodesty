import React, { Suspense } from "react";
import ConfirmationContent from "@/components/checkout/ConfirmationContent";

// Loading component to be shown as fallback
function LoadingFallback() {
  return (
    <div className='max-w-4xl mx-auto px-4 py-12 text-center'>
      <div className='inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
      <p className='mt-2 text-primary'>Loading order details...</p>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <div className='max-w-4xl mx-auto px-4 py-12'>
      <Suspense fallback={<LoadingFallback />}>
        <ConfirmationContent />
      </Suspense>
    </div>
  );
}
