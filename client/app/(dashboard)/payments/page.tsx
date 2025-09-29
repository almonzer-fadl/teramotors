"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  CreditCard,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  X,
} from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import ResponsivePaymentsTable from "@/components/ui/ResponsivePaymentsTable";
import { useTranslation } from "react-i18next";

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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function PaymentsPage() {
  const { t } = useTranslation("common");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Payment creation form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "cash",
    paymentDate: new Date().toISOString().split("T")[0],
    reference: "",
    notes: ""
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/payments");
      if (response.ok) {
        const data = await response.json();
        const paymentsArray = Array.isArray(data.payments) ? data.payments : (Array.isArray(data) ? data : []);
        setPayments(paymentsArray);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalCount: paymentsArray.length,
          limit: paymentsArray.length,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/invoices");
      if (response.ok) {
        const data = await response.json();
        const invoicesArray = Array.isArray(data.invoices) ? data.invoices : (Array.isArray(data) ? data : []);
        setInvoices(invoicesArray);
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    }
  };

  const handlePaymentStatusUpdate = async (paymentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setPayments(prev => 
          prev.map(payment => 
            payment._id === paymentId 
              ? { ...payment, status: newStatus as any }
              : payment
          )
        );
      }
    } catch (error) {
      console.error("Failed to update payment status:", error);
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) return;

    setCreating(true);
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoiceId,
          ...paymentForm
        }),
      });

      if (response.ok) {
        // Refresh payments list
        await fetchPayments();
        // Reset form and close modal
        setPaymentForm({
          amount: "",
          paymentMethod: "cash",
          paymentDate: new Date().toISOString().split("T")[0],
          reference: "",
          notes: ""
        });
        setSelectedInvoiceId("");
        setShowCreateModal(false);
      } else {
        throw new Error("Failed to create payment");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      alert(t('alerts.payment_creation_failed'));
    } finally {
      setCreating(false);
    }
  };

  const handleInvoiceChange = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    const selectedInvoice = invoices.find(inv => inv._id === invoiceId);
    if (selectedInvoice) {
      setPaymentForm(prev => ({
        ...prev,
        amount: selectedInvoice.totalAmount?.toString() || ""
      }));
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.invoiceId?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceId?.customerId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceId?.customerId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceId?.vehicleId?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod = methodFilter === "all" || payment.paymentMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1);
  };

  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedPayments = payments.filter(p => p.status === 'completed').reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').reduce((sum, payment) => sum + payment.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t("payments.title")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t("payments.description")}
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              <Plus className="me-2 h-4 w-4" />
              {t("payments.add_payment")}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t("payments.total_payments")}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${totalPayments.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t("invoices.paid")}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${completedPayments.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t("payments.status.pending")}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${pendingPayments.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("payments.search_placeholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">{t("payments.all_statuses")}</option>
                  <option value="pending">{t("payments.status.pending")}</option>
                  <option value="completed">{t("payments.status.completed")}</option>
                  <option value="failed">{t("payments.status.failed")}</option>
                  <option value="refunded">{t("payments.status.refunded")}</option>
                </select>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">{t("payments.all_methods")}</option>
                  <option value="cash">{t("payments.method.cash")}</option>
                  <option value="card">{t("payments.method.card")}</option>
                  <option value="bank_transfer">{t("payments.method.bank_transfer")}</option>
                  <option value="check">{t("payments.method.check")}</option>
                </select>
              </div>
              <div className="text-sm text-gray-500 text-center sm:text-end">
                {t(
                  pagination.totalCount === 1
                    ? "payments.payment_count"
                    : "payments.payment_count_plural",
                  { count: pagination.totalCount }
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <ResponsivePaymentsTable
          payments={filteredPayments}
          onStatusUpdate={handlePaymentStatusUpdate}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-lg shadow">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalCount}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPageOptions={[10, 30, 50]}
              showItemsPerPage={true}
            />
          </div>
        )}

        {/* Empty State */}
        {filteredPayments.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {t("payments.no_payments_found")}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm || statusFilter !== "all" || methodFilter !== "all"
                ? t("payments.no_payments_match")
                : t("payments.get_started")}
            </p>
            {!searchTerm && statusFilter === "all" && methodFilter === "all" && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
                >
                  <Plus className="me-2 h-4 w-4" />
                  {t("payments.add_payment")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setShowCreateModal(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Plus className="me-3 h-6 w-6 text-blue-600" />
                    {t("payments.create_payment")}
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleCreatePayment} className="space-y-6">
                  {/* Invoice Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("payments.select_invoice")} *
                    </label>
                    <select
                      value={selectedInvoiceId}
                      onChange={(e) => handleInvoiceChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">{t("payments.select_invoice_placeholder")}</option>
                      {invoices.map((invoice) => (
                        <option key={invoice._id} value={invoice._id}>
                          {invoice.invoiceNumber} - {invoice.customerId?.firstName} {invoice.customerId?.lastName} - ${invoice.totalAmount}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("payments.payment_amount")} *
                      </label>
                      <input
                        type="number"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("payments.payment_method")} *
                      </label>
                      <select
                        value={paymentForm.paymentMethod}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="cash">{t("payments.method.cash")}</option>
                        <option value="card">{t("payments.method.card")}</option>
                        <option value="bank_transfer">{t("payments.method.bank_transfer")}</option>
                        <option value="check">{t("payments.method.check")}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Payment Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("payments.payment_date")} *
                      </label>
                      <input
                        type="date"
                        value={paymentForm.paymentDate}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Reference */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("payments.reference_number")}
                      </label>
                      <input
                        type="text"
                        value={paymentForm.reference}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder={t("ui.enter_transaction_reference")}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("payments.notes")}
                    </label>
                    <textarea
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={3}
                      placeholder={t("payments.additional_notes")}
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      {t("forms.cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creating ? t('ui.creating') : t('payments.create_payment')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}