'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
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
  paymentMethod: "cash" | "card" | "bank_transfer" | "check";
  paymentDate: string;
  status: "pending" | "completed" | "failed" | "refunded";
  reference: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ResponsivePaymentsTableProps {
  payments: Payment[];
  onStatusUpdate: (paymentId: string, newStatus: string) => void;
}

export default function ResponsivePaymentsTable({
  payments,
  onStatusUpdate,
}: ResponsivePaymentsTableProps) {
  const { t } = useTranslation('common');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "refunded":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return t('payments.status.completed');
      case "failed":
        return t('payments.status.failed');
      case "pending":
        return t('payments.status.pending');
      case "refunded":
        return t('payments.status.refunded');
      default:
        return status;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "cash":
        return <DollarSign className="h-4 w-4" />;
      case "bank_transfer":
        return <CreditCard className="h-4 w-4" />;
      case "check":
        return <FileText className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return t('payments.method.cash');
      case "card":
        return t('payments.method.card');
      case "bank_transfer":
        return t('payments.method.bank_transfer');
      case "check":
        return t('payments.method.check');
      default:
        return method;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('payments.payment')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('appointments.customer')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('appointments.vehicle')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('invoices.amount')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('payments.payment_method')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('payments.payment_date')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('customers.status')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('customers.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ms-4">
                      <div className="text-sm font-medium text-gray-900">
                        #{payment._id.slice(-8).toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.invoiceId?.invoiceNumber || 'N/A'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {payment.invoiceId?.customerId?.firstName || 'N/A'} {payment.invoiceId?.customerId?.lastName || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {payment.invoiceId?.vehicleId?.year || 'N/A'} {payment.invoiceId?.vehicleId?.make || 'N/A'} {payment.invoiceId?.vehicleId?.model || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {payment.invoiceId?.vehicleId?.licensePlate || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${payment.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('invoices.of_total', { total: payment.invoiceId?.total?.toFixed(2) || '0.00' })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getMethodIcon(payment.paymentMethod)}
                    <div className="ms-2">
                      <div className="text-sm font-medium text-gray-900">
                        {getMethodLabel(payment.paymentMethod)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.reference}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(payment.paymentDate).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(payment.status)}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {getStatusLabel(payment.status)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-col space-y-2">
                    {payment.status === "pending" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onStatusUpdate(payment._id, "completed")}
                          className="text-green-600 hover:text-green-800 text-xs font-medium px-2 py-1 rounded hover:bg-green-50 transition-colors"
                        >
                          {t('payments.mark_paid')}
                        </button>
                        <button
                          onClick={() => onStatusUpdate(payment._id, "failed")}
                          className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          {t('payments.mark_failed')}
                        </button>
                      </div>
                    )}
                    {payment.status === "completed" && (
                      <button
                        onClick={() => onStatusUpdate(payment._id, "refunded")}
                        className="text-gray-600 hover:text-gray-800 text-xs font-medium px-2 py-1 rounded hover:bg-gray-50 transition-colors"
                      >
                        {t('payments.refund')}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {payments.map((payment) => (
          <div key={payment._id} className="bg-white shadow rounded-lg p-4 border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center me-3">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    #{payment._id.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {payment.invoiceId?.invoiceNumber || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(payment.status)}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    payment.status
                  )}`}
                >
                  {getStatusLabel(payment.status)}
                </span>
              </div>
            </div>

            {/* Customer & Vehicle Info */}
            <div className="space-y-2 text-sm text-gray-700 mb-4">
              <div className="flex items-center">
                <User className="h-4 w-4 me-2 text-gray-500" />
                <span>
                  {payment.invoiceId?.customerId?.firstName || 'N/A'} {payment.invoiceId?.customerId?.lastName || 'N/A'}
                </span>
              </div>
              <div className="flex items-center">
                <Car className="h-4 w-4 me-2 text-gray-500" />
                <span>
                  {payment.invoiceId?.vehicleId?.year || 'N/A'} {payment.invoiceId?.vehicleId?.make || 'N/A'} {payment.invoiceId?.vehicleId?.model || 'N/A'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="h-4 w-4 me-2 text-gray-500 text-xs">#</span>
                <span className="text-xs text-gray-500">
                  {payment.invoiceId?.vehicleId?.licensePlate || 'N/A'}
                </span>
              </div>
            </div>

            {/* Amount & Payment Method */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 me-2 text-green-600" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    ${payment.amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t('invoices.of_total', { total: payment.invoiceId?.total?.toFixed(2) || '0.00' })}
                  </div>
                </div>
              </div>
              <div className="text-end">
                <div className="flex items-center">
                  {getMethodIcon(payment.paymentMethod)}
                  <div className="ms-2">
                    <div className="text-sm font-medium text-gray-900">
                      {getMethodLabel(payment.paymentMethod)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {payment.reference}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Date */}
            <div className="flex items-center mb-4">
              <Calendar className="h-4 w-4 me-2 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(payment.paymentDate).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(payment.paymentDate).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Notes */}
            {payment.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>{t('payments.notes')}:</strong> {payment.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2 border-t border-gray-200 pt-3">
              {payment.status === "pending" && (
                <>
                  <button
                    onClick={() => onStatusUpdate(payment._id, "completed")}
                    className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    {t('payments.mark_paid')}
                  </button>
                  <button
                    onClick={() => onStatusUpdate(payment._id, "failed")}
                    className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    {t('payments.mark_failed')}
                  </button>
                </>
              )}
              {payment.status === "completed" && (
                <button
                  onClick={() => onStatusUpdate(payment._id, "refunded")}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {t('payments.refund')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
