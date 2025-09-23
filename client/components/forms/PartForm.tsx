'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Plus } from "lucide-react";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";
import { Combobox } from "@/components/ui/Combobox";

interface CompatibleVehicle {
  make: string;
  model: string;
  year: number;
}

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
  partNumber: string;
  compatibleVehicles: CompatibleVehicle[];
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
    compatibleVehicles: [],
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
              cost: part.cost || 0,
              sellingPrice: part.sellingPrice || 0,
              stockQuantity: part.stockQuantity || 0,
              minStockLevel: part.minStockLevel || 0,
              location: part.location || "",
              partNumber: part.partNumber || "",
              compatibleVehicles: part.compatibleVehicles || [],
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

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompatibleVehicleChange = (
    index: number,
    field: keyof CompatibleVehicle,
    value: string | number
  ) => {
    const updatedVehicles = [...formData.compatibleVehicles];
    updatedVehicles[index] = { ...updatedVehicles[index], [field]: value };
    handleInputChange("compatibleVehicles", updatedVehicles);
  };

  const addCompatibleVehicle = () => {
    handleInputChange("compatibleVehicles", [
      ...formData.compatibleVehicles,
      { make: "", model: "", year: new Date().getFullYear() },
    ]);
  };

  const removeCompatibleVehicle = (index: number) => {
    const updatedVehicles = formData.compatibleVehicles.filter(
      (_, i) => i !== index
    );
    handleInputChange("compatibleVehicles", updatedVehicles);
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
              {isEditing ? t('forms.edit_part') : t('forms.new_part')}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditing
                ? t('forms.update_part_details')
                : t('forms.add_new_part')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form fields for part details */}
        <div className="bg-white shadow rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('inventory.name')}</label>
            <input
              type="text"
              id="name"
              required
              value={formData.name ?? ""}
              onChange={e => handleInputChange("name", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="partNumber" className="block text-sm font-medium text-gray-700">{t('inventory.part_number')}</label>
            <input
              type="text"
              id="partNumber"
              required
              value={formData.partNumber}
              onChange={(e) => handleInputChange("partNumber", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">{t('inventory.category')}</label>
            <Combobox
              options={partCategories}
              value={formData.category}
              onChange={value => handleInputChange("category", value)}
              placeholder={t('inventory.category')}
              searchPlaceholder={t('forms.search_category')}
              emptyPlaceholder={t('forms.no_category_found')}
            />
          </div>
          <div>
            <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700">{t('forms.manufacturer')}</label>
            <input
              type="text"
              id="manufacturer"
              value={formData.manufacturer}
              onChange={(e) => handleInputChange("manufacturer", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700">{t('job_cards.cost')}</label>
            <input
              type="number"
              id="cost"
              name="cost"
              required
              value={formData.cost}
              onChange={(e) =>
                handleInputChange("cost", parseFloat(e.target.value))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700">{t('inventory.price')}</label>
            <input
              type="number"
              id="sellingPrice"
              name="sellingPrice"
              required
              value={formData.sellingPrice}
              onChange={(e) =>
                handleInputChange("sellingPrice", parseFloat(e.target.value))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">{t('inventory.stock')}</label>
            <input
              type="number"
              id="stockQuantity"
              required
              value={formData.stockQuantity}
              onChange={(e) =>
                handleInputChange("stockQuantity", parseInt(e.target.value))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-700">{t('inventory_alerts.min_stock')}</label>
            <input
              type="number"
              id="minStockLevel"
              required
              value={formData.minStockLevel}
              onChange={(e) =>
                handleInputChange("minStockLevel", parseInt(e.target.value))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">{t('forms.location')}</label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
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
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('forms.compatible_vehicles')}
          </h3>
          {formData.compatibleVehicles.map((vehicle, index) => (
            <div
              key={index}
              className="grid grid-cols-4 gap-4 items-center mb-2"
            >
              <div>
                <label htmlFor={`make-${index}`} className="block text-sm font-medium text-gray-700">{t('vehicles.make')}</label>
                <input
                  type="text"
                  id={`make-${index}`}
                  value={vehicle.make}
                  onChange={(e) =>
                    handleCompatibleVehicleChange(index, "make", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor={`model-${index}`} className="block text-sm font-medium text-gray-700">{t('vehicles.model')}</label>
                <input
                  type="text"
                  id={`model-${index}`}
                  value={vehicle.model}
                  onChange={(e) =>
                    handleCompatibleVehicleChange(index, "model", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor={`year-${index}`} className="block text-sm font-medium text-gray-700">{t('vehicles.year')}</label>
                <input
                  type="number"
                  id={`year-${index}`}
                  value={vehicle.year}
                  onChange={(e) =>
                    handleCompatibleVehicleChange(
                      index,
                      "year",
                      parseInt(e.target.value)
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeCompatibleVehicle(index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addCompatibleVehicle}
            className="mt-4 inline-flex items-center px-4 py-2 border border-dashed border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('forms.add_vehicle')}
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
            {loading ? t('forms.saving') : isEditing ? t('forms.update_part') : t('forms.save_part')}
          </button>
        </div>
      </form>
    </div>
  );
}