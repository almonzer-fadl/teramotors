"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TemplateItem {
  id: string;
  name: string;
  description: string;
  category: string;
  isRequired: boolean;
  defaultCondition: string;
}

interface TemplateFormData {
  name: string;
  category: string;
  vehicleType: string;
  items: TemplateItem[];
  isActive: boolean;
}

export default function NewTemplatePage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: "",
    category: "",
    vehicleType: "sedan",
    items: [],
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/inspection-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/inspection-templates");
      } else {
        const error = await response.json();
        alert(error.message || t("templates.failed_to_save_template"));
      }
    } catch (error) {
      console.error("Failed to save template:", error);
      alert(t("templates.failed_to_save_template"));
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

  const addItem = () => {
    handleInputChange("items", [
      ...formData.items,
      {
        id: "",
        name: "",
        description: "",
        category: "",
        isRequired: true,
        defaultCondition: "good",
      },
    ]);
  };

  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    handleInputChange("items", updatedItems);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("templates.new_template")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t("templates.create_new_inspection_template")}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("templates.template_name")}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Basic Vehicle Inspection"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("templates.category")}
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Safety, Maintenance, Pre-purchase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("templates.vehicle_type")}
              </label>
              <select
                required
                value={formData.vehicleType}
                onChange={(e) => handleInputChange("vehicleType", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="sedan">{t("templates.sedan")}</option>
                <option value="suv">{t("templates.suv")}</option>
                <option value="truck">{t("templates.truck")}</option>
                <option value="motorcycle">{t("templates.motorcycle")}</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange("isActive", e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                {t("templates.active")}
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t("templates.inspection_items")}
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("templates.add_item")}
            </button>
          </div>

          {formData.items.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 mb-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("templates.item_id")}
                  </label>
                  <input
                    type="text"
                    value={item.id}
                    onChange={(e) => handleItemChange(index, "id", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., engine"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("templates.item_name")}
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, "name", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., Engine"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("templates.category")}
                  </label>
                  <input
                    type="text"
                    value={item.category}
                    onChange={(e) => handleItemChange(index, "category", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., Engine"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("templates.description")}
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Description of this inspection item"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("templates.default_condition")}
                  </label>
                  <select
                    value={item.defaultCondition}
                    onChange={(e) => handleItemChange(index, "defaultCondition", e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="good">{t("forms.condition_good")}</option>
                    <option value="fair">{t("forms.condition_fair")}</option>
                    <option value="poor">{t("forms.condition_poor")}</option>
                    <option value="critical">{t("forms.condition_critical")}</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`isRequired-${index}`}
                    checked={item.isRequired}
                    onChange={(e) => handleItemChange(index, "isRequired", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`isRequired-${index}`} className="ml-2 block text-sm text-gray-900">
                    {t("templates.required")}
                  </label>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="mr-2 h-4 w-4" />
            {t("forms.cancel")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? t("forms.saving") : t("templates.save_template")}
          </button>
        </div>
      </form>
    </div>
  );
}
