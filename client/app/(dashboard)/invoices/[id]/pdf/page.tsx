'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import InvoiceDocument from '@/components/pdf/InvoiceDocument';

export default function InvoicePdfPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = (params as any)?.id as string;
  const initialLang = (searchParams.get('lang') || 'en') as 'en' | 'ar';
  const [language, setLanguage] = useState<'en' | 'ar'>(initialLang);
  const [data, setData] = useState<{ invoice: any; jobCard: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      try {
        const res = await fetch(`/api/invoices/${id}`);
        if (res.ok) {
          setData(await res.json());
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const doc = useMemo(() => {
    if (!data) return null;
    return <InvoiceDocument 
      invoice={data.invoice} 
      jobCard={data.jobCard} 
      language={language} 
      qrCodeData={data.invoice.zatca?.qrCode}
    />;
  }, [data, language]);

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

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/invoices" className="text-sm text-gray-600 hover:text-gray-900">Back</Link>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <PDFDownloadLink document={doc as any} fileName={`invoice-${String(data.invoice._id).slice(-6)}-${language}.pdf`}>
            {({ loading }) => (
              <button className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                {loading ? 'Preparing…' : 'Download PDF'}
              </button>
            )}
          </PDFDownloadLink>
          <a
            className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
            href={`/api/invoices/${data.invoice._id}/pdf?lang=${language}`}
          >
            Server Download
          </a>
        </div>
      </div>

      {doc ? (
        <div className="h-[80vh] w-full border">
          <PDFViewer width="100%" height="100%" showToolbar>
            {doc}
          </PDFViewer>
        </div>
      ) : null}
    </div>
  );
}


