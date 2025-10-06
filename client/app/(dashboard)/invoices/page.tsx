"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  CreditCard,
  DollarSign,
  Clock,
} from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import ResponsiveInvoicesTable from "@/components/ui/ResponsiveInvoicesTable";
import { useTranslation } from "react-i18next";

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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function InvoicesPage() {
  const { t } = useTranslation("common");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  useEffect(() => {
    fetchInvoices(searchTerm, statusFilter, currentPage, itemsPerPage);
  }, [searchTerm, statusFilter, currentPage, itemsPerPage]);

  const fetchInvoices = async (search: string, status: string, page: number, limit: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status,
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await fetch(`/api/invoices?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.invoices && data.pagination) {
          setInvoices(data.invoices);
          setPagination(data.pagination);
        } else {
          // Fallback for old API format
          setInvoices(data);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalCount: data.length,
            limit: data.length,
            hasNextPage: false,
            hasPrevPage: false
          });
        }
      } else {
        setInvoices([]);
        setPagination({
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      setInvoices([]);
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove client-side filtering since we're now doing it server-side
  const filteredInvoices = invoices;


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.filter(invoice => invoice._id !== invoiceId));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const isOverdue = (dueDate: string) => {
    const invoice = invoices.find((i) => i.dueDate === dueDate);
    const isPaid = invoice?.status === "paid";
    return new Date(dueDate) < new Date() && !isPaid;
  };

  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const pendingAmount = invoices
    .filter((inv) => inv.status === "pending")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

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
              {t("invoices.title")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t("invoices.description")}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              href="/invoices/new"
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              <Plus className="me-2 h-4 w-4" />
              {t("invoices.create_invoice")}
            </Link>
          </div>
        </div>

      {/* Revenue Stats */}
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
                    {t("invoices.total_revenue")}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${totalRevenue.toFixed(2)}
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
                    {t("invoices.pending_amount")}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${pendingAmount.toFixed(2)}
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
                <CreditCard className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ms-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {t("invoices.total_invoices")}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {invoices.length}
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
                    placeholder={t("invoices.search_placeholder")}
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
                  <option value="all">{t("invoices.all_status")}</option>
                  <option value="pending">{t("estimates.pending")}</option>
                  <option value="paid">{t("invoices.paid")}</option>
                  <option value="cancelled">{t("appointments.cancelled")}</option>
                </select>
              </div>
              <div className="text-sm text-gray-500 text-center sm:text-end">
                {t(
                  pagination.totalCount === 1
                    ? "invoices.invoice_count"
                    : "invoices.invoice_count_plural",
                  { count: pagination.totalCount }
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <ResponsiveInvoicesTable
          invoices={filteredInvoices}
          isOverdue={isOverdue}
          onDeleteInvoice={handleDeleteInvoice}
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
        {filteredInvoices.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {t("invoices.no_invoices_found")}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? t("invoices.adjust_search")
                : t("invoices.get_started")}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <div className="mt-6">
                <Link
                  href="/invoices/new"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
                >
                  <Plus className="me-2 h-4 w-4" />
                  {t("invoices.create_invoice")}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
