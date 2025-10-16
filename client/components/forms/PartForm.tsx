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
  });

  // Debug logging
  console.log('Part categories:', partCategories);
  console.log('Current category value:', formData.category);

  // Track formData changes
  useEffect(() => {
    console.log('PartForm formData changed:', formData);
  }, [formData]);

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
            });
          }
        } catch (error) {
          console.error("Failed to fetch part:", error);
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

      // Prepare data for submission - handle empty partNumber
      const submitData = { ...formData };
      if (submitData.partNumber === '') {
        submitData.partNumber = undefined;
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
      console.error("Failed to save part:", error);
      alert(t('forms.failed_to_save_part'));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    console.log('PartForm handleInputChange:', { field, value, currentFormData: formData });
    setFormData((prev) => {
      // Ensure number fields are properly handled
      const numberFields = ['cost', 'sellingPrice', 'stockQuantity', 'minStockLevel'];
      if (numberFields.includes(field)) {
        value = Number(value) || 0;
      }
      const newData = { ...prev, [field]: value };
      console.log('PartForm new form data:', newData);
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
                  {isEditing ? t('forms.edit_part') : t('forms.new_part')}
                </h1>
                <p className="mt-3 text-xl text-gray-600">
                  {isEditing
                    ? t('forms.update_part_details')
                    : t('forms.add_new_part')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Part Details Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center mr-4">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t('forms.part_details')}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700">{t('inventory.name')}</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name ?? ""}
                    onChange={e => handleInputChange("name", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_part_name')}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="partNumber" className="block text-sm font-bold text-gray-700">{t('inventory.part_number')}</label>
                  <input
                    type="text"
                    id="partNumber"
                    value={formData.partNumber}
                    onChange={(e) => handleInputChange("partNumber", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_part_number')}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-bold text-gray-700">{t('inventory.category')} <span className="text-gray-400">({t('forms.optional')})</span></label>
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
                  <label htmlFor="manufacturer" className="block text-sm font-bold text-gray-700">{t('forms.manufacturer')}</label>
                  <input
                    type="text"
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_manufacturer')}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="cost" className="block text-sm font-bold text-gray-700">{t('inventory.cost')}</label>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    required
                    value={formData.cost || 0}
                    onChange={(e) =>
                      handleInputChange("cost", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="sellingPrice" className="block text-sm font-bold text-gray-700">{t('inventory.price')}</label>
                  <input
                    type="number"
                    id="sellingPrice"
                    name="sellingPrice"
                    required
                    value={formData.sellingPrice || 0}
                    onChange={(e) =>
                      handleInputChange("sellingPrice", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="stockQuantity" className="block text-sm font-bold text-gray-700">{t('inventory.stock')}</label>
                  <input
                    type="number"
                    id="stockQuantity"
                    required
                    value={formData.stockQuantity || 0}
                    onChange={(e) =>
                      handleInputChange("stockQuantity", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="minStockLevel" className="block text-sm font-bold text-gray-700">{t('inventory_alerts.min_stock')}</label>
                  <input
                    type="number"
                    id="minStockLevel"
                    required
                    value={formData.minStockLevel || 0}
                    onChange={(e) =>
                      handleInputChange("minStockLevel", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="location" className="block text-sm font-bold text-gray-700">{t('forms.location')}</label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_storage_location')}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label htmlFor="description" className="block text-sm font-bold text-gray-700">{t('vehicles.description')}</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300 resize-none"
                    placeholder={t('ui.enter_part_description')}
                    rows={4}
                  />
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
              {loading ? t('forms.saving') : isEditing ? t('forms.update_part') : t('forms.save_part')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}