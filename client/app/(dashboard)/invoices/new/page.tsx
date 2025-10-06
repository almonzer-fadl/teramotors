"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, FileText, Wrench, Plus, Trash2, Save, Calculator, QrCode } from "lucide-react";

type Mode = "jobCard" | "manual";

interface SelectOption {
  value: string;
  label: string;
}
type CustomerOption = SelectOption;
type VehicleOption = SelectOption;
type JobCardOption = SelectOption;

interface ServiceLine {
  name: string;
  quantity: number;
  laborHours: number;
  laborRate: number;
}

interface PartLine {
  name: string;
  quantity: number;
  cost: number;
}

function NewInvoiceContent() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const params = useSearchParams();

  const [mode, setMode] = useState<Mode>("jobCard");
  const [submitting, setSubmitting] = useState(false);

  // Job card flow
  const [jobCards, setJobCards] = useState<JobCardOption[]>([]);
  const [selectedJobCardId, setSelectedJobCardId] = useState<string>("");

  // Manual flow
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [availableParts, setAvailableParts] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [services, setServices] = useState<ServiceLine[]>([
    { name: "", quantity: 1, laborHours: 1, laborRate: 0 },
  ]);
  const [parts, setParts] = useState<PartLine[]>([{ name: "", quantity: 1, cost: 0 }]);

  // Common fields
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [taxRate, setTaxRate] = useState<number>(15);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [jobCardsRes, customersRes, vehiclesRes, servicesRes, partsRes] = await Promise.all([
          fetch("/api/job-cards"),
          fetch("/api/customers"),
          fetch("/api/vehicles"),
          fetch("/api/services"),
          fetch("/api/parts"),
        ]);

        if (jobCardsRes.ok) {
          const jobCardsData = await jobCardsRes.json();
          const jobCardsArray = Array.isArray(jobCardsData.jobCards) ? jobCardsData.jobCards : (Array.isArray(jobCardsData) ? jobCardsData : []);
          setJobCards(
            jobCardsArray.map((jc: any) => ({
              value: jc._id,
              label: `${jc.customerId?.firstName || ''} ${jc.customerId?.lastName || ''} - ${jc.vehicleId?.make || ''} ${jc.vehicleId?.model || ''}`,
            }))
          );
        }

        if (customersRes.ok) {
          const customersData = await customersRes.json();
          const customersArray = Array.isArray(customersData.customers) ? customersData.customers : (Array.isArray(customersData) ? customersData : []);
          setCustomers(
            customersArray.map((c: any) => ({
              value: c._id,
              label: `${c.firstName} ${c.lastName}`,
            }))
          );
        }

        if (vehiclesRes.ok) {
          const vehiclesData = await vehiclesRes.json();
          const vehiclesArray = Array.isArray(vehiclesData.vehicles) ? vehiclesData.vehicles : (Array.isArray(vehiclesData) ? vehiclesData : []);
          setVehicles(
            vehiclesArray.map((v: any) => ({
              value: v._id,
              label: `${v.make} ${v.model} (${v.year}) - ${v.licensePlate}`,
            }))
          );
        }

        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          const servicesArray = Array.isArray(servicesData) ? servicesData : [];
          setAvailableServices(servicesArray);
        }

        if (partsRes.ok) {
          const partsData = await partsRes.json();
          const partsArray = Array.isArray(partsData.parts) ? partsData.parts : (Array.isArray(partsData) ? partsData : []);
          setAvailableParts(partsArray);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);

  // Fetch job card details when selected
  const fetchJobCardDetails = async (jobCardId: string) => {
    if (!jobCardId) return;
    
    try {
      const response = await fetch(`/api/job-cards/${jobCardId}`);
      if (response.ok) {
        const jobCard = await response.json();
        
        // Set customer and vehicle
        setSelectedCustomerId(jobCard.customerId?._id || "");
        setSelectedVehicleId(jobCard.vehicleId?._id || "");
        
        // Convert job card services to invoice services
        if (jobCard.services && jobCard.services.length > 0) {
          const invoiceServices = jobCard.services.map((service: any) => ({
            name: service.serviceId?.name || "",
            quantity: service.quantity || 1,
            laborHours: service.laborHours || 0,
            laborRate: service.laborRate || 0,
          }));
          setServices(invoiceServices);
        }
        
        // Convert job card parts to invoice parts
        if (jobCard.partsUsed && jobCard.partsUsed.length > 0) {
          const invoiceParts = jobCard.partsUsed.map((part: any) => ({
            name: part.partId?.name || "",
            quantity: part.quantity || 1,
            cost: part.cost || 0,
          }));
          setParts(invoiceParts);
        }
      }
    } catch (error) {
      console.error("Failed to fetch job card details:", error);
    }
  };

  // Handle job card selection
  const handleJobCardChange = (jobCardId: string) => {
    setSelectedJobCardId(jobCardId);
    if (jobCardId) {
      fetchJobCardDetails(jobCardId);
    } else {
      // Reset to empty state
      setSelectedCustomerId("");
      setSelectedVehicleId("");
      setServices([{ name: "", quantity: 1, laborHours: 1, laborRate: 0 }]);
      setParts([{ name: "", quantity: 1, cost: 0 }]);
    }
  };

  // Calculate totals
  const totals = useMemo(() => {
    const servicesTotal = services.reduce(
      (sum, service) => sum + service.quantity * service.laborHours * service.laborRate,
      0
    );
    const partsTotal = parts.reduce(
      (sum, part) => sum + part.quantity * part.cost,
      0
    );
    const subtotal = servicesTotal + partsTotal;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    return { servicesTotal, partsTotal, subtotal, tax, total };
  }, [services, parts, taxRate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const invoiceData = {
        invoiceNumber,
        invoiceDate,
        dueDate,
        notes,
        taxRate,
        ...(mode === "jobCard"
          ? { jobCardId: selectedJobCardId }
          : {
              customerId: selectedCustomerId,
              vehicleId: selectedVehicleId,
              services,
              parts,
            }),
      };

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        const invoice = await response.json();
        router.push(`/invoices/${invoice._id}`);
      } else {
        throw new Error("Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  const addService = () => {
    setServices([...services, { name: "", quantity: 1, laborHours: 1, laborRate: 0 }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof ServiceLine, value: any) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const addPart = () => {
    setParts([...parts, { name: "", quantity: 1, cost: 0 }]);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, field: keyof PartLine, value: any) => {
    const updated = [...parts];
    updated[index] = { ...updated[index], [field]: value };
    setParts(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center">
              <Link
                href="/invoices"
                className="mr-6 p-3 text-gray-400 hover:text-[#F13F33] transition-all duration-300 rounded-2xl hover:bg-gray-100 group"
              >
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Create New Invoice
                </h1>
                <p className="mt-3 text-xl text-gray-600">
                  Generate a professional invoice for your services
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Mode Selection */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="mr-3 h-7 w-7 text-[#F13F33]" />
                Invoice Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMode("jobCard")}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    mode === "jobCard"
                      ? "border-[#F13F33] bg-[#F13F33]/10 shadow-lg"
                      : "border-gray-200 hover:border-gray-300 bg-white/50"
                  }`}
                >
                  <div className="text-center">
                    <Wrench className="h-8 w-8 mx-auto mb-3 text-[#F13F33]" />
                    <h3 className="text-lg font-bold text-gray-900">From Job Card</h3>
                    <p className="text-sm text-gray-600">Create invoice from completed job card</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("manual")}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                    mode === "manual"
                      ? "border-[#F13F33] bg-[#F13F33]/10 shadow-lg"
                      : "border-gray-200 hover:border-gray-300 bg-white/50"
                  }`}
                >
                  <div className="text-center">
                    <FileText className="h-8 w-8 mx-auto mb-3 text-[#F13F33]" />
                    <h3 className="text-lg font-bold text-gray-900">Manual Entry</h3>
                    <p className="text-sm text-gray-600">Create invoice manually</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="mr-3 h-7 w-7 text-[#F13F33]" />
                Invoice Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder="INV-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Job Card Selection */}
          {mode === "jobCard" && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              <div className="px-8 py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Wrench className="mr-3 h-7 w-7 text-[#F13F33]" />
                  Select Job Card
                </h2>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Job Card
                  </label>
                  <select
                    value={selectedJobCardId}
                    onChange={(e) => handleJobCardChange(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                    <option value="">Select a job card</option>
                    {jobCards.map((jobCard) => (
                      <option key={jobCard.value} value={jobCard.value}>
                        {jobCard.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Manual Entry */}
          {mode === "manual" && (
            <>
              {/* Customer and Vehicle Selection */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                <div className="px-8 py-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <FileText className="mr-3 h-7 w-7 text-[#F13F33]" />
                    Customer & Vehicle
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Customer
                      </label>
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                      >
                        <option value="">Select customer</option>
                        {customers.map((customer) => (
                          <option key={customer.value} value={customer.value}>
                            {customer.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Vehicle
                      </label>
                      <select
                        value={selectedVehicleId}
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                      >
                        <option value="">Select vehicle</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.value} value={vehicle.value}>
                            {vehicle.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                <div className="px-8 py-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <Wrench className="mr-3 h-7 w-7 text-[#F13F33]" />
                      Services
                    </h2>
                    <button
                      type="button"
                      onClick={addService}
                      className="group inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 text-sm font-bold rounded-2xl text-gray-700 bg-white hover:bg-gray-50 hover:border-[#F13F33] hover:text-[#F13F33] transition-all duration-300"
                    >
                      <Plus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                      Add Service
                    </button>
                  </div>
                  <div className="space-y-4">
                    {services.map((service, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start p-4 bg-gray-50/80 rounded-2xl">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Service
                          </label>
                          <select
                            value={service.name}
                            onChange={(e) => {
                              const selectedService = availableServices.find(s => s.name === e.target.value);
                              updateService(index, "name", e.target.value);
                              if (selectedService) {
                                updateService(index, "laborHours", selectedService.laborHours || 1);
                                updateService(index, "laborRate", selectedService.laborRate || 0);
                              }
                            }}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                          >
                            <option value="">Select a service</option>
                            {availableServices.map((service) => (
                              <option key={service._id} value={service.name}>
                                {service.name} - ${service.laborRate}/hr
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={service.quantity}
                            onChange={(e) => updateService(index, "quantity", parseInt(e.target.value))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Labor Hours
                          </label>
                          <input
                            type="number"
                            value={service.laborHours}
                            onChange={(e) => updateService(index, "laborHours", parseFloat(e.target.value))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                            min="0"
                            step="0.1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Labor Rate
                          </label>
                          <input
                            type="number"
                            value={service.laborRate}
                            onChange={(e) => updateService(index, "laborRate", parseFloat(e.target.value))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeService(index)}
                            className="text-red-500 hover:text-red-700 p-3 rounded-xl hover:bg-red-50 transition-all duration-300"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Parts */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                <div className="px-8 py-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <Wrench className="mr-3 h-7 w-7 text-[#F13F33]" />
                      Parts
                    </h2>
                    <button
                      type="button"
                      onClick={addPart}
                      className="group inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 text-sm font-bold rounded-2xl text-gray-700 bg-white hover:bg-gray-50 hover:border-[#F13F33] hover:text-[#F13F33] transition-all duration-300"
                    >
                      <Plus className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                      Add Part
                    </button>
                  </div>
                  <div className="space-y-4">
                    {parts.map((part, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start p-4 bg-gray-50/80 rounded-2xl">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Part
                          </label>
                          <select
                            value={part.name}
                            onChange={(e) => {
                              const selectedPart = availableParts.find(p => p.name === e.target.value);
                              updatePart(index, "name", e.target.value);
                              if (selectedPart) {
                                updatePart(index, "cost", selectedPart.cost || 0);
                              }
                            }}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                          >
                            <option value="">Select a part</option>
                            {availableParts.map((part) => (
                              <option key={part._id} value={part.name}>
                                {part.name} - ${part.cost}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={part.quantity}
                            onChange={(e) => updatePart(index, "quantity", parseInt(e.target.value))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Cost
                          </label>
                          <input
                            type="number"
                            value={part.cost}
                            onChange={(e) => updatePart(index, "cost", parseFloat(e.target.value))}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removePart(index)}
                            className="text-red-500 hover:text-red-700 p-3 rounded-xl hover:bg-red-50 transition-all duration-300"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tax and Notes */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Calculator className="mr-3 h-7 w-7 text-[#F13F33]" />
                Tax & Notes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300 resize-none"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Calculator className="mr-3 h-7 w-7 text-[#F13F33]" />
                Invoice Totals
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50/80 rounded-2xl">
                  <span className="text-lg font-bold text-gray-700">Services Total:</span>
                  <span className="text-lg font-bold text-gray-900">${totals.servicesTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50/80 rounded-2xl">
                  <span className="text-lg font-bold text-gray-700">Parts Total:</span>
                  <span className="text-lg font-bold text-gray-900">${totals.partsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50/80 rounded-2xl">
                  <span className="text-lg font-bold text-gray-700">Subtotal:</span>
                  <span className="text-lg font-bold text-gray-900">${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50/80 rounded-2xl">
                  <span className="text-lg font-bold text-gray-700">Tax ({taxRate}%):</span>
                  <span className="text-lg font-bold text-gray-900">${totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-6 bg-[#F13F33]/10 rounded-2xl border-2 border-[#F13F33]/20">
                  <span className="text-2xl font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-[#F13F33]">${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ZATCA QR Code Preview */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <QrCode className="mr-3 h-6 w-6 text-[#F13F33]" />
                ZATCA QR Code Preview
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-600">ZATCA Compliant</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
              <div className="text-center">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  QR code will be generated automatically when invoice is created
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Contains: Seller info, VAT number, timestamp, amounts
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="group inline-flex items-center px-8 py-4 border border-transparent text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-[#F13F33] to-[#d6352a] hover:shadow-xl hover:shadow-[#F13F33]/25 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
              {submitting ? t('ui.creating_invoice') : t('ui.create_invoice')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F13F33] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <NewInvoiceContent />
    </Suspense>
  );
}