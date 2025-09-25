'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = (params as any)?.id as string;
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

  const qrSrc = useMemo(() => {
    const qr = data?.invoice?.zatca?.qrCode;
    if (!qr) return null;
    if (typeof qr === 'string' && qr.startsWith('data:')) return qr;
    return `data:image/png;base64,${qr}`;
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-lg font-semibold text-gray-900">Invoice not found</h1>
          <div className="mt-4">
            <Link href="/invoices" className="btn">Back to Invoices</Link>
          </div>
        </div>
      </div>
    );
  }

  const { invoice, jobCard } = data;

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice #{invoice?._id?.slice(-6)}</h1>
          <p className="mt-1 text-sm text-gray-500">View invoice details and ZATCA QR code.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <a href={`/api/invoices/${id}/print`} className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500" target="_blank">عرض</a>
          <a href={`/api/invoices/${id}/pdf`} className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500" target="_blank" download>تحميل PDF</a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                <p className="mt-1 text-gray-900">
                  {invoice?.customerId?.firstName} {invoice?.customerId?.lastName}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Vehicle</h3>
                <p className="mt-1 text-gray-900">
                  {invoice?.vehicleId?.year} {invoice?.vehicleId?.make} {invoice?.vehicleId?.model} {invoice?.vehicleId?.licensePlate ? `(${invoice.vehicleId.licensePlate})` : ''}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1 text-gray-900">{invoice?.status}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Payment</h3>
                <p className="mt-1 text-gray-900">{invoice?.paymentStatus} {invoice?.paymentMethod ? `(${invoice.paymentMethod})` : ''}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                <p className="mt-1 text-gray-900">{invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total</h3>
                <p className="mt-1 text-gray-900">{Number(invoice?.totalAmount || 0).toFixed(2)}</p>
              </div>
            </div>

            {jobCard && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Job Card</h3>
                <div className="text-sm text-gray-700">
                  <div><span className="font-medium">Services:</span> {(jobCard.services || []).map((s: any) => s.serviceId?.name).filter(Boolean).join(', ') || '-'}</div>
                  <div><span className="font-medium">Parts:</span> {(jobCard.partsUsed || []).map((p: any) => p.partId?.name).filter(Boolean).join(', ') || '-'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">ZATCA QR Code</h3>
            {qrSrc ? (
              <div className="flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrSrc} alt="ZATCA QR" className="h-48 w-48 object-contain" />
              </div>
            ) : (
              <div className="text-sm text-gray-500">QR not available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


