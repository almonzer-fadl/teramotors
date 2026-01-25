"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  CreditCard,
  DollarSign,
  Clock,
} from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import ResponsiveInvoicesTable from "@/components/ui/ResponsiveInvoicesTable";
import PrintModal from "@/components/pdf/PrintModal";
import { useTranslation } from "react-i18next";
import { fadeInUp, staggerContainer } from "@/lib/dashboard-animations";

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

function InvoicesPageContent() {
  const { t } = useTranslation("common");
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
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

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedJobCard, setSelectedJobCard] = useState<any>(null);
  const [qrCodeData, setQrCodeData] = useState<string>("");

  useEffect(() => {
    fetchInvoices(statusFilter, currentPage, itemsPerPage);
  }, [statusFilter, currentPage, itemsPerPage]);

  useEffect(() => {
    const printInvoiceId = searchParams.get('print');
    if (printInvoiceId && invoices.length > 0) {
      const invoice = invoices.find(inv => inv._id === printInvoiceId);
      if (invoice) {
        handlePrintInvoice(invoice);
      }
    }
  }, [searchParams, invoices]);

  const fetchInvoices = async (status: string, page: number, limit: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
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

  const filteredInvoices = invoices;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to delete invoice');
      }

      alert(t('invoices.delete_success', { defaultValue: 'Invoice deleted successfully.' }));
      await fetchInvoices(statusFilter, currentPage, itemsPerPage);
    } catch (error) {
      alert(t('invoices.delete_failed', { defaultValue: 'Failed to delete invoice.' }));
    }
  };

  const handlePrintInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/invoices/${invoice._id}/view`);
      if (response.ok) {
        const data = await response.json();
        setSelectedInvoice(data.invoice);
        setSelectedJobCard(data.jobCard);

        const qrCode = data.invoice?.zatca?.qrCode || data.invoice?.zatca?.qrCodeImage;
        if (qrCode) {
          setQrCodeData(typeof qrCode === 'string' && qrCode.startsWith('data:')
            ? qrCode
            : `data:image/png;base64,${qrCode}`);
        } else {
          setQrCodeData('');
        }

        setShowPrintModal(true);
      } else {
      }
    } catch (error) {
    }
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97402]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-6">
      <motion.div
        className="space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" variants={fadeInUp}>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              {t('invoices.title')}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('invoices.description')}
            </p>
          </div>
          <Link
            href="/invoices/new"
            className="inline-flex items-center rounded-lg bg-[#F97402] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#F13F33] transition-colors"
          >
            <Plus className="me-2 h-4 w-4" />
            {t('invoices.create_invoice')}
          </Link>
        </motion.div>

        <motion.div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30" variants={fadeInUp}>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 focus:ring-[#F97402] focus:border-[#F97402]"
              >
                <option value="all">{t('invoices.all_status')}</option>
                <option value="pending">{t('invoices.pending')}</option>
                <option value="paid">{t('invoices.paid')}</option>
                <option value="cancelled">{t('appointments.cancelled')}</option>
              </select>
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-end">
                {t(filteredInvoices.length === 1 ? 'invoices.invoice_count' : 'invoices.invoice_count_plural', { count: filteredInvoices.length })}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <ResponsiveInvoicesTable
            invoices={filteredInvoices}
            isOverdue={isOverdue}
            onDeleteInvoice={handleDeleteInvoice}
            onPrintInvoice={handlePrintInvoice}
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalCount}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={(perPage) => {
              setItemsPerPage(perPage);
              setCurrentPage(1);
            }}
          />
        </motion.div>
      </motion.div>

      {selectedInvoice && (
        <PrintModal
          isOpen={showPrintModal}
          onClose={() => {
            setShowPrintModal(false);
            setSelectedInvoice(null);
            setSelectedJobCard(null);
          }}
          invoice={selectedInvoice}
          jobCard={selectedJobCard}
          language={'ar'}
        />
      )}
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97402]"></div>
        </div>
      }
    >
      <InvoicesPageContent />
    </Suspense>
  );
}
