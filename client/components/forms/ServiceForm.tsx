'use client';

import { useState, useEffect, Key } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Wrench, FileText } from "lucide-react";

import { Combobox } from "@/components/ui/Combobox";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";

interface ServiceFormData {
  name: string;
  description: string;
  category: string;
  laborRate: number;
  laborHours: number;
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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    category: '',
    laborRate: 0,
    laborHours: 1,
    isActive: true,
    isTemplate: false,
  });

  // Debug logging
  console.log('Service categories:', serviceCategories);
  console.log('Current category value:', formData.category);

  // Track formData changes
  useEffect(() => {
    console.log('ServiceForm formData changed:', formData);
  }, [formData]);

  const router = useRouter();

  const isEditing = !!serviceId;

  useEffect(() => {
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
    console.log('ServiceForm handleInputChange:', { field, value, currentFormData: formData });
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      console.log('ServiceForm new form data:', newData);
      return newData;
    });
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
                  {isEditing ? t('forms.edit_service') : t('forms.new_service')}
                </h1>
                <p className="mt-3 text-xl text-gray-600">
                  {isEditing ? t('forms.update_service_details') : t('forms.create_new_service')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Template Selection Section */}
          {fromTemplate && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              <div className="px-8 py-8">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {t('forms.create_from_template')}
                  </h3>
                </div>
                <select
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                >
                  <option value="">{t('forms.select_template')}</option>
                  {templates.map((t) => (
                    <option key={(t as any)._id} value={(t as any)._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Service Details Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center mr-4">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t('forms.service_details')}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700">{t('inventory.name')}</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_service_name')}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-bold text-gray-700">{t('forms.select_category')} <span className="text-gray-400">({t('forms.optional')})</span></label>
                  <Combobox
                    options={serviceCategories}
                    value={formData.category}
                    onChange={(value) => handleInputChange("category", value)}
                    placeholder={t('forms.select_category')}
                    searchPlaceholder={t('forms.search_or_add_category')}
                    emptyPlaceholder={t('forms.no_categories_found')}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="laborRate" className="block text-sm font-bold text-gray-700">{t('services.labor_rate')}</label>
                  <input
                    type="number"
                    id="laborRate"
                    name="laborRate"
                    required
                    value={formData.laborRate || 0}
                    onChange={(e) =>
                      handleInputChange("laborRate", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_labor_rate')}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="laborHours" className="block text-sm font-bold text-gray-700">{t('services.labor_hours')}</label>
                  <input
                    type="number"
                    id="laborHours"
                    required
                    value={formData.laborHours || 0}
                    onChange={(e) =>
                      handleInputChange("laborHours", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_labor_hours')}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="description" className="block text-sm font-bold text-gray-700">{t('vehicles.description')}</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300 resize-none"
                    placeholder={t('ui.enter_service_description')}
                    rows={4}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    id="isTemplate"
                    type="checkbox"
                    checked={formData.isTemplate}
                    onChange={(e) =>
                      handleInputChange("isTemplate", e.target.checked)
                    }
                    className="h-5 w-5 rounded border-2 border-gray-300 text-[#F13F33] focus:ring-[#F13F33] focus:ring-2"
                  />
                  <label
                    htmlFor="isTemplate"
                    className="text-sm font-bold text-gray-700"
                  >
                    {t('forms.save_as_template')}
                  </label>
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
                ? t('forms.update_service')
                : t('forms.save_service')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}