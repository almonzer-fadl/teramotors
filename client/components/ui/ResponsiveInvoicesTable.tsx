'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  Edit,
  Eye,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Car,
  DollarSign,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

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
  status: "pending" | "paid" | "cancelled";
  notes?: string;
  totalAmount: number;
  paidAmount?: number;
  dueDate: string;
  paymentMethod?: "cash" | "card" | "bank_transfer" | "other";
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
}

export default function ResponsiveInvoicesTable({
  invoices,
  isOverdue,
}: ResponsiveInvoicesTableProps) {
  const { t } = useTranslation('common');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return t('invoices.paid');
      case "cancelled":
        return t('appointments.cancelled');
      case "pending":
        return t('invoices.pending');
      default:
        return status;
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
                {t('invoices.invoice')}
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
                {t('invoices.due_date')}
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
            {invoices.map((invoice) => (
              <tr key={invoice._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ms-4">
                      <div className="text-sm font-medium text-gray-900">
                        INV-{invoice._id.slice(-6)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {invoice.customerId.firstName}{" "}
                    {invoice.customerId.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {invoice.vehicleId.year} {invoice.vehicleId.make}{" "}
                    {invoice.vehicleId.model}
                  </div>
                  <div className="text-sm text-gray-500">
                    {invoice.vehicleId.licensePlate}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${invoice.totalAmount.toFixed(2)}
                  </div>
                  {invoice.paidAmount && (
                    <div className="text-sm text-gray-500">
                      {t("invoices.paid_amount", {
                        amount: invoice.paidAmount.toFixed(2),
                      })}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`text-sm ${
                      isOverdue(invoice.dueDate)
                        ? "text-red-600 font-medium"
                        : "text-gray-900"
                    }`}
                  >
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </div>
                  {isOverdue(invoice.dueDate) && (
                    <div className="text-xs text-red-500">
                      {t("invoices.overdue")}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(invoice.status)}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {getStatusLabel(invoice.status)}
                    </span>
                    {invoice.zatca?.compliance?.isCompliant && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ZATCA ✓
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/invoices/${invoice._id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <a 
                      href={`/api/invoices/${invoice._id}/print`} 
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700" 
                      target="_blank"
                    >
                      <Eye className="h-3 w-3 me-1" />
                      {t('common.view')}
                    </a>
                    <a 
                      href={`/api/invoices/${invoice._id}/pdf`} 
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700" 
                      target="_blank"
                      download
                    >
                      <FileText className="h-3 w-3 me-1" />
                      PDF
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {invoices.map((invoice) => (
          <div key={invoice._id} className="bg-white shadow rounded-lg p-4 border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center me-3">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    INV-{invoice._id.slice(-6)}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(invoice.status)}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    invoice.status
                  )}`}
                >
                  {getStatusLabel(invoice.status)}
                </span>
              </div>
            </div>

            {/* Customer & Vehicle Info */}
            <div className="space-y-2 text-sm text-gray-700 mb-4">
              <div className="flex items-center">
                <User className="h-4 w-4 me-2 text-gray-500" />
                <span>
                  {invoice.customerId.firstName} {invoice.customerId.lastName}
                </span>
              </div>
              <div className="flex items-center">
                <Car className="h-4 w-4 me-2 text-gray-500" />
                <span>
                  {invoice.vehicleId.year} {invoice.vehicleId.make} {invoice.vehicleId.model}
                </span>
              </div>
              <div className="flex items-center">
                <span className="h-4 w-4 me-2 text-gray-500 text-xs">#</span>
                <span className="text-xs text-gray-500">
                  {invoice.vehicleId.licensePlate}
                </span>
              </div>
            </div>

            {/* Amount & Due Date */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 me-2 text-green-600" />
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    ${invoice.totalAmount.toFixed(2)}
                  </div>
                  {invoice.paidAmount && (
                    <div className="text-xs text-gray-500">
                      {t("invoices.paid_amount", {
                        amount: invoice.paidAmount.toFixed(2),
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-end">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 me-1 text-gray-500" />
                  <div
                    className={`text-sm ${
                      isOverdue(invoice.dueDate)
                        ? "text-red-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </div>
                </div>
                {isOverdue(invoice.dueDate) && (
                  <div className="flex items-center text-xs text-red-500 mt-1">
                    <AlertTriangle className="h-3 w-3 me-1" />
                    {t("invoices.overdue")}
                  </div>
                )}
              </div>
            </div>

            {/* ZATCA Compliance */}
            {invoice.zatca?.compliance?.isCompliant && (
              <div className="mb-4">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ZATCA ✓ {t('invoices.compliant')}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2 border-t border-gray-200 pt-3">
              <Link
                href={`/invoices/${invoice._id}/edit`}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="h-3 w-3 me-1" />
                {t('common.edit')}
              </Link>
              <a 
                href={`/api/invoices/${invoice._id}/print`} 
                className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700" 
                target="_blank"
              >
                <Eye className="h-3 w-3 me-1" />
                {t('common.view')}
              </a>
              <a 
                href={`/api/invoices/${invoice._id}/pdf`} 
                className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700" 
                target="_blank"
                download
              >
                <FileText className="h-3 w-3 me-1" />
                PDF
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
