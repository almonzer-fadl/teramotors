'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/simple-auth-client';
import { useState, useMemo } from 'react';
import {
  Trash2,
  Eye,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Car,
  DollarSign,
  Calendar,
  AlertTriangle,
  Printer,
  Search,
} from 'lucide-react';
import { tableRowHover } from '@/lib/dashboard-animations';

interface Invoice {
  _id: string;
  jobCardId: {
    _id: string;
  };
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
  mechanicId: {
    _id: string;
    fullName: string;
  };
  status: 'pending' | 'paid' | 'cancelled';
  notes?: string;
  totalAmount: number;
  paidAmount?: number;
  dueDate: string;
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'other';
  paymentDate?: string;
  createdAt: string;
  zatca?: {
    qrCode?: string;
    qrCodeImage?: string;
    invoiceNumber?: string;
    invoiceDate?: Date;
    vatAmount?: number;
    subtotal?: number;
    compliance?: {
      phase: number;
      isCompliant: boolean;
      errors: string[];
      warnings: string[];
    };
  };
}

interface ResponsiveInvoicesTableProps {
  invoices: Invoice[];
  isOverdue: (dueDate: string) => boolean;
  onDeleteInvoice?: (invoiceId: string) => void;
  onPrintInvoice?: (invoice: Invoice) => void;
}

const statusStyles: Record<
  Invoice['status'],
  { badge: string; iconColor: string }
> = {
  paid: {
    badge:
      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
    iconColor: 'text-green-500 dark:text-green-400',
  },
  cancelled: {
    badge: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
    iconColor: 'text-red-500 dark:text-red-400',
  },
  pending: {
    badge:
      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
    iconColor: 'text-yellow-500 dark:text-yellow-400',
  },
};

const getStatusIcon = (status: Invoice['status']) => {
  switch (status) {
    case 'paid':
      return <CheckCircle className="h-4 w-4" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(value);

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString();

export default function ResponsiveInvoicesTable({
  invoices,
  isOverdue,
  onDeleteInvoice,
  onPrintInvoice,
}: ResponsiveInvoicesTableProps) {
  const { t } = useTranslation('common');
  const { user } = useSession();
  const isAdmin = user?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');

  // Filter invoices based on search query
  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;

    const query = searchQuery.toLowerCase();
    return invoices.filter((invoice) => {
      // Search by customer name
      const customerName = `${invoice.customerId.firstName} ${invoice.customerId.lastName}`.toLowerCase();

      // Search by license plate
      const licensePlate = invoice.vehicleId?.licensePlate?.toLowerCase() || '';

      // Search by invoice number
      const invoiceNumber = `INV-${invoice._id.slice(-6)}`.toLowerCase();

      return (
        customerName.includes(query) ||
        licensePlate.includes(query) ||
        invoiceNumber.includes(query)
      );
    });
  }, [invoices, searchQuery]);

  const renderStatusLabel = (status: Invoice['status']) => {
    if (status === 'paid') return t('invoices.paid');
    if (status === 'cancelled') return t('appointments.cancelled');
    return t('invoices.pending');
  };

  const handleDelete = (invoiceId: string) => {
    if (!isAdmin || !onDeleteInvoice) return;
    if (window.confirm(t('invoices.delete_confirmation'))) {
      onDeleteInvoice(invoiceId);
    }
  };

  const handlePrint = (invoice: Invoice) => {
    if (onPrintInvoice) {
      onPrintInvoice(invoice);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full ps-10 pe-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#F97402] focus:border-transparent transition-colors"
            placeholder={t('invoices.search_placeholder', { defaultValue: 'Search by customer name, plate number, or invoice number...' })}
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('invoices.invoice')}
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
                {t('invoices.due_date')}
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
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('invoices.no_results', { defaultValue: 'No invoices found matching your search' })}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
              <motion.tr
                key={invoice._id}
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
                        INV-{invoice._id.slice(-6)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(invoice.createdAt)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {invoice.customerId.firstName} {invoice.customerId.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {invoice.vehicleId ? (
                      <>
                        {invoice.vehicleId.year} {invoice.vehicleId.make}{' '}
                        {invoice.vehicleId.model}
                      </>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">
                        {t('vehicles.no_vehicle', { defaultValue: 'No vehicle data' })}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {invoice.vehicleId?.licensePlate || (
                      <span className="text-gray-400 dark:text-gray-500 italic">
                        N/A
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(invoice.totalAmount)}
                  </div>
                  {invoice.paidAmount && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t('invoices.paid_amount', {
                        amount: invoice.paidAmount.toFixed(2),
                      })}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`text-sm ${
                      isOverdue(invoice.dueDate)
                        ? 'text-red-600 dark:text-red-400 font-medium'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {formatDate(invoice.dueDate)}
                  </div>
                  {isOverdue(invoice.dueDate) && (
                    <div className="text-xs text-red-500 dark:text-red-400">
                      {t('invoices.overdue')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className={statusStyles[invoice.status].iconColor}>
                      {getStatusIcon(invoice.status)}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[invoice.status].badge}`}
                    >
                      {renderStatusLabel(invoice.status)}
                    </span>
                    {invoice.zatca?.compliance?.isCompliant && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                        ZATCA ✓
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-3">
                    {isAdmin && onDeleteInvoice && (
                      <button
                        onClick={() => handleDelete(invoice._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        aria-label={t('common.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <Link
                      href={`/invoices/${invoice._id}`}
                      className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-[#F97402] hover:text-[#F13F33] transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      {t('common.view')}
                    </Link>
                    <button
                      onClick={() => handlePrint(invoice)}
                      className="inline-flex items-center gap-1 rounded-md bg-[#F97402] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#F13F33] transition-colors"
                    >
                      <Printer className="h-4 w-4" />
                      {t('invoices.print', { defaultValue: 'Print' })}
                    </button>
                  </div>
                </td>
              </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden p-4">
        {filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {t('invoices.no_results', { defaultValue: 'No invoices found matching your search' })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredInvoices.map((invoice) => (
          <motion.div
            key={invoice._id}
            className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            variants={tableRowHover}
            initial="rest"
            whileHover="hover"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 dark:bg-blue-900/30 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    INV-{invoice._id.slice(-6)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(invoice.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={statusStyles[invoice.status].iconColor}>
                  {getStatusIcon(invoice.status)}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[invoice.status].badge}`}
                >
                  {renderStatusLabel(invoice.status)}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 mb-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span>
                  {invoice.customerId.firstName} {invoice.customerId.lastName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-gray-400" />
                <span>
                  {invoice.vehicleId
                    ? `${invoice.vehicleId.year} ${invoice.vehicleId.make} ${invoice.vehicleId.model}`
                    : t('vehicles.no_vehicle', { defaultValue: 'No vehicle data' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 text-gray-400">#</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {invoice.vehicleId?.licensePlate || 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(invoice.totalAmount)}
                  </p>
                  {invoice.paidAmount && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('invoices.paid_amount', {
                        amount: invoice.paidAmount.toFixed(2),
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-end">
                <div className="flex items-center justify-end gap-1 text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span
                    className={`text-sm ${
                      isOverdue(invoice.dueDate)
                        ? 'text-red-600 dark:text-red-400 font-medium'
                        : ''
                    }`}
                  >
                    {formatDate(invoice.dueDate)}
                  </span>
                </div>
                {isOverdue(invoice.dueDate) && (
                  <div className="flex items-center justify-end text-xs text-red-500 dark:text-red-400 mt-1">
                    <AlertTriangle className="h-3 w-3 me-1" />
                    {t('invoices.overdue')}
                  </div>
                )}
              </div>
            </div>

            {invoice.zatca?.compliance?.isCompliant && (
              <div className="mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                  ZATCA ✓ {t('invoices.compliant')}
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
              {isAdmin && onDeleteInvoice && (
                <button
                  onClick={() => handleDelete(invoice._id)}
                  className="inline-flex items-center gap-1 rounded-md border border-transparent px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('common.delete')}
                </button>
              )}
              <Link
                href={`/invoices/${invoice._id}`}
                className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-[#F97402] hover:text-[#F13F33] transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                {t('common.view')}
              </Link>
              <button
                onClick={() => handlePrint(invoice)}
                className="inline-flex items-center gap-1 rounded-md bg-[#F97402] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#F13F33] transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                {t('invoices.print', { defaultValue: 'Print' })}
              </button>
            </div>
          </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
