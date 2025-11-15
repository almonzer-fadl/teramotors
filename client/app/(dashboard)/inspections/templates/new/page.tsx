"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, FileText, CheckCircle } from "lucide-react";
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

export default function NewTemplatePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (field: keyof TemplateItem, value: string) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    if (newItem.itemId && newItem.name && currentCategory) {
      setItems(prev => [...prev, { ...newItem, category: currentCategory }]);
      setNewItem({ itemId: "", name: "", category: "" });
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

    setLoading(true);
    try {
      const response = await fetch("/api/inspection-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items,
        }),
      });

      if (response.ok) {
        router.push("/inspections/templates");
      } else {
        const errorData = await response.json();
        console.error("Failed to create template:", errorData);
        alert(`Failed to create template: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating template:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <Link
            href="/inspections/templates"
            className="mr-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("templates.create_template")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t("templates.create_template_description")}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              {t("templates.basic_information")}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("templates.template_name")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder={t("templates.template_name_placeholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("templates.vehicle_type")} *
                </label>
                <select
                  required
                  value={formData.vehicleType}
                  onChange={(e) => handleInputChange("vehicleType", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
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
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("templates.description")}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder={t("templates.description_placeholder")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Template Items */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              {t("templates.template_items")}
            </h2>

            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t("templates.current_category")} *
              </label>
              <select
                value={currentCategory}
                onChange={(e) => setCurrentCategory(e.target.value)}
                className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
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
                <p className="mt-2 text-sm text-blue-600">
                  Adding items to: <span className="font-semibold">{currentCategory}</span>
                </p>
              )}
            </div>

            {/* Add New Item */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {t("templates.add_item")}
              </h3>

              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t("templates.item_name")} *
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => handleItemChange("name", e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Oil Level"
                    disabled={!currentCategory}
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t("templates.item_id")} *
                  </label>
                  <input
                    type="text"
                    value={newItem.itemId}
                    onChange={(e) => handleItemChange("itemId", e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., oil-level"
                    disabled={!currentCategory}
                  />
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  disabled={!currentCategory}
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("templates.add_item")}
                </button>
              </div>
            </div>

            {/* Existing Items List - Grouped by Category */}
            {items.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  {t("templates.existing_items")}
                </h3>
                <div className="space-y-6">
                  {Object.entries(groupedItems).map(([category, categoryItems]) => (
                    <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Category Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-blue-200">
                        <h4 className="text-sm font-bold text-blue-900 uppercase tracking-wide">
                          {category}
                        </h4>
                        <p className="text-xs text-blue-700 mt-1">
                          {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
                        </p>
                      </div>

                      {/* Category Items */}
                      <ul className="divide-y divide-gray-200">
                        {categoryItems.map((item) => (
                          <li key={item.originalIndex} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="flex-1 grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-gray-500">Name</div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.name}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">ID</div>
                                  <div className="text-sm text-gray-700">
                                    {item.itemId}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.originalIndex)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/inspections/templates"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors duration-200"
          >
            {t("forms.cancel")}
          </Link>
          
          <button
            type="submit"
            disabled={loading || !formData.name || items.length === 0}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? t("templates.creating") : t("templates.create_template")}
          </button>
        </div>
      </form>
    </div>
  );
}