"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, FileText, CheckCircle, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TemplateItem {
  itemId: string;
  category: string;
}

interface FormData {
  name: string;
  description: string;
  category: string;
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
    category: "",
    vehicleType: "",
  });
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [newItem, setNewItem] = useState<TemplateItem>({
    itemId: "",
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
          category: template.category || "",
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
    if (newItem.itemId && newItem.category) {
      setItems(prev => [...prev, newItem]);
      setNewItem({ itemId: "", category: "" });
    }
  };

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
                <Save className="mr-2 h-5 w-5" />
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
                <div className="p-3 bg-blue-100 rounded-xl mr-4">
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
                    {t("templates.category")} *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                    <option value="">{t("templates.select_category")}</option>
                    <option value="engine">Engine</option>
                    <option value="brakes">Brakes</option>
                    <option value="electrical">Electrical</option>
                    <option value="suspension">Suspension</option>
                    <option value="transmission">Transmission</option>
                    <option value="exhaust">Exhaust</option>
                    <option value="interior">Interior</option>
                    <option value="exterior">Exterior</option>
                  </select>
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
                <div className="p-3 bg-green-100 rounded-xl mr-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {t("templates.template_items")}
                </h2>
              </div>
              
              {/* Add New Item */}
              <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-6 mb-6 border-2 border-dashed border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  {t("templates.add_item")}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t("templates.item_id")} *
                    </label>
                    <input
                      type="text"
                      value={newItem.itemId}
                      onChange={(e) => handleItemChange("itemId", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                      placeholder="e.g., BRAKE_001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t("templates.category")} *
                    </label>
                    <select
                      value={newItem.category}
                      onChange={(e) => handleItemChange("category", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    >
                      <option value="">{t("templates.select_category")}</option>
                      <option value="engine">Engine</option>
                      <option value="brakes">Brakes</option>
                      <option value="electrical">Electrical</option>
                      <option value="suspension">Suspension</option>
                      <option value="transmission">Transmission</option>
                      <option value="exhaust">Exhaust</option>
                      <option value="interior">Interior</option>
                      <option value="exterior">Exterior</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addItem}
                      className="w-full inline-flex items-center justify-center px-6 py-3 bg-[#F13F33] text-white font-bold rounded-xl hover:bg-[#E03A2F] transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      {t("templates.add_item")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing Items List */}
              {items.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    {t("templates.existing_items")} ({items.length})
                  </h3>
                  <div className="grid gap-4">
                    {items.map((item, index) => (
                      <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:border-[#F13F33]/30 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-lg font-bold text-gray-900 mb-1">
                              {item.itemId}
                            </div>
                            <div className="text-sm text-gray-600">
                              {item.category}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
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
