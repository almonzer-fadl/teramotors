'use client';

import type { ReactNode } from 'react';
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
} from 'lucide-react';
import { tableRowHover } from '@/lib/dashboard-animations';

interface Payment {
  _id: string;
  invoiceId: {
    _id: string;
    invoiceNumber: string;
    total: number;
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
  createdAt: string;
  updatedAt: string;
}

interface ResponsivePaymentsTableProps {
  payments: Payment[];
  onStatusUpdate: (paymentId: string, newStatus: string) => void;
}

const statusStyles: Record<
  Payment['status'],
  { badge: string; icon: ReactNode }
> = {
  completed: {
    badge:
      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    icon: <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />,
  },
  failed: {
    badge: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
    icon: <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />,
  },
  pending: {
    badge:
      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    icon: <Clock className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />,
  },
  refunded: {
    badge: 'bg-gray-100 dark:bg-gray-800/60 text-gray-800 dark:text-gray-300',
    icon: <XCircle className="h-4 w-4 text-gray-500 dark:text-gray-300" />,
  },
};

const methodIcons: Record<
  Payment['paymentMethod'],
  { icon: ReactNode; accent: string }
> = {
  card: {
    icon: <CreditCard className="h-4 w-4" />,
    accent: 'text-blue-600 dark:text-blue-400',
  },
  cash: {
    icon: <DollarSign className="h-4 w-4" />,
    accent: 'text-green-600 dark:text-green-400',
  },
  bank_transfer: {
    icon: <CreditCard className="h-4 w-4" />,
    accent: 'text-purple-600 dark:text-purple-400',
  },
  check: {
    icon: <FileText className="h-4 w-4" />,
    accent: 'text-orange-500 dark:text-orange-400',
  },
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(
    value || 0,
  );

const formatDate = (value: string) => new Date(value).toLocaleDateString();
const formatTime = (value: string) => new Date(value).toLocaleTimeString();

export default function ResponsivePaymentsTable({
  payments,
  onStatusUpdate,
}: ResponsivePaymentsTableProps) {
  const { t } = useTranslation('common');

  const getStatusLabel = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return t('payments.status.completed');
      case 'failed':
        return t('payments.status.failed');
      case 'pending':
        return t('payments.status.pending');
      case 'refunded':
        return t('payments.status.refunded');
      default:
        return status;
    }
  };

  const getMethodLabel = (method: Payment['paymentMethod']) => {
    switch (method) {
      case 'cash':
        return t('payments.method.cash');
      case 'card':
        return t('payments.method.card');
      case 'bank_transfer':
        return t('payments.method.bank_transfer');
      case 'check':
        return t('payments.method.check');
      default:
        return method;
    }
  };

  const renderActionButtons = (payment: Payment) => {
    if (payment.status === 'pending') {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onStatusUpdate(payment._id, 'completed')}
            className="inline-flex items-center rounded-md bg-[#F97402] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#F13F33] transition-colors"
          >
            {t('payments.mark_paid')}
          </button>
          <button
            onClick={() => onStatusUpdate(payment._id, 'failed')}
            className="inline-flex items-center rounded-md border border-transparent bg-red-600/10 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-600/20 transition-colors"
          >
            {t('payments.mark_failed')}
          </button>
        </div>
      );
    }

    if (payment.status === 'completed') {
      return (
        <button
          onClick={() => onStatusUpdate(payment._id, 'refunded')}
          className="inline-flex items-center rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {t('payments.refund')}
        </button>
      );
    }

    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('payments.payment')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('appointments.customer')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('appointments.vehicle')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('invoices.amount')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('payments.payment_method')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('payments.payment_date')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('customers.status')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('customers.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {payments.map((payment) => {
              const methodConfig = methodIcons[payment.paymentMethod];
              return (
                <motion.tr
                  key={payment._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  variants={tableRowHover}
                  initial="rest"
                  whileHover="hover"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 dark:bg-blue-900/30 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="ms-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          #{payment._id.slice(-8).toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.invoiceId?.invoiceNumber || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {payment.invoiceId?.customerId?.firstName || 'N/A'}{' '}
                    {payment.invoiceId?.customerId?.lastName || ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {payment.invoiceId?.vehicleId
                      ? `${payment.invoiceId.vehicleId.year} ${payment.invoiceId.vehicleId.make} ${payment.invoiceId.vehicleId.model}`
                      : t('vehicles.no_vehicle', { defaultValue: 'No vehicle data' })}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {payment.invoiceId?.vehicleId?.licensePlate || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(payment.amount)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {t('invoices.of_total', {
                      total: payment.invoiceId?.total?.toFixed(2) || '0.00',
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`me-2 ${methodConfig.accent}`}>
                      {methodConfig.icon}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {getMethodLabel(payment.paymentMethod)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {payment.reference || t('payments.no_reference', { defaultValue: 'N/A' })}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formatDate(payment.paymentDate)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTime(payment.paymentDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {statusStyles[payment.status].icon}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[payment.status].badge}`}
                    >
                      {getStatusLabel(payment.status)}
                    </span>
                  </div>
                </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {renderActionButtons(payment)}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {payments.map((payment) => {
          const methodConfig = methodIcons[payment.paymentMethod];
          return (
            <motion.div
              key={payment._id}
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              variants={tableRowHover}
              initial="rest"
              whileHover="hover"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 dark:bg-blue-900/30 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      #{payment._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {payment.invoiceId?.invoiceNumber || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusStyles[payment.status].icon}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[payment.status].badge}`}
                  >
                    {getStatusLabel(payment.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>
                    {payment.invoiceId?.customerId?.firstName || 'N/A'}{' '}
                    {payment.invoiceId?.customerId?.lastName || ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-gray-400" />
                  <span>
                    {payment.invoiceId?.vehicleId
                      ? `${payment.invoiceId.vehicleId.year} ${payment.invoiceId.vehicleId.make} ${payment.invoiceId.vehicleId.model}`
                      : t('vehicles.no_vehicle', { defaultValue: 'No vehicle data' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs">#</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {payment.invoiceId?.vehicleId?.licensePlate || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('invoices.of_total', {
                        total: payment.invoiceId?.total?.toFixed(2) || '0.00',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-end">
                  <div className="flex items-center justify-end gap-2 text-gray-600 dark:text-gray-300">
                    <span className={methodConfig.accent}>{methodConfig.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getMethodLabel(payment.paymentMethod)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {payment.reference || t('payments.no_reference', { defaultValue: 'N/A' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center mb-4 text-sm text-gray-700 dark:text-gray-300 gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDate(payment.paymentDate)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(payment.paymentDate)}
                  </div>
                </div>
              </div>

              {payment.notes && (
                <div className="mb-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>{t('payments.notes')}:</strong> {payment.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end border-t border-gray-100 dark:border-gray-800 pt-3">
                {renderActionButtons(payment)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
