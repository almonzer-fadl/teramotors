"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Wrench,
  Plus,
  Trash2,
  Save,
  Calculator,
  QrCode,
  User,
  Car,
  Package,
  Loader2,
  X,
  DollarSign,
} from "lucide-react";
import { useReferenceData } from "@/lib/stores/referenceDataStore";
import { fadeInUp } from "@/lib/dashboard-animations";
import SearchableComboBox from "@/components/ui/SearchableComboBox";

type Mode = "jobCard" | "manual";

interface ServiceLine {
  serviceId: string;
  name: string;
  quantity: number;
  laborHours: number;
  laborRate: number;
}

interface PartLine {
  partId: string;
  name: string;
  quantity: number;
  cost: number;
}

export default function InvoiceForm({ invoiceId }: { invoiceId?: string }) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const params = useSearchParams();
  const isEditing = !!invoiceId;

  const [mode, setMode] = useState<Mode>("jobCard");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  // Data from store
  const {
    customers,
    vehicles,
    services: availableServices,
    parts: availableParts,
    fetchCustomers,
    fetchVehicles,
    fetchServices,
    fetchParts,
    invalidateAll,
  } = useReferenceData();

  const [jobCards, setJobCards] = useState<any[]>([]);

  // Form state
  const [selectedJobCardId, setSelectedJobCardId] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [services, setServices] = useState<ServiceLine[]>([]);
  const [parts, setParts] = useState<PartLine[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [taxRate, setTaxRate] = useState<number>(15);
  const [discount, setDiscount] = useState<number>(0);
  const [status, setStatus] = useState("unpaid");

  // Load initial data for dropdowns
  useEffect(() => {
    fetchCustomers();
    fetchVehicles();
    fetchServices();
    fetchParts();

    const fetchJobCards = async () => {
      try {
        const res = await fetch("/api/job-cards");
        if (res.ok) {
          const data = await res.json();
          setJobCards(Array.isArray(data.jobCards) ? data.jobCards : Array.isArray(data) ? data : []);
        }
      } catch (error) {
      }
    };
    fetchJobCards();
  }, [fetchCustomers, fetchVehicles, fetchServices, fetchParts]);

  // Fetch existing invoice data if editing
  useEffect(() => {
    if (isEditing && invoiceId) {
      const fetchInvoice = async () => {
        setInitialLoading(true);
        try {
          const res = await fetch(`/api/invoices/${invoiceId}`);
          if (res.ok) {
            const { invoice } = await res.json();
            setInvoiceNumber(invoice.invoiceNumber || "");
            setInvoiceDate(new Date(invoice.invoiceDate).toISOString().split("T")[0]);
            setDueDate(invoice.dueDate ? new Date(invoice.dueDate).toISOString().split("T")[0] : "");
            setSelectedCustomerId(invoice.customerId?._id || "");
            setSelectedVehicleId(invoice.vehicleId?._id || "");
            setServices(invoice.services.map((s: any) => ({
              serviceId: s.serviceId?._id || '',
              name: s.name,
              quantity: s.quantity,
              laborHours: s.laborHours,
              laborRate: s.laborRate,
            })));
            setParts(invoice.parts.map((p: any) => ({
              partId: p.partId?._id || '',
              name: p.name,
              quantity: p.quantity,
              cost: p.cost,
            })));
            setTaxRate(invoice.taxRate ?? 15);
            setDiscount(invoice.discount ?? 0);
            setNotes(invoice.notes || "");
            setStatus(invoice.status || "unpaid");
            setMode("manual"); // Editing always defaults to manual
          }
        } catch (error) {
        } finally {
          setInitialLoading(false);
        }
      };
      fetchInvoice();
    }
  }, [invoiceId, isEditing]);

  // Handle URL param for creating from job card
  useEffect(() => {
    const jobCardIdFromUrl = params.get('jobCardId');
    if (jobCardIdFromUrl && jobCards.length > 0) {
      handleJobCardChange(jobCardIdFromUrl);
    }
  }, [params, jobCards]);

  const handleJobCardChange = async (jobCardId: string) => {
    setSelectedJobCardId(jobCardId);
    if (!jobCardId) return;

    try {
      const res = await fetch(`/api/job-cards/${jobCardId}`);
      if (res.ok) {
        const jobCard = await res.json();
        setSelectedCustomerId(jobCard.customerId?._id || "");
        setSelectedVehicleId(jobCard.vehicleId?._id || "");
        setServices(
          (jobCard.services || []).map((s: any) => ({
            serviceId: s.serviceId?._id,
            name: s.serviceId?.name,
            quantity: s.quantity || 1,
            laborHours: s.serviceId?.laborHours || 0,
            laborRate: s.serviceId?.laborRate || 0,
          }))
        );
        setParts(
          (jobCard.partsUsed || []).map((p: any) => ({
            partId: p.partId?._id,
            name: p.partId?.name,
            quantity: p.quantity || 1,
            cost: p.partId?.cost || 0,
          }))
        );
        setDiscount(jobCard.discount || 0);
      }
    } catch (error) {
    }
  };

  const totals = useMemo(() => {
    const servicesTotal = services.reduce((sum, s) => sum + s.quantity * s.laborHours * s.laborRate, 0);
    const partsTotal = parts.reduce((sum, p) => sum + p.quantity * p.cost, 0);
    const subtotal = servicesTotal + partsTotal;
    const taxAmount = partsTotal * (taxRate / 100);
    const discountAmount = (subtotal + taxAmount) * (discount / 100);
    const total = subtotal + taxAmount - discountAmount;
    return { servicesTotal, partsTotal, subtotal, taxAmount, discountAmount, total };
  }, [services, parts, taxRate, discount]);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      invoiceNumber,
      invoiceDate,
      dueDate,
      customerId: selectedCustomerId,
      vehicleId: selectedVehicleId,
      services,
      parts,
      taxRate,
      discount,
      notes,
      totalAmount: totals.total,
      status,
      jobCardId: mode === "jobCard" ? selectedJobCardId : undefined,
    };

    try {
      const url = isEditing ? `/api/invoices/${invoiceId}` : "/api/invoices";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        invalidateAll();
        router.push("/invoices");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to save invoice.");
      }
    } catch (error) {
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic line item handlers
  const addService = () => setServices([...services, { serviceId: '', name: "", quantity: 1, laborHours: 1, laborRate: 0 }]);
  const removeService = (index: number) => setServices(services.filter((_, i) => i !== index));
  const updateService = (index: number, field: keyof ServiceLine, value: any) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };
  const handleServiceSelect = (index: number, serviceId: string) => {
    const selected = availableServices.find(s => s._id === serviceId);
    if (selected) {
      const updated = [...services];
      updated[index] = {
        ...updated[index],
        serviceId: selected._id,
        name: selected.name,
        laborHours: selected.laborHours || 1,
        laborRate: selected.laborRate || 0,
      };
      setServices(updated);
    }
  };

  const addPart = () => setParts([...parts, { partId: '', name: "", quantity: 1, cost: 0 }]);
  const removePart = (index: number) => setParts(parts.filter((_, i) => i !== index));
  const updatePart = (index: number, field: keyof PartLine, value: any) => {
    const updated = [...parts];
    updated[index] = { ...updated[index], [field]: value };
    setParts(updated);
  };
  const handlePartSelect = (index: number, partId: string) => {
    const selected = availableParts.find(p => p._id === partId);
    if (selected) {
      const updated = [...parts];
      updated[index] = {
        ...updated[index],
        partId: selected._id,
        name: selected.name,
        cost: selected.cost || 0,
      };
      setParts(updated);
    }
  };

  const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
    />
  );
  const FormTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
      {...props}
      className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
    />
  );
  const FormLabel = ({ children, required = false }: { children: React.ReactNode, required?: boolean }) => (
    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#F97402]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#F97402] transition-all duration-200 group"
            >
              <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                {isEditing ? t("invoices.edit_invoice") : t("invoices.create_new_invoice")}
              </h1>
              <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                {isEditing ? t('invoices.update_invoice_details') : t('invoices.generate_professional_invoice')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mode Selection */}
          {!isEditing && (
            <motion.div variants={fadeInUp} className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Invoice Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["jobCard", "manual"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m as Mode)}
                    className={`p-6 rounded-2xl border-2 text-center transition-all duration-200 ${
                      mode === m
                        ? "border-[#F97402] bg-[#F97402]/10 ring-4 ring-[#F97402]/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                       {m === 'jobCard' ? <Wrench className="h-7 w-7 text-[#F97402]" /> : <FileText className="h-7 w-7 text-[#F97402]" />}
                      <span className="font-semibold text-gray-900 dark:text-white">{t(`invoices.${m === 'jobCard' ? 'from_job_card' : 'manual_entry'}`)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Details Section */}
          <motion.div variants={fadeInUp} className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <FormLabel>{t('invoices.invoice_number')}</FormLabel>
                <FormInput value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="e.g., INV-2024-001" />
              </div>
              <div className="space-y-2">
                <FormLabel required>{t('invoices.invoice_date')}</FormLabel>
                <FormInput type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <FormLabel>{t('invoices.due_date')}</FormLabel>
                <FormInput type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
          </motion.div>

          {/* Customer/Vehicle or Job Card Section */}
          <motion.div variants={fadeInUp} className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6">
            {mode === 'jobCard' && !isEditing ? (
              <div className="space-y-2">
                <FormLabel required>{t('invoices.select_job_card')}</FormLabel>
                <SearchableComboBox
                  options={jobCards.map(jc => ({
                    value: jc._id,
                    label: `${jc.invoiceNumber || jc.uniqueCode || 'N/A'} - ${jc.customerId ? `${jc.customerId.firstName} ${jc.customerId.lastName}` : t('forms.unknown_customer')}`
                  }))}
                  value={selectedJobCardId}
                  onChange={handleJobCardChange}
                  placeholder={t('invoices.search_job_card')}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <FormLabel required>{t('invoices.customer')}</FormLabel>
                   <SearchableComboBox
                    options={customers.map(c => ({ value: c._id, label: `${c.firstName} ${c.lastName}`}))}
                    value={selectedCustomerId}
                    onChange={setSelectedCustomerId}
                    placeholder={t('invoices.search_customer')}
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel required>{t('invoices.vehicle')}</FormLabel>
                   <SearchableComboBox
                    options={vehicles.filter(v => v.customerId?._id === selectedCustomerId).map(v => ({ value: v._id, label: `${v.make} ${v.model} (${v.licensePlate})`}))}
                    value={selectedVehicleId}
                    onChange={setSelectedVehicleId}
                    placeholder={t('invoices.search_vehicle')}
                    disabled={!selectedCustomerId}
                  />
                </div>
              </div>
            )}
          </motion.div>
          
          {/* Services */}
          <motion.div variants={fadeInUp} className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3"><Wrench className="text-[#F97402]"/>{t('services.services')}</h3>
                  <button type="button" onClick={addService} className="inline-flex items-center px-4 py-2 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#F97402]/10 hover:text-[#F97402] transition-all duration-200"><Plus className="h-4 w-4 me-2"/>{t('invoices.add_service')}</button>
              </div>
              <div className="space-y-4">
                  {services.map((service, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                          <div className="col-span-12 md:col-span-4 space-y-2">
                              <FormLabel>{t('invoices.service')}</FormLabel>
                              <SearchableComboBox options={availableServices.map(s => ({ value: s._id, label: s.name }))} value={service.serviceId} onChange={val => handleServiceSelect(index, val)} placeholder={t('invoices.select_service')} />
                          </div>
                          <div className="col-span-6 md:col-span-2 space-y-2"><FormLabel>{t('invoices.quantity')}</FormLabel><FormInput type="number" min="1" value={service.quantity} onChange={e => updateService(index, "quantity", parseInt(e.target.value))} /></div>
                          <div className="col-span-6 md:col-span-2 space-y-2"><FormLabel>{t('invoices.labor_hours')}</FormLabel><FormInput type="number" min="0" step="0.1" value={service.laborHours} onChange={e => updateService(index, "laborHours", parseFloat(e.target.value))} /></div>
                          <div className="col-span-10 md:col-span-3 space-y-2"><FormLabel>{t('invoices.labor_rate')}</FormLabel><FormInput type="number" min="0" step="0.01" value={service.laborRate} onChange={e => updateService(index, "laborRate", parseFloat(e.target.value))} /></div>
                          <div className="col-span-2 md:col-span-1"><button type="button" onClick={() => removeService(index)} className="p-3 text-red-500 rounded-xl hover:bg-red-500/10 transition-colors"><Trash2 className="h-5 w-5"/></button></div>
                      </div>
                  ))}
              </div>
          </motion.div>

          {/* Parts */}
           <motion.div variants={fadeInUp} className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3"><Package className="text-[#F97402]"/>{t('inventory.parts')}</h3>
                  <button type="button" onClick={addPart} className="inline-flex items-center px-4 py-2 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#F97402]/10 hover:text-[#F97402] transition-all duration-200"><Plus className="h-4 w-4 me-2"/>{t('invoices.add_part')}</button>
              </div>
              <div className="space-y-4">
                  {parts.map((part, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                          <div className="col-span-12 md:col-span-5 space-y-2">
                              <FormLabel>{t('inventory.part')}</FormLabel>
                              <SearchableComboBox options={availableParts.map(p => ({ value: p._id, label: p.name }))} value={part.partId} onChange={val => handlePartSelect(index, val)} placeholder={t('invoices.select_part')} />
                          </div>
                          <div className="col-span-6 md:col-span-3 space-y-2"><FormLabel>{t('invoices.quantity')}</FormLabel><FormInput type="number" min="1" value={part.quantity} onChange={e => updatePart(index, "quantity", parseInt(e.target.value))} /></div>
                          <div className="col-span-6 md:col-span-3 space-y-2"><FormLabel>{t('inventory.cost')}</FormLabel><FormInput type="number" min="0" step="0.01" value={part.cost} onChange={e => updatePart(index, "cost", parseFloat(e.target.value))} /></div>
                          <div className="col-span-12 md:col-span-1"><button type="button" onClick={() => removePart(index)} className="w-full p-3 text-red-500 rounded-xl hover:bg-red-500/10 transition-colors"><Trash2 className="h-5 w-5 mx-auto"/></button></div>
                      </div>
                  ))}
              </div>
          </motion.div>

          {/* Totals & Notes */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl"><span className="font-medium text-gray-600 dark:text-gray-400">{t('invoices.services_total')}</span><span className="font-semibold text-gray-900 dark:text-white">SAR {totals.servicesTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl"><span className="font-medium text-gray-600 dark:text-gray-400">{t('inventory.parts_total')}</span><span className="font-semibold text-gray-900 dark:text-white">SAR {totals.partsTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl"><span className="font-medium text-gray-600 dark:text-gray-400">{t('invoices.subtotal')}</span><span className="font-semibold text-gray-900 dark:text-white">SAR {totals.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl"><span className="font-medium text-gray-600 dark:text-gray-400">{t('invoices.tax')} ({taxRate}%)</span><span className="font-semibold text-gray-900 dark:text-white">SAR {totals.taxAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl"><span className="font-medium text-red-600 dark:text-red-400">{t('invoices.discount')} ({discount}%)</span><span className="font-semibold text-red-600 dark:text-red-400">-SAR {totals.discountAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center p-4 bg-gray-100/80 dark:bg-gray-900/80 rounded-2xl mt-4"><span className="text-lg font-bold text-gray-900 dark:text-white">{t('invoices.total')}</span><span className="text-lg font-bold text-[#F97402]">SAR {totals.total.toFixed(2)}</span></div>
              </div>
               <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6">
                  <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2"><FormLabel>{t('invoices.tax_rate')} (%)</FormLabel><FormInput type="number" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value))} min="0" /></div>
                      <div className="space-y-2"><FormLabel>{t('invoices.discount')} (%)</FormLabel><FormInput type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value))} min="0" /></div>
                      <div className="space-y-2"><FormLabel>{t('common.status')}</FormLabel>
                        <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200">
                          <option value="paid">Paid</option>
                          <option value="unpaid">Unpaid</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                      <div className="space-y-2"><FormLabel>{t('common.notes')}</FormLabel><FormTextarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} placeholder={t('invoices.add_notes_placeholder')}/></div>
                  </div>
              </div>
          </motion.div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => router.back()} className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#F97402] hover:text-[#F97402] hover:bg-[#F97402]/5 active:scale-[0.98] transition-all duration-200">
              <X className="inline-block me-2 h-5 w-5" />{t("forms.cancel")}
            </button>
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200">
              {loading ? <><Loader2 className="me-2 h-5 w-5 animate-spin" />{t("forms.saving")}</> : <><Save className="me-2 h-5 w-5" />{isEditing ? t("forms.update_invoice") : t("forms.save_invoice")}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
