'use client';

import PaymentForm from '@/components/forms/PaymentForm';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function NewPaymentPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#F97402] mx-auto" />
        <p className="mt-4 text-lg text-gray-600">Loading Payment Form...</p>
      </div>
    </div>
  )
}

export default function NewPaymentPage() {
  return (
    <Suspense fallback={<NewPaymentPageFallback />}>
      <PaymentForm />
    </Suspense>
  );
}
