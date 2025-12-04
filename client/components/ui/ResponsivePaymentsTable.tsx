'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  CreditCard,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Car,
  FileText,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { tableRowHover } from '@/lib/dashboard-animations';

interface Payment {
  _id: string;
  invoiceId: {
    _id: string;
    invoiceNumber: string;
    totalAmount: number;
    customerId: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    vehicleId: {
      _id: string;
      make: string;
      model: string;
      year: number;
      licensePlate: string;
    };
  };
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'check';
  paymentDate: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference: string;
  notes?: string;
}

interface ResponsivePaymentsTableProps {
  payments: Payment[];
  onStatusUpdate: (paymentId: string, newStatus: string) => void;
  onDelete: (paymentId: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const statusStyles = {
  completed: { badge: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400', icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
  failed: { badge: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400', icon: <XCircle className="h-4 w-4 text-red-500" /> },
  pending: { badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400', icon: <Clock className="h-4 w-4 text-yellow-500" /> },
  refunded: { badge: 'bg-gray-100 dark:bg-gray-800/60 text-gray-800 dark:text-gray-300', icon: <XCircle className="h-4 w-4 text-gray-500" /> },
};

const methodIcons = {
  card: { icon: <CreditCard className="h-4 w-4" />, accent: 'text-blue-600 dark:text-blue-400' },
  cash: { icon: <DollarSign className="h-4 w-4" />, accent: 'text-green-600 dark:text-green-400' },
  bank_transfer: { icon: <CreditCard className="h-4 w-4" />, accent: 'text-purple-600 dark:text-purple-400' },
  check: { icon: <FileText className="h-4 w-4" />, accent: 'text-orange-500 dark:text-orange-400' },
};

export default function ResponsivePaymentsTable({ payments, onStatusUpdate, onDelete, canEdit, canDelete }: ResponsivePaymentsTableProps) {
  const { t } = useTranslation('common');

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' }).format(value || 0);

  const ActionButtons = ({ payment }: { payment: Payment }) => (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/payments/${payment._id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300" title={t('common.view')}><Eye className="h-4 w-4" /></Link>
      {canEdit && <Link href={`/payments/${payment._id}/edit`} className="text-[#F97402] hover:text-[#F13F33]" title={t('common.edit')}><Edit className="h-4 w-4" /></Link>}
      {canDelete && <button onClick={() => onDelete(payment._id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300" title={t('common.delete')}><Trash2 className="h-4 w-4" /></button>}

      {payment.status === 'pending' && (
        <>
          <button
            onClick={() => onStatusUpdate(payment._id, 'completed')}
            className="inline-flex items-center rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-green-700 transition-colors"
            title={t('payments.mark_paid')}
          >
            {t('payments.mark_paid')}
          </button>
          <button
            onClick={() => onStatusUpdate(payment._id, 'failed')}
            className="inline-flex items-center rounded-md border border-transparent bg-red-600/10 px-2 py-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-600/20 transition-colors"
            title={t('payments.mark_failed')}
          >
            {t('payments.mark_failed')}
          </button>
        </>
      )}

      {payment.status === 'completed' && (
        <button
          onClick={() => onStatusUpdate(payment._id, 'refunded')}
          className="inline-flex items-center rounded-md border border-gray-200 dark:border-gray-700 px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          title={t('payments.refund')}
        >
          {t('payments.refund')}
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('payments.payment')}</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('customers.customer')}</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('vehicles.vehicle')}</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('invoices.amount')}</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('payments.payment_method')}</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('payments.payment_date')}</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.status')}</th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {payments.map((payment) => (
              <motion.tr key={payment._id} variants={tableRowHover} initial="rest" whileHover="hover" className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">#{payment._id.slice(-8).toUpperCase()}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{payment.invoiceId?.invoiceNumber || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{`${payment.invoiceId?.customerId?.firstName || ''} ${payment.invoiceId?.customerId?.lastName || ''}`}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{payment.invoiceId?.vehicleId ? `${payment.invoiceId.vehicleId.year} ${payment.invoiceId.vehicleId.make}` : '-'}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{payment.invoiceId?.vehicleId?.licensePlate || ''}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('invoices.of_total', { total: formatCurrency(payment.invoiceId?.totalAmount || 0) })}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={methodIcons[payment.paymentMethod]?.accent}>{methodIcons[payment.paymentMethod]?.icon}</span>
                    <span className="text-sm text-gray-900 dark:text-white">{t(`payments.method.${payment.paymentMethod}`)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[payment.status]?.badge}`}>
                    {statusStyles[payment.status]?.icon}
                    {t(`payments.status.${payment.status}`)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap"><ActionButtons payment={payment} /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {payments.map((payment) => (
          <motion.div key={payment._id} variants={tableRowHover} initial="rest" whileHover="hover" className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50">
            {/* Card content here... */}
            <div className="flex justify-end gap-2 border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <ActionButtons payment={payment} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
