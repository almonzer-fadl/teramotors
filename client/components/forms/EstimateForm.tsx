'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Plus, Trash2, Calculator, FileText, Settings, AlertTriangle, Wrench } from "lucide-react";
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
  description?: string;
  category: string;
  laborHours: number;
  laborRate: number;
  partsRequired?: { partId: string; quantity: number }[];
}
interface PartMinimal {
  _id: string;
  name: string;
  partNumber: string;
  sellingPrice: number;
  category: string;
}
interface InspectionMinimal {
  _id: string;
  vehicleId: {
    _id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  inspectionDate: string;
  overallCondition: string;
  items: {
    itemId: string;
    category: string;
    condition: string;
  }[];
}

interface EstimateFormData {
  inspectionId: string;
  customerId: string;
  vehicleId: string;
  status: "pending" | "approved" | "rejected";
  notes: string;
  services: {
    serviceId: string | null;
    name: string;
    quantity: number;
    laborCost: number;
    partsCost: number;
    totalCost: number;
  }[];
  parts: {
    partId: string | null;
    name: string;
    quantity: number;
    unitCost: number;
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
  const [parts, setParts] = useState<PartMinimal[]>([]);
  const [inspections, setInspections] = useState<InspectionMinimal[]>([]);
  const [formData, setFormData] = useState<EstimateFormData>({
    inspectionId: "",
    customerId: "",
    vehicleId: "",
    status: "pending",
    notes: "",
    services: [],
    parts: [],
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
  }, [isEditing, estimateId]);

  const fetchInitialData = async () => {
    try {
      const [customersRes, vehiclesRes, servicesRes, partsRes, inspectionsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/vehicles'),
        fetch('/api/services'),
        fetch('/api/parts'),
        fetch('/api/inspections')
      ]);

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        const customersArray = customersData.customers || customersData;
        setCustomers(Array.isArray(customersArray) ? customersArray : []);
      } else {
        setCustomers([]);
      }

      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json();
        const vehiclesArray = vehiclesData.vehicles || vehiclesData;
        setVehicles(Array.isArray(vehiclesArray) ? vehiclesArray : []);
      } else {
        setVehicles([]);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        const servicesArray = servicesData.services || servicesData;
        setServices(Array.isArray(servicesArray) ? servicesArray : []);
      } else {
        setServices([]);
      }

      if (partsRes.ok) {
        const partsData = await partsRes.json();
        const partsArray = partsData.parts || partsData;
        setParts(Array.isArray(partsArray) ? partsArray : []);
      } else {
        setParts([]);
      }

      if (inspectionsRes.ok) {
        const inspectionsData = await inspectionsRes.json();
        const inspectionsArray = inspectionsData.inspections || inspectionsData;
        setInspections(Array.isArray(inspectionsArray) ? inspectionsArray : []);
      } else {
        setInspections([]);
      }
    } catch (error) {
      setCustomers([]);
      setVehicles([]);
      setServices([]);
      setParts([]);
      setInspections([]);
    }
  };

  const fetchEstimate = async () => {
    try {
      const response = await fetch(`/api/estimates/${estimateId}`);
      if (response.ok) {
        const estimate = await response.json();

        const transformedServices = estimate.services?.map((service: any) => ({
          serviceId: service.serviceId && typeof service.serviceId === 'object' ? service.serviceId._id : service.serviceId,
          name: service.name || (service.serviceId && typeof service.serviceId === 'object' ? service.serviceId.name : ''),
          quantity: service.quantity || 1,
          laborCost: service.laborCost || 0,
          partsCost: service.partsCost || 0,
          totalCost: service.totalCost || 0,
        })) || [];

        const transformedParts = estimate.parts?.map((part: any) => ({
          partId: part.partId && typeof part.partId === 'object' ? part.partId._id : part.partId,
          name: part.name || (part.partId && typeof part.partId === 'object' ? part.partId.name : ''),
          quantity: part.quantity || 1,
          unitCost: part.unitCost || 0,
          totalCost: part.totalCost || 0,
        })) || [];

        setFormData({
          inspectionId: estimate.inspectionId?._id || estimate.inspectionId || "",
          customerId: estimate.customerId?._id || estimate.customerId || "",
          vehicleId: estimate.vehicleId?._id || estimate.vehicleId || "",
          status: estimate.status || "pending",
          notes: estimate.notes || "",
          services: transformedServices,
          parts: transformedParts,
          subtotal: estimate.subtotal || 0,
          tax: estimate.tax || 0,
          total: estimate.total || 0,
          validUntil: estimate.validUntil || "",
        });
      }
    } catch (error) {
    }
  };

  const handleInputChange = (field: keyof EstimateFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInspectionChange = async (inspectionId: string) => {
    if (!inspectionId) {
      setFormData(prev => ({
        ...prev,
        inspectionId: "",
        customerId: "",
        vehicleId: "",
        services: [],
        parts: []
      }));
      return;
    }

    try {
      const response = await fetch(`/api/inspections/${inspectionId}`);
      if (response.ok) {
        const inspection = await response.json();
        const jobCard = inspection.jobCardId;

        setFormData(prev => ({
          ...prev,
          inspectionId,
          customerId: jobCard?.customerId?._id || '',
          vehicleId: jobCard?.vehicleId?._id || '',
        }));

        const problematicItems = inspection.items.filter((item: any) =>
          ['poor', 'fair', 'critical'].includes(item.condition)
        );

        const autoServices = problematicItems.map((item: any) => ({
          serviceId: `auto-${item.itemId}`,
          name: `Repair ${item.itemId} (${item.category})`,
          quantity: 1,
          laborCost: 0,
          partsCost: 0,
          totalCost: 0,
        }));

        setFormData(prev => ({
          ...prev,
          services: autoServices,
          parts: []
        }));
      }
    } catch (error) {
    }
  };

  const addService = () => {
    const newService = {
      serviceId: null,
      name: t('ui.custom_service'),
      quantity: 1,
      laborCost: 0,
      partsCost: 0,
      totalCost: 0,
    };
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }));
  };

  const updateService = (index: number, field: string, value: any) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };

    updatedServices[index].totalCost =
      (updatedServices[index].laborCost + updatedServices[index].partsCost) * updatedServices[index].quantity;

    setFormData(prev => ({ ...prev, services: updatedServices }));
    calculateTotals();
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
    calculateTotals();
  };

  const addPart = () => {
    const newPart = {
      partId: null,
      name: t('ui.custom_part'),
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
    };
    setFormData(prev => ({
      ...prev,
      parts: [...prev.parts, newPart]
    }));
  };

  const updatePart = (index: number, field: string, value: any) => {
    const updatedParts = [...formData.parts];
    updatedParts[index] = { ...updatedParts[index], [field]: value };

    updatedParts[index].totalCost = updatedParts[index].unitCost * updatedParts[index].quantity;

    setFormData(prev => ({ ...prev, parts: updatedParts }));
    calculateTotals();
  };

  const removePart = (index: number) => {
    setFormData(prev => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index)
    }));
    calculateTotals();
  };

  const calculateTotals = () => {
    const servicesTotal = formData.services.reduce((sum, service) => sum + service.totalCost, 0);
    const partsTotal = formData.parts.reduce((sum, part) => sum + part.totalCost, 0);
    const subtotal = servicesTotal + partsTotal;
    const tax = partsTotal * 0.15;
    const total = subtotal + tax;

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.services, formData.parts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing ? `/api/estimates/${estimateId}` : '/api/estimates';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/estimates');
      } else {
        try {
          const errorData = await response.json();
          const errorMessage = errorData.details || errorData.error || 'Unknown error';
          alert(t('alerts.failed_to_save_estimate', { error: errorMessage }));
        } catch (parseError) {
          alert(t('alerts.failed_to_save_estimate_http', { status: response.status }));
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!formData.inspectionId) {
      alert(t('alerts.select_inspection_first'));
      return;
    }

    try {
      const currentLanguage = localStorage.getItem('i18nextLng') || 'en';
      window.open(`/api/estimates/${estimateId || 'new'}/pdf?lang=${currentLanguage}`, '_blank');
    } catch (error) {
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 gap-4">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="me-4 p-3 text-gray-600 dark:text-gray-400 hover:text-[#F97402] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
              >
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  {isEditing ? t('forms.edit_estimate') : t('forms.create_estimate')}
                </h1>
                <p className="mt-1 text-base text-gray-700 dark:text-gray-300">
                  {isEditing ? t('forms.edit_estimate_description') : t('forms.create_estimate_description')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={generatePDF}
                disabled={!formData.inspectionId}
                className="inline-flex items-center px-5 py-3 rounded-xl font-semibold text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#F97402] hover:text-[#F97402] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <FileText className="me-2 h-5 w-5" />
                {t('forms.generate_pdf')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
              >
                <Save className="me-2 h-5 w-5" />
                {loading ? t('forms.saving') : (isEditing ? t('forms.update') : t('forms.create'))}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Inspection Selection */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 sm:px-8 py-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center me-4">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{t('forms.inspection_details')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('forms.select_inspection')} *
                  </label>
                  <select
                    value={formData.inspectionId}
                    onChange={(e) => handleInspectionChange(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                  >
                    <option value="">{t('forms.select_inspection_placeholder')}</option>
                    {inspections && Array.isArray(inspections) && inspections.map((inspection) => {
                      const jobCard = (inspection as any).jobCardId;
                      return (
                        <option key={inspection._id} value={inspection._id}>
                          {jobCard?.vehicleId?.make} {jobCard?.vehicleId?.model} - {jobCard?.customerId?.firstName} {jobCard?.customerId?.lastName} ({new Date(inspection.inspectionDate).toLocaleDateString()})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('forms.valid_until')} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => handleInputChange("validUntil", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 sm:px-8 py-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center me-4">
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{t('forms.services')}</h2>
                </div>
                <button
                  type="button"
                  onClick={addService}
                  className="inline-flex items-center px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <Plus className="me-2 h-4 w-4" />
                  {t('forms.add_service')}
                </button>
              </div>

              <div className="space-y-4">
                {formData.services.map((service, index) => (
                  <div key={index} className="bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                      <div className="lg:col-span-2 space-y-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          {t('forms.service_name')} *
                        </label>
                        <select
                          value={service.serviceId || ""}
                          onChange={(e) => {
                            const selectedService = services.find(s => s._id === e.target.value);
                            if (selectedService) {
                              updateService(index, 'serviceId', selectedService._id);
                              updateService(index, 'name', selectedService.name);
                              updateService(index, 'laborCost', selectedService.laborRate * selectedService.laborHours);
                            } else {
                              updateService(index, 'serviceId', null);
                            }
                          }}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                        >
                          <option value="">{t('forms.select_service')}</option>
                          {services && Array.isArray(services) && services.map((service) => (
                            <option key={service._id} value={service._id}>
                              {service.name} - ${service.laborRate * service.laborHours}
                            </option>
                          ))}
                        </select>
                        {service.name && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>{t('forms.selected')}:</strong> {service.name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          {t('forms.quantity')} *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={service.quantity}
                          onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          {t('forms.labor_cost')}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={service.laborCost}
                          onChange={(e) => updateService(index, 'laborCost', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          {t('forms.parts_cost')}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={service.partsCost}
                          onChange={(e) => updateService(index, 'partsCost', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="w-full px-3 py-3 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                        >
                          <Trash2 className="h-5 w-5 mx-auto" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 text-right">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {t('forms.total')}: ${service.totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Parts */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 sm:px-8 py-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center me-4">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{t('forms.parts')}</h2>
                </div>
                <button
                  type="button"
                  onClick={addPart}
                  className="inline-flex items-center px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <Plus className="me-2 h-4 w-4" />
                  {t('forms.add_part')}
                </button>
              </div>

              <div className="space-y-4">
                {formData.parts.map((part, index) => (
                  <div key={index} className="bg-gray-50/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                      <div className="lg:col-span-2 space-y-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          {t('forms.part_name')} *
                        </label>
                        <select
                          value={part.partId || ""}
                          onChange={(e) => {
                            const selectedPart = parts.find(p => p._id === e.target.value);
                            if (selectedPart) {
                              updatePart(index, 'partId', selectedPart._id);
                              updatePart(index, 'name', selectedPart.name);
                              updatePart(index, 'unitCost', selectedPart.sellingPrice);
                            } else {
                              updatePart(index, 'partId', null);
                            }
                          }}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                        >
                          <option value="">{t('forms.select_part')}</option>
                          {parts && Array.isArray(parts) && parts.map((part) => (
                            <option key={part._id} value={part._id}>
                              {part.name} - ${part.sellingPrice}
                            </option>
                          ))}
                        </select>
                        {part.name && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>{t('forms.selected')}:</strong> {part.name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          {t('forms.quantity')} *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={part.quantity}
                          onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          {t('forms.unit_cost')}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={part.unitCost}
                          onChange={(e) => updatePart(index, 'unitCost', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removePart(index)}
                          className="w-full px-3 py-3 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                        >
                          <Trash2 className="h-5 w-5 mx-auto" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 text-right">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {t('forms.total')}: ${part.totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 sm:px-8 py-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center me-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{t('forms.additional_notes')}</h2>
              </div>

              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
                className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200 resize-none"
                placeholder={t('forms.notes_placeholder')}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 sm:px-8 py-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F97402] to-[#F13F33] rounded-2xl flex items-center justify-center me-4">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{t('forms.estimate_summary')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">{t('forms.subtotal')}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">${formData.subtotal.toFixed(2)}</p>
                </div>
                <div className="text-center p-6 bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">{t('forms.tax')} (15%)</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">${formData.tax.toFixed(2)}</p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-[#F97402]/10 to-[#F13F33]/10 dark:from-[#F97402]/20 dark:to-[#F13F33]/20 rounded-2xl border-2 border-[#F97402]/30">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">{t('forms.total')}</p>
                  <p className="text-4xl font-bold text-[#F97402]">${formData.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
