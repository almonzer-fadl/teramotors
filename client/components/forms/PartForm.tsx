'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Package } from "lucide-react";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";
import { Combobox } from "@/components/ui/Combobox";

interface PartFormData {
  name: string;
  description: string;
  category: string;
  manufacturer: string;
  cost: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  location: string;
  partNumber: string | undefined;
  uniqueCode?: string;
}

export default function PartForm({ partId }: { partId?: string }) {
  const { t } = useTranslation('common');
  const partCategories = useMemo(() => {
    const categories = t('inventory.categories', { returnObjects: true }) as Record<string, string>;
    return Object.keys(categories).map(key => ({
      value: key,
      label: t(`inventory.categories.${key}`)
    }));
  }, [t]);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PartFormData>({
    name: "",
    description: "",
    category: "",
    manufacturer: "",
    cost: 0,
    sellingPrice: 0,
    stockQuantity: 0,
    minStockLevel: 0,
    location: "",
    partNumber: "",
    uniqueCode: "",
  });

  const isEditing = !!partId;

  useEffect(() => {
    if (isEditing) {
      async function fetchPart() {
        try {
          const response = await fetch(`/api/parts/${partId}`);
          if (response.ok) {
            const part = await response.json();
            setFormData({
              name: part.name || "",
              description: part.description || "",
              category: part.category || "",
              manufacturer: part.manufacturer || "",
              cost: Number(part.cost) || 0,
              sellingPrice: Number(part.sellingPrice) || 0,
              stockQuantity: Number(part.stockQuantity) || 0,
              minStockLevel: Number(part.minStockLevel) || 0,
              location: part.location || "",
              partNumber: part.partNumber || "",
              uniqueCode: part.uniqueCode || "",
            });
          }
        } catch (error) {
        }
      }
      fetchPart();
    }
  }, [isEditing, partId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing ? `/api/parts/${partId}` : "/api/parts";
      const method = isEditing ? "PUT" : "POST";

      // Prepare data for submission - handle empty partNumber and uniqueCode
      const submitData = { ...formData };
      if (submitData.partNumber === '') {
        submitData.partNumber = undefined;
      }
      if (submitData.uniqueCode === '') {
        submitData.uniqueCode = undefined;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        socket.emit("job-created");
        router.push("/inventory");
      } else {
        const error = await response.json();
        alert(error.message || t('forms.failed_to_save_part'));
      }
    } catch (error) {
      alert(t('forms.failed_to_save_part'));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      // Ensure number fields are properly handled
      const numberFields = ['cost', 'sellingPrice', 'stockQuantity', 'minStockLevel'];
      if (numberFields.includes(field)) {
        value = Number(value) || 0;
      }
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
                  {isEditing ? t('forms.edit_part') : t('forms.new_part')}
                </h1>
                <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                  {isEditing
                    ? t('forms.update_part_details')
                    : t('forms.add_new_part')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Part Details Section */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 sm:px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F97402] to-[#F13F33] rounded-2xl flex items-center justify-center me-4">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {t('forms.part_details')}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('inventory.name')}</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name ?? ""}
                    onChange={e => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('ui.enter_part_name')}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="partNumber" className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('inventory.part_number')}</label>
                  <input
                    type="text"
                    id="partNumber"
                    value={formData.partNumber}
                    onChange={(e) => handleInputChange("partNumber", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('ui.enter_part_number')}
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
                  <label htmlFor="category" className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('inventory.category')} <span className="text-gray-400 dark:text-gray-500 normal-case">({t('forms.optional')})</span></label>
                  <Combobox
                    options={partCategories}
                    value={formData.category}
                    onChange={value => handleInputChange("category", value)}
                    placeholder={t('inventory.category')}
                    searchPlaceholder={t('forms.search_category')}
                    emptyPlaceholder={t('forms.no_category_found')}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('forms.manufacturer')}</label>
                  <input
                    type="text"
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('ui.enter_manufacturer')}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="cost" className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('inventory.cost')}</label>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    required
                    value={formData.cost || 0}
                    onChange={(e) =>
                      handleInputChange("cost", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('inventory.price')}</label>
                  <input
                    type="number"
                    id="sellingPrice"
                    name="sellingPrice"
                    required
                    value={formData.sellingPrice || 0}
                    onChange={(e) =>
                      handleInputChange("sellingPrice", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('inventory.stock')}</label>
                  <input
                    type="number"
                    id="stockQuantity"
                    required
                    value={formData.stockQuantity || 0}
                    onChange={(e) =>
                      handleInputChange("stockQuantity", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('inventory_alerts.min_stock')}</label>
                  <input
                    type="number"
                    id="minStockLevel"
                    required
                    value={formData.minStockLevel || 0}
                    onChange={(e) =>
                      handleInputChange("minStockLevel", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('forms.location')}</label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('ui.enter_storage_location')}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('vehicles.description')}</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200 resize-none"
                    placeholder={t('ui.enter_part_description')}
                    rows={4}
                  />
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
              {loading ? t('forms.saving') : isEditing ? t('forms.update_part') : t('forms.save_part')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
