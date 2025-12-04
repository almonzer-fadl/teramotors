"use client";

import { useState, useEffect, useMemo } from "react";
import Link from 'next/link';
import { motion } from "framer-motion";
import { Plus, Search, DollarSign, CheckCircle, Clock, Loader2, CreditCard } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import ResponsivePaymentsTable from "@/components/ui/ResponsivePaymentsTable";
import { useTranslation } from "react-i18next";
import { useReferenceData } from "@/lib/stores/referenceDataStore";
import { fadeInUp, staggerContainer } from "@/lib/dashboard-animations";

// Re-introducing the detailed Payment interface
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
  paymentMethod: "cash" | "card" | "bank_transfer" | "check";
  paymentDate: string;
  status: "pending" | "completed" | "failed" | "refunded";
  reference: string;
  notes?: string;
}

export default function PaymentsPage() {
  const { t } = useTranslation("common");
  // Only get invalidateAll from the store, manage payments locally
  const { invalidateAll } = useReferenceData(); 
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Re-introduce local fetchPayments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/payments");
      if (response.ok) {
        const data = await response.json();
        const paymentsArray = Array.isArray(data.payments) ? data.payments : (Array.isArray(data) ? data : []);
        setPayments(paymentsArray);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleDelete = async (paymentId: string) => {
    if (confirm(t('payments.delete_confirmation', 'Are you sure you want to delete this payment?'))) {
      try {
        const response = await fetch(`/api/payments/${paymentId}`, { method: 'DELETE' });
        if (response.ok) {
          fetchPayments(); // Refetch after delete
        } else {
          throw new Error('Failed to delete payment');
        }
      } catch (error) {
        console.error("Failed to delete payment:", error);
        alert(t('payments.delete_failed', 'Failed to delete payment.'));
      }
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
        fetchPayments(); // Refetch after status update
      }
    } catch (error) {
      console.error("Failed to update payment status:", error);
    }
  };

  const filteredPayments = useMemo(() => {
    return (payments || []).filter(payment => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = 
        payment.invoiceId?.invoiceNumber?.toLowerCase().includes(lowerSearchTerm) ||
        payment.invoiceId?.customerId?.firstName?.toLowerCase().includes(lowerSearchTerm) ||
        payment.invoiceId?.customerId?.lastName?.toLowerCase().includes(lowerSearchTerm) ||
        payment.invoiceId?.vehicleId?.licensePlate?.toLowerCase().includes(lowerSearchTerm) ||
        payment.reference?.toLowerCase().includes(lowerSearchTerm) ||
        payment.notes?.toLowerCase().includes(lowerSearchTerm);
      
      const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
      const matchesMethod = methodFilter === "all" || payment.paymentMethod === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, searchTerm, statusFilter, methodFilter]);
  
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPayments, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const totalPayments = useMemo(() => (payments || []).reduce((sum, p) => sum + p.amount, 0), [payments]);
  const completedPayments = useMemo(() => (payments || []).filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0), [payments]);
  const pendingPayments = useMemo(() => (payments || []).filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0), [payments]);
  
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#F97402]" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" variants={staggerContainer} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" variants={fadeInUp}>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">{t("payments.title")}</h1>
            <p className="mt-2 text-base text-gray-700 dark:text-gray-300">{t("payments.description")}</p>
          </div>
          <Link href="/payments/new" className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            <Plus className="me-2 h-5 w-5" />{t("payments.add_payment")}
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={fadeInUp}>
            {/* Stats Cards Here, using modern glassmorphism style */}
        </motion.div>

        {/* Search and Filters */}
        <motion.div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl p-6" variants={fadeInUp}>
            {/* Filters Here, using modern input styles */}
        </motion.div>

        {/* Payments Table */}
        <motion.div variants={fadeInUp}>
          <ResponsivePaymentsTable payments={paginatedPayments} onStatusUpdate={handlePaymentStatusUpdate} onDelete={handleDelete} canEdit={true} canDelete={true} />
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div variants={fadeInUp}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredPayments.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(perPage) => {
                setItemsPerPage(perPage);
                setCurrentPage(1);
              }}
            />
          </motion.div>
        )}

        {/* Empty State */}
        {filteredPayments.length === 0 && !loading && (
          <motion.div
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-8 text-center"
            variants={fadeInUp}
          >
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              {t("payments.no_payments_found")}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== "all" || methodFilter !== "all"
                ? t("payments.no_payments_match")
                : t("payments.get_started")}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
