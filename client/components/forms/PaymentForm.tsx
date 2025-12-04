"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft, Save, X, Loader2, DollarSign, CreditCard } from "lucide-react";
import { useReferenceData } from "@/lib/stores/referenceDataStore";
import { fadeInUp } from "@/lib/dashboard-animations";
import SearchableComboBox from "@/components/ui/SearchableComboBox";

interface PaymentFormData {
  invoiceId: string;
  amount: string;
  paymentMethod: "cash" | "card" | "bank_transfer" | "check";
  paymentDate: string;
  reference: string;
  notes: string;
  status: "pending" | "completed" | "failed" | "refunded";
}

export default function PaymentForm({ paymentId }: { paymentId?: string }) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const params = useSearchParams();
  const isEditing = !!paymentId;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const { invoices, fetchInvoices, invalidateAll } = useReferenceData();

  const [formData, setFormData] = useState<PaymentFormData>({
    invoiceId: "",
    amount: "",
    paymentMethod: "cash",
    paymentDate: new Date().toISOString().split("T")[0],
    reference: "",
    notes: "",
    status: "completed",
  });

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    const invoiceIdFromUrl = params.get('invoiceId');
    if (invoiceIdFromUrl) {
      handleInvoiceChange(invoiceIdFromUrl);
    }
  }, [params, invoices]);
  
  useEffect(() => {
    if (isEditing && paymentId) {
      const fetchPayment = async () => {
        setInitialLoading(true);
        try {
          const res = await fetch(`/api/payments/${paymentId}`);
          if (res.ok) {
            const { payment } = await res.json();
            setFormData({
              invoiceId: payment.invoiceId?._id || "",
              amount: payment.amount.toString(),
              paymentMethod: payment.paymentMethod,
              paymentDate: new Date(payment.paymentDate).toISOString().split("T")[0],
              reference: payment.reference || "",
              notes: payment.notes || "",
              status: payment.status || "completed",
            });
          }
        } catch (error) {
          console.error("Failed to fetch payment:", error);
        } finally {
          setInitialLoading(false);
        }
      };
      fetchPayment();
    }
  }, [paymentId, isEditing]);

  const handleInvoiceChange = (invoiceId: string) => {
    setFormData(prev => ({...prev, invoiceId}));
    const selectedInvoice = invoices.find(inv => inv._id === invoiceId);
    if (selectedInvoice && !isEditing) { // Only auto-fill amount on create
      setFormData(prev => ({
        ...prev,
        amount: selectedInvoice.totalAmount?.toString() || ""
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing ? `/api/payments/${paymentId}` : "/api/payments";
      const method = isEditing ? "PUT" : "POST";

      // The backend now handles customerId and paymentNumber generation
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        invalidateAll();
        router.push("/payments");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to save payment.");
      }
    } catch (error) {
      console.error("Failed to save payment:", error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  }

  const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200" />
  );
  const FormTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200" />
  );
  const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200" />
  );
  const FormLabel = ({ children, required = false }: { children: React.ReactNode, required?: boolean }) => (
    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );

  if (initialLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#F97402]" /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#F97402] transition-all duration-200 group">
              <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                {isEditing ? t("payments.edit_payment") : t("payments.add_payment")}
              </h1>
              <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                {isEditing ? t('payments.update_payment_details') : t('payments.record_new_payment')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={fadeInUp} className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F97402] to-[#F13F33] rounded-xl flex items-center justify-center me-4 shadow-lg shadow-[#F97402]/25">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                {t("payments.payment_details")}
              </h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <FormLabel required>{t("payments.select_invoice")}</FormLabel>
                <SearchableComboBox
                  options={invoices.map(inv => ({ value: inv._id, label: `${inv.invoiceNumber || inv.uniqueCode || 'N/A'} - ${inv.customerId?.firstName || ''} ${inv.customerId?.lastName || ''} (Total: ${inv.totalAmount?.toFixed(2)})` }))}
                  value={formData.invoiceId}
                  onChange={handleInvoiceChange}
                  placeholder={t("payments.select_invoice_placeholder")}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <FormLabel required>{t("payments.payment_amount")}</FormLabel>
                  <FormInput type="number" value={formData.amount} onChange={e => handleInputChange("amount", e.target.value)} placeholder="0.00" step="0.01" min="0" required />
                </div>
                <div className="space-y-2">
                  <FormLabel required>{t("payments.payment_method")}</FormLabel>
                  <FormSelect value={formData.paymentMethod} onChange={e => handleInputChange("paymentMethod", e.target.value)} required>
                    <option value="cash">{t("payments.method.cash")}</option>
                    <option value="card">{t("payments.method.card")}</option>
                    <option value="bank_transfer">{t("payments.method.bank_transfer")}</option>
                    <option value="check">{t("payments.method.check")}</option>
                  </FormSelect>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <FormLabel required>{t("payments.payment_date")}</FormLabel>
                  <FormInput type="date" value={formData.paymentDate} onChange={e => handleInputChange("paymentDate", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <FormLabel>{t("payments.reference_number")}</FormLabel>
                  <FormInput value={formData.reference} onChange={e => handleInputChange("reference", e.target.value)} placeholder={t("ui.enter_transaction_reference")} />
                </div>
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <FormLabel>{t("common.status")}</FormLabel>
                  <FormSelect value={formData.status} onChange={e => handleInputChange("status", e.target.value)}>
                    <option value="pending">{t("payments.status.pending")}</option>
                    <option value="completed">{t("payments.status.completed")}</option>
                    <option value="failed">{t("payments.status.failed")}</option>
                    <option value="refunded">{t("payments.status.refunded")}</option>
                  </FormSelect>
                </div>
              )}

              <div className="space-y-2">
                <FormLabel>{t("payments.notes")}</FormLabel>
                <FormTextarea value={formData.notes} onChange={e => handleInputChange("notes", e.target.value)} rows={3} placeholder={t("payments.additional_notes")} />
              </div>
            </div>
          </motion.div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => router.back()} className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#F97402] hover:text-[#F97402] hover:bg-[#F97402]/5 active:scale-[0.98] transition-all duration-200">
              <X className="inline-block me-2 h-5 w-5" />{t("forms.cancel")}
            </button>
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200">
              {loading ? <><Loader2 className="me-2 h-5 w-5 animate-spin" />{t("forms.saving")}</> : <><Save className="me-2 h-5 w-5" />{isEditing ? t("payments.update_payment") : t("payments.save_payment")}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}