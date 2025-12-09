"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, FileText, CheckCircle, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TemplateItem {
  itemId: string;
  name: string;
  category: string;
  uniqueCode?: string;
}

interface FormData {
  name: string;
  description: string;
  vehicleType: string;
}

export default function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation();
  const router = useRouter();
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    vehicleType: "",
  });
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [currentCategory, setCurrentCategory] = useState("");
  const [newItem, setNewItem] = useState<TemplateItem>({
    itemId: "",
    name: "",
    category: "",
  });

  useEffect(() => {
    fetchTemplate();
  }, [resolvedParams.id]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/inspection-templates/${resolvedParams.id}`);
      if (response.ok) {
        const template = await response.json();
        setFormData({
          name: template.name || "",
          description: template.description || "",
          vehicleType: template.vehicleType || "",
        });
        setItems(template.items || []);
      } else {
        console.error("Failed to fetch template");
        router.push("/inspections/templates");
      }
    } catch (error) {
      console.error("Error fetching template:", error);
      router.push("/inspections/templates");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (field: keyof TemplateItem, value: string) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    if (newItem.name && currentCategory) {
      // Auto-generate itemId from name if not provided
      const itemId = newItem.itemId || newItem.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      setItems(prev => [...prev, {
        ...newItem,
        itemId,
        category: currentCategory
      }]);
      setNewItem({ itemId: "", name: "", category: "", uniqueCode: "" });
    }
  };

  // Group items by category for display
  const groupedItems = items.reduce((acc, item, index) => {
    const category = item.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push({ ...item, originalIndex: index });
    return acc;
  }, {} as Record<string, Array<TemplateItem & { originalIndex: number }>>);

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || items.length === 0) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/inspection-templates/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items,
        }),
      });

      if (response.ok) {
        router.push("/inspections/templates");
      } else {
        console.error("Failed to update template");
      }
    } catch (error) {
      console.error("Error updating template:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F13F33] mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/inspections/templates"
                className="p-2 text-gray-400 hover:text-[#F13F33] hover:bg-[#F13F33]/10 rounded-xl transition-all duration-300"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t("templates.edit_template")}
                </h1>
                <p className="text-sm text-gray-500">
                  {t("templates.edit_template_description")}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/inspections/templates"
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300 font-medium"
              >
                {t("forms.cancel")}
              </Link>
              <button
                onClick={handleSubmit}
                disabled={saving || !formData.name || items.length === 0}
                className="inline-flex items-center px-6 py-3 bg-[#F13F33] text-white font-bold rounded-xl hover:bg-[#E03A2F] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Save className="me-2 h-5 w-5" />
                {saving ? t("templates.saving") : t("templates.save_changes")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="px-6 py-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 rounded-xl me-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t("templates.basic_information")}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    {t("templates.template_name")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t("templates.template_name_placeholder")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    {t("templates.vehicle_type")} *
                  </label>
                  <select
                    required
                    value={formData.vehicleType}
                    onChange={(e) => handleInputChange("vehicleType", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                    <option value="">{t("templates.select_vehicle_type")}</option>
                    <option value="car">Car</option>
                    <option value="truck">Truck</option>
                    <option value="suv">SUV</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="van">Van</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    {t("templates.description")}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t("templates.description_placeholder")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Template Items */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="px-6 py-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-green-100 rounded-xl me-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t("templates.template_items")}
                </h2>
              </div>

              {/* Category Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  {t("templates.current_category")} *
                </label>
                <select
                  value={currentCategory}
                  onChange={(e) => setCurrentCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                >
                  <option value="">{t("templates.select_category")}</option>
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
                    Adding items to: <span className="font-bold">{currentCategory}</span>
                  </p>
                )}
              </div>

              {/* Add New Item */}
              <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-6 mb-6 border-2 border-dashed border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {t("templates.add_item")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t("templates.item_name")} *
                    </label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => handleItemChange("name", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                      placeholder="e.g., Oil Level"
                      disabled={!currentCategory}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Unique Code <span className="text-gray-500 text-xs">(Format: E001, B001, C001)</span>
                    </label>
                    <input
                      type="text"
                      value={newItem.uniqueCode || ''}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        handleItemChange("uniqueCode", value);
                      }}
                      maxLength={4}
                      pattern="[A-Z]\d{3}"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300 font-mono"
                      placeholder="C001"
                      disabled={!currentCategory}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      1 letter + 3 digits (e.g., E001 for Engine, B001 for Brakes, C001 for Cooling)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  disabled={!currentCategory}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-[#F13F33] text-white font-bold rounded-xl hover:bg-[#E03A2F] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="me-2 h-5 w-5" />
                  {t("templates.add_item")}
                </button>
              </div>

              {/* Existing Items List - Grouped by Category */}
              {items.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    {t("templates.existing_items")} ({items.length})
                  </h3>
                  <div className="space-y-6">
                    {Object.entries(groupedItems).map(([category, categoryItems]) => (
                      <div key={category} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                        {/* Category Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-5 py-4 border-b-2 border-blue-200">
                          <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide">
                            {category}
                          </h4>
                          <p className="text-xs text-blue-700 mt-1 font-medium">
                            {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>

                        {/* Category Items */}
                        <div className="divide-y divide-gray-200">
                          {categoryItems.map((item) => (
                            <div key={item.originalIndex} className="bg-white/60 backdrop-blur-sm p-4 hover:bg-gray-50/80 transition-all duration-300">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Name</div>
                                    <div className="text-base font-bold text-gray-900">
                                      {item.name}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Unique Code</div>
                                    <div className="text-base font-mono font-bold text-blue-600">
                                      {item.uniqueCode || <span className="text-gray-400 text-sm">Not set</span>}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.originalIndex)}
                                  className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
