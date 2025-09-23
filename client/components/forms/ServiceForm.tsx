'use client';

import { useState, useEffect, Key } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import Part from "@/lib/models/Part";

import { Combobox } from "@/components/ui/Combobox";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";

interface ServiceFormData {
  name: string;
  description: string;
  category: string;
  laborRate: number;
  laborHours: number;
  partsRequired: { partId: string; quantity: number; cost: number }[];
  isActive: boolean;
  isTemplate: boolean;
}

export default function ServiceForm({
  serviceId,
  fromTemplate,
}: {
  serviceId?: string;
  fromTemplate?: boolean;
}) {
  const { t } = useTranslation('common');
  const serviceCategories = Object.keys(t('services.categories', { returnObjects: true })).map(key => ({
    value: key,
    label: t(`services.categories.${key}`)
  }));

  const [templates, setTemplates] = useState<ServiceFormData[]>([]);

  const isEditing = !!serviceId;

  useEffect(() => {
    fetchParts();
    if (isEditing) {
      fetchService();
    } else if (fromTemplate) {
      fetchTemplates();
    }
  }, [serviceId, isEditing, fromTemplate]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/services?isTemplate=true");
      if (response.ok) {
        setTemplates(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch service templates:", error);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => (t as any)._id === templateId);
    if (template) {
      setFormData({
        ...template,
        isTemplate: false, // Don't save the new service as a template by default
      });
    }
  };

  const fetchParts = async () => {
    try {
      const response = await fetch("/api/parts");
      if (response.ok) {
        setParts(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch parts:", error);
    }
  };

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/services/${serviceId}`);
      if (response.ok) {
        const service = await response.json();
        setFormData(service);
      }
    } catch (error) {
      console.error("Failed to fetch service:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing ? `/api/services/${serviceId}` : "/api/services";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        socket.emit("service-created");
        router.push("/services");
      } else {
        const error = await response.json();
        alert(error.message || t('forms.failed_to_save_service'));
      }
    } catch (error) {
      console.error("Failed to save service:", error);
      alert(t('forms.failed_to_save_service'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePartChange = (index: number, field: string, value: any) => {
    const updatedParts = [...formData.partsRequired];
    updatedParts[index] = { ...updatedParts[index], [field]: value };
    handleInputChange("partsRequired", updatedParts);
  };

  const addPart = () => {
    handleInputChange("partsRequired", [
      ...formData.partsRequired,
      { partId: "", quantity: 1, cost: 0 },
    ]);
  };

  const removePart = (index: number) => {
    const updatedParts = formData.partsRequired.filter((_, i) => i !== index);
    handleInputChange("partsRequired", updatedParts);
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
              {isEditing ? t('forms.edit_service') : t('forms.new_service')}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditing ? t('forms.update_service_details') : t('forms.create_new_service')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {fromTemplate && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('forms.create_from_template')}
            </h3>
            <select
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">{t('forms.select_template')}</option>
              {templates.map((t) => (
                <option key={(t as any)._id} value={(t as any)._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Form fields for service details */}
        <div className="bg-white shadow rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('inventory.name')}</label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">{t('forms.select_category')}</label>
            <Combobox
              options={serviceCategories}
              value={formData.category}
              onChange={(value) => handleInputChange("category", value)}
              placeholder={t('forms.select_category')}
              searchPlaceholder={t('forms.search_or_add_category')}
              emptyPlaceholder={t('forms.no_categories_found')}
            />
          </div>
          <div>
            <label htmlFor="laborRate" className="block text-sm font-medium text-gray-700">{t('job_cards.labor_rate')}</label>
            <input
              type="number"
              id="laborRate"
              name="laborRate"
              required
              value={formData.laborRate}
              onChange={(e) =>
                handleInputChange("laborRate", parseFloat(e.target.value))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="laborHours" className="block text-sm font-medium text-gray-700">{t('job_cards.labor_hours')}</label>
            <input
              type="number"
              id="laborHours"
              required
              value={formData.laborHours}
              onChange={(e) =>
                handleInputChange("laborHours", parseFloat(e.target.value))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('vehicles.description')}</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div className="flex items-center">
            <input
              id="isTemplate"
              type="checkbox"
              checked={formData.isTemplate}
              onChange={(e) =>
                handleInputChange("isTemplate", e.target.checked)
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <label
              htmlFor="isTemplate"
              className="ml-3 min-w-0 flex-1 text-gray-500"
            >
              {t('forms.save_as_template')}
            </label>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('forms.parts_required')}
          </h3>
          {formData.partsRequired.map((part: { partId: string | number | readonly string[] | undefined; quantity: string | number | readonly string[] | undefined; cost: string | number | readonly string[] | undefined; }, index: Key | null | undefined) => (
            <div
              key={index}
              className="grid grid-cols-4 gap-4 items-center mb-4"
            >
              <div className="col-span-2">
                <label htmlFor={`partId-${index}`} className="block text-sm font-medium text-gray-700">{t('job_cards.select_part')}</label>
                <select
                  id={`partId-${index}`}
                  value={part.partId}
                  onChange={(e) =>
                    handlePartChange(index, "partId", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">{t('job_cards.select_part')}</option>
                  {parts.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700">{t('job_cards.qty')}</label>
                <input
                  type="number"
                  id={`quantity-${index}`}
                  value={part.quantity}
                  onChange={(e) =>
                    handlePartChange(index, "quantity", parseInt(e.target.value))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor={`cost-${index}`} className="block text-sm font-medium text-gray-700">{t('job_cards.cost')}</label>
                <input
                  type="number"
                  id={`cost-${index}`}
                  name="cost"
                  value={part.cost}
                  onChange={(e) =>
                    handlePartChange(index, "cost", parseFloat(e.target.value))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removePart(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addPart}
            className="mt-4 inline-flex items-center px-4 py-2 border border-dashed border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('forms.add_part')}
          </button>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="mr-2 h-4 w-4" />
            {t('forms.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading
              ? t('forms.saving')
              : isEditing
              ? t('forms.update_service')
              : t('forms.save_service')}
          </button>
        </div>
      </form>
    </div>
  );
}