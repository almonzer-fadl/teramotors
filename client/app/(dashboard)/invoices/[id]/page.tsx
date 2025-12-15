'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  FileText,
  User,
  Car,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  CreditCard,
  QrCode,
  Wrench,
  Package,
  Loader2,
} from 'lucide-react';
import { fadeInUp, scaleIn } from '@/lib/dashboard-animations';

export default function InvoiceDetailPage() {
  const { t } = useTranslation('common');
  const params = useParams();
  const router = useRouter();
  const id = (params as any)?.id as string;
  const [data, setData] = useState<{ invoice: any; jobCard: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const run = async () => {
      try {
        const res = await fetch(`/api/invoices/${id}`);
        if (!res.ok) {
          return notFound();
        }
        setData(await res.json());
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const qrSrc = useMemo(() => {
    const qrImage = data?.invoice?.zatca?.qrCodeImage;
    if (qrImage) {
      if (typeof qrImage === 'string' && qrImage.startsWith('data:')) return qrImage;
      return `data:image/png;base64,${qrImage}`;
    }
    const qr = data?.invoice?.zatca?.qrCode;
    if (!qr) return null;
    if (typeof qr === 'string' && qr.startsWith('data:')) return qr;
    return `data:image/png;base64,${qr}`;
  }, [data?.invoice?.zatca]);

  const { invoice, jobCard } = data || {};

  const InfoCard = ({ icon: Icon, label, value, iconBg = 'bg-gray-500' }: { icon: React.ElementType, label: string, value: React.ReactNode, iconBg?: string }) => (
    <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <div className="text-base font-semibold text-gray-900 dark:text-white">{value}</div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-[#F97402]" />
        </div>
      </div>
    );
  }

  if (!invoice) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#F97402] transition-all duration-200 group"
              >
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  {t('invoices.invoice')} #{invoice?.invoiceNumber || invoice?._id?.slice(-6)}
                </h1>
                <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                  {t('invoices.view_details')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/invoices/${id}/pdf`}
                target="_blank"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#F97402] hover:text-[#F97402] hover:bg-[#F97402]/5 active:scale-[0.98] transition-all duration-200"
              >
                <FileText className="me-2 h-5 w-5" />
                {t('common.view_pdf')}
              </Link>
              <Link
                href={`/invoices/${id}/edit`}
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Edit className="me-2 h-5 w-5" />
                {t('common.edit')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details Column */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden"
              variants={scaleIn}
            >
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoCard
                    icon={User}
                    label={t('customers.customer')}
                    value={`${invoice?.customerId?.firstName} ${invoice?.customerId?.lastName}`}
                    iconBg="bg-blue-500"
                  />
                  <InfoCard
                    icon={Car}
                    label={t('vehicles.vehicle')}
                    value={`${invoice?.vehicleId?.year} ${invoice?.vehicleId?.make} ${invoice?.vehicleId?.model}`}
                    iconBg="bg-red-500"
                  />
                  <InfoCard
                    icon={DollarSign}
                    label={t('invoices.total_amount')}
                    value={
                      <span className="font-bold text-green-600 dark:text-green-400">
                        SAR {Number(invoice?.totalAmount || 0).toFixed(2)}
                      </span>
                    }
                    iconBg="bg-green-500"
                  />
                  <InfoCard
                    icon={CheckCircle}
                    label={t('invoices.status')}
                    value={invoice?.status}
                    iconBg="bg-teal-500"
                  />
                  <InfoCard
                    icon={CreditCard}
                    label={t('invoices.payment_method')}
                    value={invoice?.paymentMethod || '-'}
                    iconBg="bg-indigo-500"
                  />
                  <InfoCard
                    icon={Calendar}
                    label={t('invoices.due_date')}
                    value={invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                    iconBg="bg-amber-500"
                  />
                </div>
              </div>
            </motion.div>

            {jobCard && (
              <motion.div
                className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden"
                variants={fadeInUp}
              >
                <div className="px-6 py-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center shadow-lg shadow-gray-500/25">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                      {t('job_cards.job_card_details')}
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center mb-2">
                        <Wrench className="w-4 h-4 me-2 text-cyan-500"/>
                        {t('services.services')}
                      </h3>
                      <p className="text-gray-800 dark:text-gray-200">
                        {(jobCard.services || []).map((s: any) => s.serviceId?.name).filter(Boolean).join(', ') || t('common.not_available')}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center mb-2">
                        <Package className="w-4 h-4 me-2 text-lime-500"/>
                        {t('inventory.parts_used')}
                      </h3>
                      <p className="text-gray-800 dark:text-gray-200">
                        {(jobCard.partsUsed || []).map((p: any) => p.partId?.name).filter(Boolean).join(', ') || t('common.not_available')}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* QR Code Column */}
          <motion.div
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden"
            variants={fadeInUp}
          >
            <div className="px-6 py-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-700 rounded-xl flex items-center justify-center shadow-lg shadow-gray-800/25">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  ZATCA QR Code
                </h2>
              </div>
              <div className="flex items-center justify-center p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                {qrSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrSrc} alt={t('ui.zatca_qr')} className="h-48 w-48 object-contain rounded-lg" />
                ) : (
                  <div className="text-sm text-gray-500 h-48 flex items-center justify-center">
                    {t('common.not_available')}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


