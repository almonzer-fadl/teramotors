'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Plus, Trash2, Check } from "lucide-react";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";

interface VehicleMinimal {
  _id: string;
  make: string;
  model: string;
  year: number;
  customerId: string | { _id: string };
}
interface CustomerMinimal {
  _id: string;
  firstName: string;
  lastName: string;
}
interface UserMinimal {
  _id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: string;
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
    name: string;
    category: string;
    condition: "good" | "fair" | "poor";
    uniqueCode?: string;
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
  const [users, setUsers] = useState<UserMinimal[]>([]);
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
      const [vehiclesRes, customersRes, usersRes, templatesRes] =
        await Promise.all([
          fetch("/api/vehicles"),
          fetch("/api/customers"),
          fetch("/api/users"),
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
      
      if (usersRes.ok) {
        const data = await usersRes.json();
        // The users API returns an array directly
        const usersArray = Array.isArray(data) ? data : [];
        setUsers(usersArray);
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
      setUsers([]);
      setTemplates([]);
    }
  };

  const fetchInspection = async () => {
    try {
      const response = await fetch(`/api/inspections/${inspectionId}`);
      if (response.ok) {
        const inspection = await response.json();
        setFormData({
          vehicleId: inspection.vehicleId?._id || inspection.vehicleId || "",
          customerId: inspection.customerId?._id || inspection.customerId || "",
          mechanicId: inspection.mechanicId?._id || inspection.mechanicId || "",
          templateId: inspection.templateId?._id || inspection.templateId || "",
          inspectionDate: inspection.inspectionDate
            ? new Date(inspection.inspectionDate).toISOString().split("T")[0]
            : "",
          mileage: inspection.mileage || 0,
          overallCondition: inspection.overallCondition || "",
          items: inspection.items || [],
          recommendations: inspection.recommendations || "",
          nextInspectionDate: inspection.nextInspectionDate || "",
          status: inspection.status || "in-progress",
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
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Auto-populate customer when vehicle is selected
      if (field === 'vehicleId' && value) {
        const selectedVehicle = vehicles.find(v => v._id === value);
        if (selectedVehicle && selectedVehicle.customerId) {
          const customerId = typeof selectedVehicle.customerId === 'object' ? 
            selectedVehicle.customerId._id : selectedVehicle.customerId;
          newData.customerId = customerId;
        }
      }
      
      // Auto-populate vehicle when customer is selected (if no vehicle is already selected)
      if (field === 'customerId' && value && !newData.vehicleId) {
        const customerVehicles = vehicles.filter(v => {
          const vehicleCustomerId = typeof v.customerId === 'object' ? 
            v.customerId._id : v.customerId;
          return vehicleCustomerId === value;
        });
        if (customerVehicles.length === 1) {
          newData.vehicleId = customerVehicles[0]._id;
        }
      }
      
      return newData;
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    handleInputChange("items", updatedItems);
  };

  const loadTemplateItems = async (templateId: string) => {
    if (!templateId) {
      handleInputChange("items", []);
      return;
    }

    try {
      const response = await fetch(`/api/inspection-templates/${templateId}`);
      if (response.ok) {
        const template = await response.json();
        if (template && template.items) {
          // Convert template items to inspection items format
          // Template has ONE category at template level, all items inherit it
          const templateItems = template.items.map((item: any) => ({
            itemId: item.itemId,
            name: item.name || item.itemId,
            category: template.category, // Get category from template, not item
            uniqueCode: item.uniqueCode,
            condition: "good" as const, // Default condition
          }));
          handleInputChange("items", templateItems);
        }
      }
    } catch (error) {
      console.error("Failed to load template items:", error);
    }
  };

  const addItem = () => {
    handleInputChange("items", [
      ...formData.items,
      { itemId: "", name: "", category: "General", condition: "good" },
    ]);
  };

  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    handleInputChange("items", updatedItems);
  };

  // Group items by category for better organization
  const groupedItems = useMemo(() => {
    const groups: Record<string, Array<typeof formData.items[0] & { originalIndex: number }>> = {};
    formData.items.forEach((item, index) => {
      const category = item.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push({ ...item, originalIndex: index });
    });
    return groups;
  }, [formData.items]);

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
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.displayName || `${user.firstName} ${user.lastName}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.inspection_template')}
                  </label>
                  <select
                    value={formData.templateId}
                    onChange={async (e) => {
                      handleInputChange("templateId", e.target.value);
                      await loadTemplateItems(e.target.value);
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
                    value={formData.mileage || ""}
                    onChange={(e) =>
                      handleInputChange("mileage", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_mileage')}
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
                    {t('forms.next_inspection_date')} <span className="text-gray-400">(Optional)</span>
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
                  placeholder={t('ui.enter_recommendations')}
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
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="mb-10">
                  {/* Category Header */}
                  <div className="flex items-center mb-6 pb-3 border-b-2 border-blue-600">
                    <div className="w-5 h-5 bg-blue-600 rounded-full mr-3"></div>
                    <h4 className="text-2xl md:text-3xl font-bold text-gray-900">{category}</h4>
                    <span className="ml-auto text-base md:text-lg text-gray-500 font-semibold">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Items in this category */}
                  {items.map((item) => (
                    <div
                      key={item.originalIndex}
                      className="bg-gray-50/80 rounded-xl p-4 mb-4 border border-gray-200/50"
                    >
                      <div className="flex items-center gap-4">
                        {/* Item Name/ID */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              handleItemChange(item.originalIndex, "name", e.target.value)
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all text-gray-900 placeholder-gray-500 bg-white"
                            placeholder="Item name (e.g., Oil Level)"
                          />
                          <input
                            type="text"
                            value={item.itemId}
                            onChange={(e) =>
                              handleItemChange(item.originalIndex, "itemId", e.target.value)
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all text-gray-900 placeholder-gray-500 bg-white"
                            placeholder="ID (e.g., oil-level)"
                          />
                        </div>

                        {/* Condition - Compact Circular Buttons */}
                        <div className="flex gap-3 items-center">
                          {/* Good Button - Green */}
                          <button
                            type="button"
                            onClick={() => handleItemChange(item.originalIndex, "condition", "good")}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                              item.condition === 'good'
                                ? 'bg-green-500 ring-2 ring-green-300'
                                : 'bg-gray-200 hover:bg-green-100'
                            }`}
                            title="Good"
                          >
                            {item.condition === 'good' && (
                              <Check className="w-6 h-6 text-white" strokeWidth={3} />
                            )}
                          </button>

                          {/* Fair Button - Yellow */}
                          <button
                            type="button"
                            onClick={() => handleItemChange(item.originalIndex, "condition", "fair")}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                              item.condition === 'fair'
                                ? 'bg-yellow-500 ring-2 ring-yellow-300'
                                : 'bg-gray-200 hover:bg-yellow-100'
                            }`}
                            title="Fair"
                          >
                            {item.condition === 'fair' && (
                              <Check className="w-6 h-6 text-white" strokeWidth={3} />
                            )}
                          </button>

                          {/* Poor Button - Red */}
                          <button
                            type="button"
                            onClick={() => handleItemChange(item.originalIndex, "condition", "poor")}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                              item.condition === 'poor'
                                ? 'bg-red-500 ring-2 ring-red-300'
                                : 'bg-gray-200 hover:bg-red-100'
                            }`}
                            title="Poor"
                          >
                            {item.condition === 'poor' && (
                              <Check className="w-6 h-6 text-white" strokeWidth={3} />
                            )}
                          </button>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.originalIndex)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                          title="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
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