'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function InvoicePdfPage() {
  const params = useParams();
  const id = (params as any)?.id as string;
  const [data, setData] = useState<{ invoice: any; jobCard: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      try {
        const res = await fetch(`/api/invoices/${id}/view`);
        if (res.ok) {
          setData(await res.json());
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6">Invoice not found</div>;
  }

  function t(arg0: string): string | undefined {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/invoices" className="text-sm text-gray-600 hover:text-gray-900">← العودة للفواتير</Link>
        </div>
        <div className="flex items-center gap-2">
          <a
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            href={`/api/invoices/${data.invoice._id}/pdf`}
            target="_blank"
          >
            تحميل PDF
          </a>
        </div>
      </div>

      <div className="h-[80vh] w-full border rounded-lg overflow-hidden">
        <iframe 
          src={`/api/invoices/${data.invoice._id}/pdf`} 
          width="100%" 
          height="100%"
          className="border-0"
          title={t('ui.invoice_pdf')}
        />
      </div>
    </div>
  );
}


