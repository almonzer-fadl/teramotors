'use client';

import { useEffect, useState } from 'react';
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
  CreditCard,
  Loader2,
  Hash,
  Book,
} from 'lucide-react';
import { fadeInUp, scaleIn } from '@/lib/dashboard-animations';

export default function PaymentDetailPage() {
  const { t } = useTranslation('common');
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const fetchPayment = async () => {
      try {
        const res = await fetch(`/api/payments/${id}`);
        if (!res.ok) {
          return notFound();
        }
        const { payment } = await res.json();
        setPayment(payment);
      } catch (error) {
        console.error('Failed to fetch payment:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [id]);

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
              <button onClick={() => router.back()} className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
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

  if (!payment) {
    return notFound();
  }

  const customerName = `${payment.invoiceId?.customerId?.firstName || ''} ${payment.invoiceId?.customerId?.lastName || ''}`.trim() || t('forms.unknown_customer');
  const vehicleName = `${payment.invoiceId?.vehicleId?.make || ''} ${payment.invoiceId?.vehicleId?.model || ''} (${payment.invoiceId?.vehicleId?.licensePlate || 'N/A'})`.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#F97402] transition-all duration-200 group">
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  {t('payments.payment_details')}
                </h1>
                <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                  {t('payments.payment_id', { id: payment._id.slice(-6) })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/invoices/${payment.invoiceId?._id}`} className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#F97402] hover:text-[#F97402] hover:bg-[#F97402]/5 active:scale-[0.98] transition-all duration-200">
                <FileText className="me-2 h-5 w-5" />
                {t('payments.view_invoice')}
              </Link>
              <Link href={`/payments/${id}/edit`} className="inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                <Edit className="me-2 h-5 w-5" />
                {t('common.edit')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden"
          variants={scaleIn}
          initial="hidden"
          animate="visible"
        >
          <div className="px-6 py-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoCard icon={DollarSign} label={t('payments.payment_amount')} value={<span className="font-bold text-green-600 dark:text-green-400">SAR {Number(payment.amount || 0).toFixed(2)}</span>} iconBg="bg-green-500" />
                <InfoCard icon={CheckCircle} label={t('common.status')} value={payment.status} iconBg="bg-teal-500" />
                <InfoCard icon={CreditCard} label={t('payments.payment_method')} value={payment.paymentMethod} iconBg="bg-indigo-500" />
                <InfoCard icon={Calendar} label={t('payments.payment_date')} value={new Date(payment.paymentDate).toLocaleDateString()} iconBg="bg-amber-500" />
                <InfoCard icon={Hash} label={t('payments.reference')} value={payment.reference || '-'} iconBg="bg-blue-500" />
                <InfoCard icon={User} label={t('customers.customer')} value={customerName} iconBg="bg-purple-500" />
                <InfoCard icon={Car} label={t('vehicles.vehicle')} value={vehicleName} iconBg="bg-pink-500" />
              </div>
              {payment.notes && (
                 <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center mb-2">
                        <Book className="w-4 h-4 me-2 text-gray-400"/>
                        {t('common.notes')}
                    </h3>
                    <p className="text-gray-800 dark:text-gray-200 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 whitespace-pre-wrap">{payment.notes}</p>
                 </div>
              )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
