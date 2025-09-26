'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Plus, Trash2, Calculator, FileText, Settings } from "lucide-react";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";

interface CustomerMinimal {
  _id: string;
  firstName: string;
  lastName: string;
}
interface VehicleMinimal {
  _id: string;
  make: string;
  model: string;
  year: number;
  customerId?: string;
}
interface ServiceMinimal {
  _id: string;
  name: string;
  laborHours?: number;
  laborRate?: number;
  partsRequired?: { partId: string; quantity: number }[];
}
interface PartMinimal {
  _id: string;
  sellingPrice: number;
}
interface MechanicMinimal {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}
interface JobCardMinimal {
  _id: string;
}

interface EstimateFormData {
  jobCardId: string;
  customerId: string;
  vehicleId: string;
  mechanicId: string;
  status: "pending" | "approved" | "rejected";
  notes: string;
  services: {
    serviceId: string;
    quantity: number;
    laborCost: number;
    partsCost: number;
    totalCost: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
}

export default function EstimateForm({ estimateId }: { estimateId?: string }) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerMinimal[]>([]);
  const [vehicles, setVehicles] = useState<VehicleMinimal[]>([]);
  const [services, setServices] = useState<ServiceMinimal[]>([]);
  const [mechanics, setMechanics] = useState<MechanicMinimal[]>([]);
  const [jobCards, setJobCards] = useState<JobCardMinimal[]>([]);
  const [parts, setParts] = useState<PartMinimal[]>([]);
  const [formData, setFormData] = useState<EstimateFormData>({
    jobCardId: "",
    customerId: "",
    vehicleId: "",
    mechanicId: "",
    status: "pending",
    notes: "",
    services: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    validUntil: "",
  });

  const isEditing = !!estimateId;

  useEffect(() => {
    fetchInitialData();
    if (isEditing) {
      fetchEstimate();
    }
  }, [estimateId]);

  useEffect(() => {
    calculateTotals();
  }, [formData.services]);

  const fetchInitialData = async () => {
    try {
      const [
        customersRes,
        vehiclesRes,
        servicesRes,
        mechanicsRes,
        jobCardsRes,
        partsRes,
      ] = await Promise.all([
        fetch("/api/customers"),
        fetch("/api/vehicles"),
        fetch("/api/services"),
        fetch("/api/mechanics"),
        fetch("/api/job-cards"),
        fetch("/api/parts"),
      ]);
      
      if (customersRes.ok) {
        const data = await customersRes.json();
        // The customers API returns { customers: [...], pagination: {...} }
        const customersArray = Array.isArray(data.customers) ? data.customers : (Array.isArray(data) ? data : []);
        setCustomers(customersArray);
      }
      
      if (vehiclesRes.ok) {
        const data = await vehiclesRes.json();
        // The vehicles API returns { vehicles: [...], pagination: {...} }
        const vehiclesArray = Array.isArray(data.vehicles) ? data.vehicles : (Array.isArray(data) ? data : []);
        setVehicles(vehiclesArray);
      }
      
      if (servicesRes.ok) {
        const data = await servicesRes.json();
        // The services API returns the array directly
        const servicesArray = Array.isArray(data) ? data : [];
        setServices(servicesArray);
      }
      
      if (mechanicsRes.ok) {
        const data = await mechanicsRes.json();
        // The mechanics API returns the array directly
        const mechanicsArray = Array.isArray(data) ? data : [];
        setMechanics(mechanicsArray);
      }
      
      if (jobCardsRes.ok) {
        const data = await jobCardsRes.json();
        // The job cards API returns { jobCards: [...], pagination: {...} }
        const jobCardsArray = Array.isArray(data.jobCards) ? data.jobCards : (Array.isArray(data) ? data : []);
        setJobCards(jobCardsArray);
      }
      
      if (partsRes.ok) {
        const data = await partsRes.json();
        // The parts API returns { parts: [...], pagination: {...} }
        const partsArray = Array.isArray(data.parts) ? data.parts : (Array.isArray(data) ? data : []);
        setParts(partsArray);
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      // Set empty arrays on error to prevent runtime errors
      setCustomers([]);
      setVehicles([]);
      setServices([]);
      setMechanics([]);
      setJobCards([]);
      setParts([]);
    }
  };

  const fetchEstimate = async () => {
    try {
      const response = await fetch(`/api/estimates/${estimateId}`);
      if (response.ok) {
        const estimate = await response.json();
        setFormData({
          ...estimate,
          validUntil: estimate.validUntil
            ? new Date(estimate.validUntil).toISOString().split("T")[0]
            : "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch estimate:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing ? `/api/estimates/${estimateId}` : "/api/estimates";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        socket.emit("appointment-created");
        router.push("/estimates");
      } else {
        const error = await response.json();
        alert(error.message || t('forms.failed_to_save_estimate'));
      }
    } catch (error) {
      console.error("Failed to save estimate:", error);
      alert(t('forms.failed_to_save_estimate'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = async (
    index: number,
    field: string,
    value: any
  ) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };

    if (field === "serviceId") {
      const selectedService = services.find((s) => s._id === value);
      if (selectedService) {
        const laborCost =
          (selectedService.laborHours || 0) * (selectedService.laborRate || 0);
        updatedServices[index].laborCost = laborCost;

        const partsCost = (selectedService.partsRequired || []).reduce(
          (acc, requiredPart) => {
            const partDetails = parts.find(
              (p) => p._id === requiredPart.partId
            );
            return (
              acc +
              (partDetails
                ? partDetails.sellingPrice * requiredPart.quantity
                : 0)
            );
          },
          0
        );
        updatedServices[index].partsCost = partsCost;

        updatedServices[index].totalCost =
          (laborCost + partsCost) * updatedServices[index].quantity;
      }
    } else if (field === "quantity") {
      const selectedService = services.find(
        (s) => s._id === updatedServices[index].serviceId
      );
      if (selectedService) {
        const laborCost =
          (selectedService.laborHours || 0) * (selectedService.laborRate || 0);
        const partsCost = (selectedService.partsRequired || []).reduce(
          (acc, requiredPart) => {
            const partDetails = parts.find(
              (p) => p._id === requiredPart.partId
            );
            return (
              acc +
              (partDetails
                ? partDetails.sellingPrice * requiredPart.quantity
                : 0)
            );
          },
          0
        );
        updatedServices[index].totalCost = (laborCost + partsCost) * value;
      }
    }

    handleInputChange("services", updatedServices);
  };

  const addService = () => {
    handleInputChange("services", [
      ...formData.services,
      { serviceId: "", quantity: 1, laborCost: 0, partsCost: 0, totalCost: 0 },
    ]);
  };

  const removeService = (index: number) => {
    const updatedServices = formData.services.filter((_, i) => i !== index);
    handleInputChange("services", updatedServices);
  };

  const calculateTotals = () => {
    const subtotal = formData.services.reduce(
      (acc, service) => acc + service.totalCost,
      0
    );
    const tax = subtotal * 0.1; // Example tax rate
    const total = subtotal + tax;
    setFormData((prev) => ({ ...prev, subtotal, tax, total }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-6 p-3 text-gray-400 hover:text-[#F13F33] transition-all duration-300 rounded-2xl hover:bg-gray-100 group"
              >
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {isEditing ? t('forms.edit_estimate') : t('forms.new_estimate')}
                </h1>
                <p className="mt-3 text-xl text-gray-600">
                  {isEditing
                    ? t('forms.update_estimate_details')
                    : t('forms.create_new_estimate')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Estimate Details */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center mr-4">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t('forms.estimate_details')}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.mechanic')}
                  </label>
                  <select
                    required
                    value={formData.mechanicId}
                    onChange={(e) =>
                      handleInputChange("mechanicId", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                    <option value="">{t('forms.assign_mechanic')}</option>
                    {mechanics.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.userId.firstName} {m.userId.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Fields for customer, vehicle, etc. */}
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#063479] to-[#052a5f] rounded-2xl flex items-center justify-center mr-4">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t('forms.services')}</h3>
              </div>
              {formData.services.map((service, index) => (
                <div
                  key={index}
                  className="grid grid-cols-6 gap-4 items-center mb-4"
                >
                  <div className="col-span-2 space-y-2">
                    <label className="block text-sm font-bold text-gray-700">{t('forms.service')}</label>
                    <select
                      value={service.serviceId}
                      onChange={(e) =>
                        handleServiceChange(index, "serviceId", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    >
                      <option value="">{t('forms.select_service')}</option>
                      {services.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">{t('forms.qty')}</label>
                    <input
                      type="number"
                      value={service.quantity}
                      onChange={(e) =>
                        handleServiceChange(
                          index,
                          "quantity",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">{t('forms.labor_cost')}</label>
                    <input
                      type="number"
                      value={service.laborCost.toFixed(2)}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100/80 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">{t('forms.parts_cost')}</label>
                    <input
                      type="number"
                      value={service.partsCost.toFixed(2)}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100/80 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">{t('forms.total')}</label>
                    <input
                      type="number"
                      value={service.totalCost.toFixed(2)}
                      readOnly
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100/80 backdrop-blur-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addService}
                className="mt-4 inline-flex items-center px-4 py-2 border border-dashed border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('forms.add_service')}
              </button>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mr-4">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t('forms.cost_summary')}
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center p-6 bg-gray-50/80 rounded-2xl">
                  <span className="text-lg font-bold text-gray-700">{t('forms.subtotal')}:</span>
                  <div className="text-2xl font-bold text-gray-900">${formData.subtotal.toFixed(2)}</div>
                </div>
                <div className="text-center p-6 bg-gray-50/80 rounded-2xl">
                  <span className="text-lg font-bold text-gray-700">{t('forms.tax')}:</span>
                  <div className="text-2xl font-bold text-gray-900">${formData.tax.toFixed(2)}</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-r from-[#F13F33] to-[#d6352a] rounded-2xl">
                  <span className="text-lg font-bold text-white">{t('forms.total')}:</span>
                  <div className="text-3xl font-bold text-white">${formData.total.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="group inline-flex items-center px-8 py-4 border-2 border-gray-300 text-sm font-bold rounded-2xl text-gray-700 bg-white hover:border-[#F13F33] hover:text-[#F13F33] hover:bg-[#F13F33]/5 transition-all duration-300"
            >
              <X className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
              {t('forms.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group inline-flex items-center px-8 py-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-[#F13F33] to-[#d6352a] hover:shadow-xl hover:shadow-[#F13F33]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5"
            >
              <Save className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
              {loading
                ? t('forms.saving')
                : isEditing
                ? t('forms.update_estimate')
                : t('forms.save_estimate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}