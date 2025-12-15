'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Plus, Check, ClipboardList } from "lucide-react";
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
    isManual?: boolean;
  }[];
  recommendations: string;
  nextInspectionDate: string;
  nextInspectionMonths: number;
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
    uniqueCode: "",
    condition: "good" as const,
    isManual: true,
  });

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
    nextInspectionDate: calculateNextInspectionDate(3),
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
        const jobCardsArray = Array.isArray(data.jobCards) ? data.jobCards : (Array.isArray(data) ? data : []);
        setJobCards(jobCardsArray);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        const usersArray = Array.isArray(data) ? data : [];
        setUsers(usersArray);
      }

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        const templatesArray = Array.isArray(data.templates) ? data.templates : (Array.isArray(data) ? data : []);
        setTemplates(templatesArray);
      }
    } catch (error) {
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
      alert(t('forms.failed_to_save_inspection'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

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
          const templateItems = template.items.map((item: any) => ({
            itemId: item.itemId,
            name: item.name || item.itemId,
            category: item.category,
            uniqueCode: item.uniqueCode,
            condition: "good" as const,
            isManual: false,
          }));
          handleInputChange("items", templateItems);
        }
      }
    } catch (error) {
    }
  };

  const addItem = () => {
    if (newItem.name && currentCategory) {
      const itemId = newItem.itemId || newItem.name.toLowerCase().replace(/\s+/g, '-');
      handleInputChange("items", [
        ...formData.items,
        { ...newItem, itemId, category: currentCategory, isManual: true },
      ]);
      setNewItem({
        itemId: "",
        name: "",
        category: "",
        uniqueCode: "",
        condition: "good",
        isManual: true,
      });
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="me-6 p-3 text-gray-600 dark:text-gray-400 hover:text-[#F97402] transition-all duration-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group"
              >
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  {isEditing ? t('forms.edit_inspection') : t('forms.new_inspection')}
                </h1>
                <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                  {isEditing
                    ? t('forms.update_inspection_details')
                    : t('forms.create_new_inspection')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Inspection Details Section */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 sm:px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F97402] to-[#F13F33] rounded-2xl flex items-center justify-center me-4">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {t('forms.inspection_details')}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('forms.job_card')} *
                  </label>
                  <select
                    required
                    value={formData.jobCardId}
                    onChange={(e) =>
                      handleInputChange("jobCardId", e.target.value)
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
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
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('forms.mechanic')}
                  </label>
                  <select
                    required
                    value={formData.mechanicId}
                    onChange={(e) =>
                      handleInputChange("mechanicId", e.target.value)
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
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
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('forms.inspection_template')}
                  </label>
                  <select
                    value={formData.templateId}
                    onChange={async (e) => {
                      handleInputChange("templateId", e.target.value);
                      await loadTemplateItems(e.target.value);
                    }}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
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
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('forms.mileage')}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.mileage || ""}
                    onChange={(e) =>
                      handleInputChange("mileage", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('ui.enter_mileage')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('forms.next_inspection_period')}
                  </label>
                  <select
                    value={formData.nextInspectionMonths}
                    onChange={(e) =>
                      handleInputChange("nextInspectionMonths", parseInt(e.target.value))
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                  >
                    <option value="3">3 Months</option>
                    <option value="6">6 Months</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('forms.next_inspection_date')} <span className="text-gray-400 dark:text-gray-500 normal-case">(Auto-calculated, can be edited)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.nextInspectionDate}
                    onChange={(e) =>
                      handleInputChange("nextInspectionDate", e.target.value)
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                  />
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  {t('forms.recommendations')}
                </label>
                <textarea
                  value={formData.recommendations}
                  onChange={(e) =>
                    handleInputChange("recommendations", e.target.value)
                  }
                  rows={3}
                  className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200 resize-none"
                  placeholder={t('ui.enter_recommendations')}
                />
              </div>
            </div>
          </div>

          {/* Inspection Items Section */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 sm:px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center me-4">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {t('forms.inspection_items')}
                </h3>
              </div>

              {/* Category Groups - Table Format */}
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="mb-10">
                  {/* Category Header */}
                  <div className="flex items-center mb-4 pb-2 border-b-2 border-[#F97402]">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                      {category}
                    </h4>
                    <span className="ms-auto text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Table Header */}
                  <div className="grid grid-cols-10 gap-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg mb-2">
                    <div className="col-span-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Item Name</div>
                    <div className="col-span-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Unique Code</div>
                    <div className="col-span-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide text-center">Condition</div>
                  </div>

                  {/* Items in this category */}
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div
                        key={item.originalIndex}
                        className="grid grid-cols-10 gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-150"
                      >
                        {/* Item Name */}
                        <div className="col-span-3 flex items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                        </div>

                        {/* Unique Code */}
                        <div className="col-span-3 flex items-center">
                          <span className="text-sm text-gray-800 dark:text-gray-300">{item.uniqueCode || '-'}</span>
                        </div>

                        {/* Condition Buttons */}
                        <div className="col-span-4 flex gap-3 items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleItemChange(item.originalIndex, "condition", "good")}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                              item.condition === 'good'
                                ? 'bg-green-500 ring-2 ring-green-300 shadow-md'
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-900/30'
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
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
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
                                : 'bg-gray-200 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30'
                            }`}
                            title="Poor"
                          >
                            {item.condition === 'poor' && (
                              <Check className="w-5 h-5 text-white" strokeWidth={3} />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Add Manual Item Section */}
              <div className="mt-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 bg-gray-50/80 dark:bg-gray-800/50">
                <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                  {t('forms.add_manual_item')}
                </h4>

                {/* Category Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    {t('templates.current_category')} *
                  </label>
                  <select
                    value={currentCategory}
                    onChange={(e) => setCurrentCategory(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
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
                    <p className="mt-2 text-sm text-[#F97402] font-medium">
                      Adding item to: <span className="font-bold">{currentCategory}</span>
                    </p>
                  )}
                </div>

                {/* Item Fields */}
                <div className="flex flex-col sm:flex-row items-end gap-4">
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                      {t('templates.item_name')} *
                    </label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                      placeholder="e.g., Oil Level"
                      disabled={!currentCategory}
                    />
                  </div>

                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Unique Code
                    </label>
                    <input
                      type="text"
                      value={newItem.uniqueCode}
                      onChange={(e) => setNewItem(prev => ({ ...prev, uniqueCode: e.target.value }))}
                      className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                      placeholder="e.g., ABC-123"
                      disabled={!currentCategory}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    disabled={!currentCategory}
                    className="inline-flex items-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 whitespace-nowrap"
                  >
                    <Plus className="me-2 h-5 w-5" />
                    {t('forms.add_item')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#F97402] hover:text-[#F97402] hover:bg-[#F97402]/5 active:scale-[0.98] transition-all duration-200"
            >
              <X className="me-2 h-5 w-5" />
              {t('forms.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
            >
              <Save className="me-2 h-5 w-5" />
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
