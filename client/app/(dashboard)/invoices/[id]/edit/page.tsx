'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

export default function EditInvoicePage() {
  const { t } = useTranslation('common');
  const params = useParams();
  const router = useRouter();
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      setInvoiceId(params.id as string);
    }
  }, [params.id]);

  if (!invoiceId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-lg text-gray-700">{t('invoices.loading_invoice')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('invoices.edit_invoice')}</h1>
            <p className="text-gray-600 mb-8">{t('invoices.edit_invoice_description')}</p>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">{t('invoices.edit_not_implemented')}</p>
              <Link
                href="/invoices"
                className="inline-flex items-center px-4 py-2 bg-[#F13F33] text-white font-bold rounded-xl hover:bg-[#E03A2F] transition-all duration-300"
              >
                {t('invoices.back_to_invoices')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
