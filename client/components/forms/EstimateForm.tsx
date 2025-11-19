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
        // The API returns { customers: [...] } so we need to extract the customers array
        const customersArray = customersData.customers || customersData;
        setCustomers(Array.isArray(customersArray) ? customersArray : []);
      } else {
        setCustomers([]);
      }
      
      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json();
        // The API returns { vehicles: [...] } so we need to extract the vehicles array
        const vehiclesArray = vehiclesData.vehicles || vehiclesData;
        setVehicles(Array.isArray(vehiclesArray) ? vehiclesArray : []);
      } else {
        setVehicles([]);
      }
      
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        // The API returns { services: [...] } so we need to extract the services array
        const servicesArray = servicesData.services || servicesData;
        setServices(Array.isArray(servicesArray) ? servicesArray : []);
      } else {
        setServices([]);
      }
      
      if (partsRes.ok) {
        const partsData = await partsRes.json();
        // The API returns { parts: [...] } so we need to extract the parts array
        const partsArray = partsData.parts || partsData;
        setParts(Array.isArray(partsArray) ? partsArray : []);
      } else {
        setParts([]);
      }

      if (inspectionsRes.ok) {
        const inspectionsData = await inspectionsRes.json();
        // The API returns { inspections: [...] } so we need to extract the inspections array
        const inspectionsArray = inspectionsData.inspections || inspectionsData;
        setInspections(Array.isArray(inspectionsArray) ? inspectionsArray : []);
      } else {
        setInspections([]);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      // Ensure all arrays are initialized even if there's an error
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
        
        // Transform services to match form data structure
        const transformedServices = estimate.services?.map((service: any) => ({
          serviceId: service.serviceId && typeof service.serviceId === 'object' ? service.serviceId._id : service.serviceId,
          name: service.name || (service.serviceId && typeof service.serviceId === 'object' ? service.serviceId.name : ''),
          quantity: service.quantity || 1,
          laborCost: service.laborCost || 0,
          partsCost: service.partsCost || 0,
          totalCost: service.totalCost || 0,
        })) || [];
        
        // Transform parts to match form data structure
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
      console.error('Error fetching estimate:', error);
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

        // Auto-populate customer and vehicle
        setFormData(prev => ({
          ...prev,
          inspectionId,
          customerId: jobCard?.customerId?._id || '',
          vehicleId: jobCard?.vehicleId?._id || '',
        }));

        // Auto-populate services from inspection items with poor/fair/critical condition
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
      console.error('Error fetching inspection:', error);
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
    
    // Calculate total cost
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
    
    // Calculate total cost
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
    const tax = partsTotal * 0.15; // 15% tax ONLY on parts
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
      console.error('Error saving estimate:', error);
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
      // Get current language from i18n
      const currentLanguage = localStorage.getItem('i18nextLng') || 'en';
      // Open PDF in new tab for viewing with language parameter
      window.open(`/api/estimates/${estimateId || 'new'}/pdf?lang=${currentLanguage}`, '_blank');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-[#F13F33] hover:bg-[#F13F33]/10 rounded-xl transition-all duration-300"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? t('forms.edit_estimate') : t('forms.create_estimate')}
                </h1>
                <p className="text-sm text-gray-500">
                  {isEditing ? t('forms.edit_estimate_description') : t('forms.create_estimate_description')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={generatePDF}
                disabled={!formData.inspectionId}
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300 font-medium disabled:opacity-50"
              >
                <FileText className="mr-2 h-4 w-4" />
                {t('forms.generate_pdf')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 bg-[#F13F33] text-white font-bold rounded-xl hover:bg-[#E03A2F] disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Save className="mr-2 h-5 w-5" />
                {loading ? t('forms.saving') : (isEditing ? t('forms.update') : t('forms.create'))}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Inspection Selection */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="px-6 py-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 rounded-xl mr-4">
                  <AlertTriangle className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t('forms.inspection_details')}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    {t('forms.select_inspection')} *
                  </label>
                  <select
                    value={formData.inspectionId}
                    onChange={(e) => handleInspectionChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
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
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    {t('forms.valid_until')} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => handleInputChange("validUntil", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-xl mr-4">
                    <Wrench className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{t('forms.services')}</h2>
                </div>
                <button
                  type="button"
                  onClick={addService}
                  className="inline-flex items-center px-4 py-2 bg-[#F13F33] text-white font-bold rounded-xl hover:bg-[#E03A2F] transition-all duration-300"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('forms.add_service')}
                </button>
              </div>

              <div className="space-y-4">
              {formData.services.map((service, index) => (
                  <div key={index} className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300"
                        >
                          <option value="">{t('forms.select_service')}</option>
                          {services && Array.isArray(services) && services.map((service) => (
                            <option key={service._id} value={service._id}>
                              {service.name} - ${service.laborRate * service.laborHours}
                            </option>
                          ))}
                        </select>
                        {service.name && (
                          <p className="mt-2 text-sm text-gray-600">
                            <strong>{t('forms.selected')}:</strong> {service.name}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {t('forms.quantity')} *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={service.quantity}
                          onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {t('forms.labor_cost')}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={service.laborCost}
                          onChange={(e) => updateService(index, 'laborCost', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {t('forms.parts_cost')}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={service.partsCost}
                          onChange={(e) => updateService(index, 'partsCost', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="w-full px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-right">
                      <span className="text-lg font-bold text-gray-900">
                        {t('forms.total')}: ${service.totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Parts */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-xl mr-4">
                    <Settings className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{t('forms.parts')}</h2>
                </div>
                <button
                  type="button"
                  onClick={addPart}
                  className="inline-flex items-center px-4 py-2 bg-[#F13F33] text-white font-bold rounded-xl hover:bg-[#E03A2F] transition-all duration-300"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t('forms.add_part')}
                </button>
              </div>

              <div className="space-y-4">
                {formData.parts.map((part, index) => (
                  <div key={index} className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300"
                        >
                          <option value="">{t('forms.select_part')}</option>
                          {parts && Array.isArray(parts) && parts.map((part) => (
                            <option key={part._id} value={part._id}>
                              {part.name} - ${part.sellingPrice}
                        </option>
                      ))}
                    </select>
                    {part.name && (
                      <p className="mt-2 text-sm text-gray-600">
                        <strong>{t('forms.selected')}:</strong> {part.name}
                      </p>
                    )}
                  </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {t('forms.quantity')} *
                        </label>
                    <input
                      type="number"
                          min="1"
                          value={part.quantity}
                          onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300"
                    />
                  </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          {t('forms.unit_cost')}
                        </label>
                    <input
                      type="number"
                          min="0"
                          step="0.01"
                          value={part.unitCost}
                          onChange={(e) => updatePart(index, 'unitCost', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300"
                    />
                  </div>
                      
                      
                      <div className="flex items-end">
                  <button
                    type="button"
                          onClick={() => removePart(index)}
                          className="w-full px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-300"
                  >
                          <Trash2 className="h-4 w-4 mx-auto" />
                  </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-right">
                      <span className="text-lg font-bold text-gray-900">
                        {t('forms.total')}: ${part.totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="px-6 py-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-purple-100 rounded-xl mr-4">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t('forms.additional_notes')}</h2>
              </div>
              
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                placeholder={t('forms.notes_placeholder')}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="px-6 py-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-[#F13F33]/10 rounded-xl mr-4">
                  <Calculator className="h-6 w-6 text-[#F13F33]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t('forms.estimate_summary')}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50/80 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">{t('forms.subtotal')}</p>
                  <p className="text-2xl font-bold text-gray-900">${formData.subtotal.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-gray-50/80 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">{t('forms.tax')} (15%)</p>
                  <p className="text-2xl font-bold text-gray-900">${formData.tax.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-[#F13F33]/10 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">{t('forms.total')}</p>
                  <p className="text-3xl font-bold text-[#F13F33]">${formData.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}