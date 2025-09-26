'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";

interface VehicleMinimal {
  _id: string;
  make: string;
  model: string;
  year: number;
}
interface CustomerMinimal {
  _id: string;
  firstName: string;
  lastName: string;
}
interface MechanicMinimal {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}
interface TemplateMinimal {
  _id: string;
  name: string;
}

interface InspectionFormData {
  vehicleId: string;
  customerId: string;
  mechanicId: string;
  templateId: string;
  inspectionDate: string;
  mileage: number;
  overallCondition: string;
  items: {
    itemId: string;
    condition: "good" | "fair" | "poor" | "critical";
    notes: string;
    priority: "critical" | "safety" | "recommended" | "optional";
    estimatedCost: number;
    recommendations: string;
  }[];
  recommendations: string;
  nextInspectionDate: string;
  status: "in-progress" | "completed" | "cancelled";
}

export default function InspectionForm({
  inspectionId,
}: {
  inspectionId?: string;
}) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleMinimal[]>([]);
  const [customers, setCustomers] = useState<CustomerMinimal[]>([]);
  const [mechanics, setMechanics] = useState<MechanicMinimal[]>([]);
  const [templates, setTemplates] = useState<TemplateMinimal[]>([]);
  const [formData, setFormData] = useState<InspectionFormData>({
    vehicleId: "",
    customerId: "",
    mechanicId: "",
    templateId: "",
    inspectionDate: new Date().toISOString().split("T")[0],
    mileage: 0,
    overallCondition: "",
    items: [],
    recommendations: "",
    nextInspectionDate: "",
    status: "in-progress",
  });

  const isEditing = !!inspectionId;

  useEffect(() => {
    fetchInitialData();
    if (isEditing) {
      fetchInspection();
    }
  }, [inspectionId]);

  const fetchInitialData = async () => {
    try {
      const [vehiclesRes, customersRes, mechanicsRes, templatesRes] =
        await Promise.all([
          fetch("/api/vehicles"),
          fetch("/api/customers"),
          fetch("/api/mechanics"),
          fetch("/api/inspection-templates"),
        ]);
      
      if (vehiclesRes.ok) {
        const data = await vehiclesRes.json();
        // The vehicles API returns { vehicles: [...], pagination: {...} }
        const vehiclesArray = Array.isArray(data.vehicles) ? data.vehicles : (Array.isArray(data) ? data : []);
        setVehicles(vehiclesArray);
      }
      
      if (customersRes.ok) {
        const data = await customersRes.json();
        // The customers API returns { customers: [...], pagination: {...} }
        const customersArray = Array.isArray(data.customers) ? data.customers : (Array.isArray(data) ? data : []);
        setCustomers(customersArray);
      }
      
      if (mechanicsRes.ok) {
        const data = await mechanicsRes.json();
        // The mechanics API returns { mechanics: [...], pagination: {...} }
        const mechanicsArray = Array.isArray(data.mechanics) ? data.mechanics : (Array.isArray(data) ? data : []);
        setMechanics(mechanicsArray);
      }
      
      if (templatesRes.ok) {
        const data = await templatesRes.json();
        // The templates API returns { templates: [...], pagination: {...} }
        const templatesArray = Array.isArray(data.templates) ? data.templates : (Array.isArray(data) ? data : []);
        setTemplates(templatesArray);
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      // Set empty arrays on error to prevent runtime errors
      setVehicles([]);
      setCustomers([]);
      setMechanics([]);
      setTemplates([]);
    }
  };

  const fetchInspection = async () => {
    try {
      const response = await fetch(`/api/inspections/${inspectionId}`);
      if (response.ok) {
        const inspection = await response.json();
        setFormData({
          ...inspection,
          inspectionDate: inspection.inspectionDate
            ? new Date(inspection.inspectionDate).toISOString().split("T")[0]
            : "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch inspection:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing
        ? `/api/inspections/${inspectionId}`
        : "/api/inspections";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        socket.emit("inspection-created");
        router.push("/inspections");
      } else {
        const error = await response.json();
        alert(error.message || t('forms.failed_to_save_inspection'));
      }
    } catch (error) {
      console.error("Failed to save inspection:", error);
      alert(t('forms.failed_to_save_inspection'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    handleInputChange("items", updatedItems);
  };

  const loadTemplateItems = (templateId: string) => {
    const template = templates.find(t => t._id === templateId);
    if (template) {
      // For now, we'll create basic items based on template
      // In a real implementation, you'd load the template's items
      const templateItems = [
        { itemId: "engine", condition: "good" as const, notes: "", priority: "critical" as const, estimatedCost: 0, recommendations: "" },
        { itemId: "brakes", condition: "good" as const, notes: "", priority: "safety" as const, estimatedCost: 0, recommendations: "" },
        { itemId: "tires", condition: "good" as const, notes: "", priority: "safety" as const, estimatedCost: 0, recommendations: "" },
        { itemId: "lights", condition: "good" as const, notes: "", priority: "safety" as const, estimatedCost: 0, recommendations: "" },
        { itemId: "battery", condition: "good" as const, notes: "", priority: "recommended" as const, estimatedCost: 0, recommendations: "" },
      ];
      handleInputChange("items", templateItems);
    }
  };

  const addItem = () => {
    handleInputChange("items", [
      ...formData.items,
      { itemId: "", condition: "good", notes: "", priority: "optional", estimatedCost: 0, recommendations: "" },
    ]);
  };

  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    handleInputChange("items", updatedItems);
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
                  {isEditing ? t('forms.edit_inspection') : t('forms.new_inspection')}
                </h1>
                <p className="mt-3 text-xl text-gray-600">
                  {isEditing
                    ? t('forms.update_inspection_details')
                    : t('forms.create_new_inspection')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Inspection Details Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center mr-4">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t('forms.inspection_details')}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.vehicle')}
                  </label>
                  <select
                    required
                    value={formData.vehicleId}
                    onChange={(e) =>
                      handleInputChange("vehicleId", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                    <option value="">{t('forms.select_vehicle')}</option>
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.make} {v.model} ({v.year})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.customer')}
                  </label>
                  <select
                    required
                    value={formData.customerId}
                    onChange={(e) =>
                      handleInputChange("customerId", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                    <option value="">{t('forms.select_customer')}</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.firstName} {c.lastName}
                      </option>
                    ))}
                  </select>
                </div>
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
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.inspection_template')}
                  </label>
                  <select
                    required
                    value={formData.templateId}
                    onChange={(e) => {
                      handleInputChange("templateId", e.target.value);
                      loadTemplateItems(e.target.value);
                    }}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                    <option value="">{t('forms.select_template')}</option>
                    {templates.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.inspection_date')}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.inspectionDate}
                    onChange={(e) =>
                      handleInputChange("inspectionDate", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.mileage')}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.mileage}
                    onChange={(e) =>
                      handleInputChange("mileage", parseInt(e.target.value))
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder="Enter mileage"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.overall_condition')}
                  </label>
                  <select
                    required
                    value={formData.overallCondition}
                    onChange={(e) =>
                      handleInputChange("overallCondition", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                    <option value="">{t('forms.select_condition')}</option>
                    <option value="excellent">{t('forms.condition_excellent')}</option>
                    <option value="good">{t('forms.condition_good')}</option>
                    <option value="fair">{t('forms.condition_fair')}</option>
                    <option value="poor">{t('forms.condition_poor')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.next_inspection_date')}
                  </label>
                  <input
                    type="date"
                    value={formData.nextInspectionDate}
                    onChange={(e) =>
                      handleInputChange("nextInspectionDate", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  />
                </div>
              </div>
              <div className="mt-8 space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  {t('forms.recommendations')}
                </label>
                <textarea
                  value={formData.recommendations}
                  onChange={(e) =>
                    handleInputChange("recommendations", e.target.value)
                  }
                  rows={3}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300 resize-none"
                  placeholder="Enter inspection recommendations"
                />
              </div>
            </div>
          </div>

          {/* Inspection Items Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#063479] to-[#052a5f] rounded-2xl flex items-center justify-center mr-4">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t('forms.inspection_items')}
                </h3>
              </div>
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50/80 rounded-2xl p-6 mb-6 border border-gray-200/50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                    <div className="space-y-2">
                      <label htmlFor={`itemId-${index}`} className="block text-sm font-bold text-gray-700">{t('forms.item_id')}</label>
                      <input
                        type="text"
                        id={`itemId-${index}`}
                        value={item.itemId}
                        onChange={(e) =>
                          handleItemChange(index, "itemId", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                        placeholder="e.g., engine, brakes, tires"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`condition-${index}`} className="block text-sm font-bold text-gray-700">{t('forms.condition')}</label>
                      <select
                        id={`condition-${index}`}
                        value={item.condition}
                        onChange={(e) =>
                          handleItemChange(index, "condition", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                      >
                        <option value="good">{t('forms.condition_good')}</option>
                        <option value="fair">{t('forms.condition_fair')}</option>
                        <option value="poor">{t('forms.condition_poor')}</option>
                        <option value="critical">{t('forms.condition_critical')}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`priority-${index}`} className="block text-sm font-bold text-gray-700">{t('forms.priority')}</label>
                      <select
                        id={`priority-${index}`}
                        value={item.priority}
                        onChange={(e) =>
                          handleItemChange(index, "priority", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                      >
                        <option value="critical">{t('forms.priority_critical')}</option>
                        <option value="safety">{t('forms.priority_safety')}</option>
                        <option value="recommended">{t('forms.priority_recommended')}</option>
                        <option value="optional">{t('forms.priority_optional')}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor={`estimatedCost-${index}`} className="block text-sm font-bold text-gray-700">{t('forms.estimated_cost')}</label>
                      <input
                        type="number"
                        id={`estimatedCost-${index}`}
                        value={item.estimatedCost}
                        onChange={(e) =>
                          handleItemChange(index, "estimatedCost", parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label htmlFor={`notes-${index}`} className="block text-sm font-bold text-gray-700">{t('forms.notes')}</label>
                      <input
                        type="text"
                        id={`notes-${index}`}
                        value={item.notes}
                        onChange={(e) =>
                          handleItemChange(index, "notes", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                        placeholder="Additional notes about this item"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label htmlFor={`recommendations-${index}`} className="block text-sm font-bold text-gray-700">{t('forms.recommendations')}</label>
                      <input
                        type="text"
                        id={`recommendations-${index}`}
                        value={item.recommendations}
                        onChange={(e) =>
                          handleItemChange(index, "recommendations", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                        placeholder="Recommendations for this item"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700 p-3 rounded-xl hover:bg-red-50 transition-all duration-300"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="mt-6 inline-flex items-center px-6 py-3 border-2 border-dashed border-gray-300 text-sm font-bold rounded-2xl text-gray-700 bg-white hover:bg-gray-50 hover:border-[#F13F33] hover:text-[#F13F33] transition-all duration-300"
              >
                <Plus className="mr-3 h-5 w-5" />
                {t('forms.add_item')}
              </button>
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
                ? t('forms.update_inspection')
                : t('forms.save_inspection')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}