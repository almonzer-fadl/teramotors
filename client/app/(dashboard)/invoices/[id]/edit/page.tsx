'use client';

import InvoiceForm from '@/components/forms/InvoiceForm';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function EditInvoicePageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#F97402] mx-auto" />
        <p className="mt-4 text-lg text-gray-600">Loading Invoice Form...</p>
      </div>
    </div>
  )
}

export default function EditInvoicePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <Suspense fallback={<EditInvoicePageFallback />}>
      <InvoiceForm invoiceId={id} />
    </Suspense>
  );
}
