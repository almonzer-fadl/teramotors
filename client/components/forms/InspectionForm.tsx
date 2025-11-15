'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Plus, Trash2, Check } from "lucide-react";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";

interface JobCardMinimal {
  _id: string;
  jobCardNumber: string;
  vehicleId: {
    make: string;
    model: string;
    year: number;
  };
  customerId: {
    firstName: string;
    lastName: string;
  };
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
  jobCardId: string;
  mechanicId: string;
  templateId: string;
  inspectionDate: string;
  mileage: number;
  items: {
    itemId: string;
    name: string;
    category: string;
    condition: "good" | "fair" | "poor";
    uniqueCode?: string;
    isManual?: boolean; // Track if item was added manually
  }[];
  recommendations: string;
  nextInspectionDate: string;
  nextInspectionMonths: number; // 3 or 6 months
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
  const [jobCards, setJobCards] = useState<JobCardMinimal[]>([]);
  const [users, setUsers] = useState<UserMinimal[]>([]);
  const [templates, setTemplates] = useState<TemplateMinimal[]>([]);
  const [currentCategory, setCurrentCategory] = useState("");
  const [newItem, setNewItem] = useState({
    itemId: "",
    name: "",
    category: "",
    condition: "good" as const,
    isManual: true,
  });

  // Calculate next inspection date based on months
  const calculateNextInspectionDate = (months: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState<InspectionFormData>({
    jobCardId: "",
    mechanicId: "",
    templateId: "",
    inspectionDate: new Date().toISOString().split("T")[0],
    mileage: 0,
    items: [],
    recommendations: "",
    nextInspectionDate: calculateNextInspectionDate(3), // Default 3 months
    nextInspectionMonths: 3,
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
      const [jobCardsRes, usersRes, templatesRes] =
        await Promise.all([
          fetch("/api/job-cards"),
          fetch("/api/users"),
          fetch("/api/inspection-templates"),
        ]);

      if (jobCardsRes.ok) {
        const data = await jobCardsRes.json();
        // The job-cards API returns { jobCards: [...], pagination: {...} }
        const jobCardsArray = Array.isArray(data.jobCards) ? data.jobCards : (Array.isArray(data) ? data : []);
        setJobCards(jobCardsArray);
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
      setJobCards([]);
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
          jobCardId: inspection.jobCardId?._id || inspection.jobCardId || "",
          mechanicId: inspection.mechanicId?._id || inspection.mechanicId || "",
          templateId: inspection.templateId?._id || inspection.templateId || "",
          inspectionDate: inspection.inspectionDate
            ? new Date(inspection.inspectionDate).toISOString().split("T")[0]
            : "",
          mileage: inspection.mileage || 0,
          items: inspection.items || [],
          recommendations: inspection.recommendations || "",
          nextInspectionDate: inspection.nextInspectionDate
            ? new Date(inspection.nextInspectionDate).toISOString().split("T")[0]
            : calculateNextInspectionDate(3),
          nextInspectionMonths: inspection.nextInspectionMonths || 3,
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

      // Auto-update next inspection date when months change
      if (field === 'nextInspectionMonths' && value) {
        newData.nextInspectionDate = calculateNextInspectionDate(value);
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
          // Template items now have category per item (multi-category support)
          const templateItems = template.items.map((item: any) => ({
            itemId: item.itemId,
            name: item.name || item.itemId,
            category: item.category, // Get category from item (templates now support multiple categories)
            uniqueCode: item.uniqueCode,
            condition: "good" as const, // Default condition
            isManual: false, // Items from template are not manual
          }));
          handleInputChange("items", templateItems);
        }
      }
    } catch (error) {
      console.error("Failed to load template items:", error);
    }
  };

  const addItem = () => {
    if (newItem.itemId && newItem.name && currentCategory) {
      handleInputChange("items", [
        ...formData.items,
        { ...newItem, category: currentCategory, isManual: true },
      ]);
      setNewItem({
        itemId: "",
        name: "",
        category: "",
        condition: "good",
        isManual: true,
      });
    }
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
                    {t('forms.job_card')} *
                  </label>
                  <select
                    required
                    value={formData.jobCardId}
                    onChange={(e) =>
                      handleInputChange("jobCardId", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                    <option value="">{t('forms.select_job_card')}</option>
                    {jobCards.map((jc) => (
                      <option key={jc._id} value={jc._id}>
                        {jc.jobCardNumber} - {jc.vehicleId?.make} {jc.vehicleId?.model} ({jc.customerId?.firstName} {jc.customerId?.lastName})
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
                    {t('forms.next_inspection_period')}
                  </label>
                  <select
                    value={formData.nextInspectionMonths}
                    onChange={(e) =>
                      handleInputChange("nextInspectionMonths", parseInt(e.target.value))
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.next_inspection_date')} <span className="text-gray-400">(Auto-calculated, can be edited)</span>
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

              {/* Category Groups - Table Format */}
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="mb-10">
                  {/* Category Header */}
                  <div className="flex items-center mb-4 pb-2 border-b-2 border-blue-500">
                    <h4 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                      {category}
                    </h4>
                    <span className="ml-auto text-sm text-gray-500 font-medium">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-100 rounded-lg mb-2">
                    <div className="col-span-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Item Name</div>
                    <div className="col-span-3 text-xs font-bold text-gray-600 uppercase tracking-wide">Item ID</div>
                    <div className="col-span-4 text-xs font-bold text-gray-600 uppercase tracking-wide text-center">Condition</div>
                    <div className="col-span-2 text-xs font-bold text-gray-600 uppercase tracking-wide text-center">Action</div>
                  </div>

                  {/* Items in this category */}
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div
                        key={item.originalIndex}
                        className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                      >
                        {/* Item Name */}
                        <div className="col-span-3 flex items-center">
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        </div>

                        {/* Item ID */}
                        <div className="col-span-3 flex items-center">
                          <span className="text-m text-gray-800">{item.itemId}</span>
                        </div>

                        {/* Condition Buttons */}
                        <div className="col-span-4 flex gap-3 items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleItemChange(item.originalIndex, "condition", "good")}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                              item.condition === 'good'
                                ? 'bg-green-500 ring-2 ring-green-300 shadow-md'
                                : 'bg-gray-200 hover:bg-green-100'
                            }`}
                            title="Good"
                          >
                            {item.condition === 'good' && (
                              <Check className="w-5 h-5 text-white" strokeWidth={3} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleItemChange(item.originalIndex, "condition", "fair")}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                              item.condition === 'fair'
                                ? 'bg-yellow-500 ring-2 ring-yellow-300 shadow-md'
                                : 'bg-gray-200 hover:bg-yellow-100'
                            }`}
                            title="Fair"
                          >
                            {item.condition === 'fair' && (
                              <Check className="w-5 h-5 text-white" strokeWidth={3} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleItemChange(item.originalIndex, "condition", "poor")}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                              item.condition === 'poor'
                                ? 'bg-red-500 ring-2 ring-red-300 shadow-md'
                                : 'bg-gray-200 hover:bg-red-100'
                            }`}
                            title="Poor"
                          >
                            {item.condition === 'poor' && (
                              <Check className="w-5 h-5 text-white" strokeWidth={3} />
                            )}
                          </button>
                        </div>

                        {/* Delete Button */}
                        <div className="col-span-2 flex items-center justify-center">
                          {item.isManual ? (
                            <button
                              type="button"
                              onClick={() => removeItem(item.originalIndex)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Add Manual Item Section */}
              <div className="mt-8 border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50/80">
                <h4 className="text-lg font-bold text-gray-800 mb-4">
                  {t('forms.add_manual_item')}
                </h4>

                {/* Category Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t('templates.current_category')} *
                  </label>
                  <select
                    value={currentCategory}
                    onChange={(e) => setCurrentCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80"
                  >
                    <option value="">{t('templates.select_category')}</option>
                    <option value="Engine">Engine</option>
                    <option value="Brakes">Brakes</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Transmission">Transmission</option>
                    <option value="Exhaust">Exhaust</option>
                    <option value="Interior">Interior</option>
                    <option value="Exterior">Exterior</option>
                    <option value="Tires">Tires</option>
                    <option value="Steering">Steering</option>
                    <option value="Cooling">Cooling</option>
                    <option value="Fuel System">Fuel System</option>
                  </select>
                  {currentCategory && (
                    <p className="mt-2 text-sm text-blue-600 font-medium">
                      Adding item to: <span className="font-bold">{currentCategory}</span>
                    </p>
                  )}
                </div>

                {/* Item Fields */}
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t('templates.item_name')} *
                    </label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all text-gray-900 placeholder-gray-500 bg-white"
                      placeholder="e.g., Oil Level"
                      disabled={!currentCategory}
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t('templates.item_id')} *
                    </label>
                    <input
                      type="text"
                      value={newItem.itemId}
                      onChange={(e) => setNewItem(prev => ({ ...prev, itemId: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all text-gray-900 placeholder-gray-500 bg-white"
                      placeholder="e.g., oil-level"
                      disabled={!currentCategory}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    disabled={!currentCategory}
                    className="inline-flex items-center px-6 py-3 bg-[#F13F33] text-white font-bold rounded-xl hover:bg-[#E03A2F] transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    {t('forms.add_item')}
                  </button>
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
                ? t('forms.update_inspection')
                : t('forms.save_inspection')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}