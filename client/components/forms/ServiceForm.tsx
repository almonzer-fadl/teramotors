'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Wrench, FileText } from "lucide-react";

import { Combobox } from "@/components/ui/Combobox";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";

interface ServiceFormData {
  name: string;
  description: string;
  category: string;
  uniqueCode?: string;
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
    uniqueCode: '',
    laborRate: 0,
    laborHours: 1,
    isActive: true,
    isTemplate: false,
  });

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
      alert(t('forms.failed_to_save_service'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      return { ...prev, [field]: value };
    });
  };


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
                  {isEditing ? t('forms.edit_service') : t('forms.new_service')}
                </h1>
                <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                  {isEditing ? t('forms.update_service_details') : t('forms.create_new_service')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Template Selection Section */}
          {fromTemplate && (
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 sm:px-8 py-8">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center me-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                    {t('forms.create_from_template')}
                  </h3>
                </div>
                <select
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
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
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 sm:px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F97402] to-[#F13F33] rounded-2xl flex items-center justify-center me-4">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {t('forms.service_details')}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('inventory.name')}</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('ui.enter_service_name')}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('forms.select_category')} <span className="text-gray-400 dark:text-gray-500 normal-case">({t('forms.optional')})</span></label>
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
                  <label htmlFor="uniqueCode" className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Unique Code <span className="text-gray-400 dark:text-gray-500 normal-case">(Optional - Format: E001, B001, etc.)</span>
                  </label>
                  <input
                    type="text"
                    id="uniqueCode"
                    value={formData.uniqueCode || ''}
                    onChange={(e) => handleInputChange("uniqueCode", e.target.value.toUpperCase())}
                    maxLength={4}
                    pattern="[A-Z]\d{3}"
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200 font-mono"
                    placeholder="E001"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Format: 1 letter + 3 digits (e.g., E001 for Engine, B001 for Brakes)
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="laborRate" className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('services.labor_rate')}</label>
                  <input
                    type="number"
                    id="laborRate"
                    name="laborRate"
                    required
                    value={formData.laborRate || 0}
                    onChange={(e) =>
                      handleInputChange("laborRate", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('ui.enter_labor_rate')}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="laborHours" className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('services.labor_hours')}</label>
                  <input
                    type="number"
                    id="laborHours"
                    required
                    value={formData.laborHours || 0}
                    onChange={(e) =>
                      handleInputChange("laborHours", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('ui.enter_labor_hours')}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('vehicles.description')}</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200 resize-none"
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
                    className="h-5 w-5 rounded border-2 border-gray-300 dark:border-gray-600 text-[#F97402] focus:ring-[#F97402] focus:ring-2 bg-white dark:bg-gray-800"
                  />
                  <label
                    htmlFor="isTemplate"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('forms.save_as_template')}
                  </label>
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
                ? t('forms.update_service')
                : t('forms.save_service')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
