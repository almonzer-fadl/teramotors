/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Plus } from "lucide-react";
import FileUpload from "@/components/dashboard/FileUpload";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";
import { CAR_MAKES_MODELS, CAR_MAKES, getModelsForMake } from "@/lib/data/carMakesModels";

interface CustomerMinimal {
  _id: string;
  firstName: string;
  lastName: string;
}

interface VehicleFormData {
  customerId: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  mileage: number;
  engineType: string;
  transmission: "manual" | "automatic" | "cvt";
  fuelType: "gasoline" | "diesel" | "hybrid" | "electric";
  photos: string[];
}

export default function VehicleForm({ vehicleId }: { vehicleId?: string }) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerMinimal[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [customMake, setCustomMake] = useState(false);
  const [customModel, setCustomModel] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>({
    customerId: "",
    vin: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    licensePlate: "",
    mileage: 0,
    engineType: "",
    transmission: "automatic",
    fuelType: "gasoline",
    photos: [],
  });

  const isEditing = !!vehicleId;

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        // The customers API returns { customers: [...], pagination: {...} }
        const customersArray = Array.isArray(data.customers) ? data.customers : (Array.isArray(data) ? data : []);
        console.log('Fetched customers for vehicle form:', customersArray);
        setCustomers(customersArray);
      } else {
        console.error("Failed to fetch customers:", response.status, response.statusText);
        setCustomers([]);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]); // Set empty array on error
    }
  };

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`);
      if (response.ok) {
        const vehicle = await response.json();
        setFormData({
          customerId: vehicle.customerId?._id || "",
          vin: vehicle.vin || "",
          make: vehicle.make || "",
          model: vehicle.model || "",
          year: vehicle.year || new Date().getFullYear(),
          color: vehicle.color || "",
          licensePlate: vehicle.licensePlate || "",
          mileage: vehicle.mileage || 0,
          engineType: vehicle.engineType || "",
          transmission: vehicle.transmission || "automatic",
          fuelType: vehicle.fuelType || "gasoline",
          photos: vehicle.photos || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch vehicle:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    if (isEditing) {
      fetchVehicle();
    }
  }, [vehicleId, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing ? `/api/vehicles/${vehicleId}` : "/api/vehicles";
      const method = isEditing ? "PUT" : "POST";
      setFormData({
        ...formData,
        vin: formData.vin !== "" ? formData.vin : t("forms.na"),
      });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        socket.emit("vehicle-created");
        router.push("/vehicles");
      } else {
        const error = await response.json();
        alert(error.message || t("forms.failed_to_save_vehicle"));
      }
    } catch (error) {
      console.error("Failed to save vehicle:", error);
      alert(t("forms.failed_to_save_vehicle"));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Update available models when make changes
    if (field === 'make') {
      const models = getModelsForMake(value as string);
      setAvailableModels(models);
      setCustomMake(!CAR_MAKES.includes(value as string));
      
      // Reset model if it's not available for the new make
      if (models.length > 0 && !models.includes(formData.model)) {
        setFormData(prev => ({ ...prev, model: '' }));
        setCustomModel(false);
      }
    }
  };

  const handlePhotoUpload = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, url],
    }));
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
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
                  {isEditing ? t("forms.edit_vehicle") : t("forms.new_vehicle")}
                </h1>
                <p className="mt-3 text-xl text-gray-600">
                  {isEditing
                    ? t("forms.update_vehicle_information")
                    : t("forms.enter_vehicle_details")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12">

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center mr-4">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t("vehicles.title")}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("forms.customer")} *
                  </label>
                  <select
                    required
                    value={formData.customerId}
                    onChange={(e) =>
                      handleInputChange("customerId", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                  <option value="">{t("forms.select_customer")}</option>
                  {customers.map((customer) => (
                    <option
                      key={customer._id.toString()}
                      value={customer._id.toString()}
                    >
                      {customer.firstName} {customer.lastName}
                    </option>
                  ))}
                </select>
              </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("vehicles.vin")}
                  </label>
                  <input
                    type="text"
                    value={formData.vin}
                    onChange={(e) => handleInputChange("vin", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_vin_number')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("vehicles.make")} *
                  </label>
                  <div className="flex gap-2">
                    <select
                      required
                      value={customMake ? 'custom' : formData.make}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setCustomMake(true);
                          setFormData(prev => ({ ...prev, make: '' }));
                        } else {
                          setCustomMake(false);
                          handleInputChange("make", e.target.value);
                        }
                      }}
                      className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    >
                      <option value="">{t('forms.select_make')}</option>
                      {CAR_MAKES.map((make) => (
                        <option key={make} value={make}>
                          {make}
                        </option>
                      ))}
                      <option value="custom">{t('forms.custom_make')}</option>
                    </select>
                    {customMake && (
                      <input
                        type="text"
                        required
                        value={formData.make}
                        onChange={(e) => handleInputChange("make", e.target.value)}
                        className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                        placeholder={t('ui.enter_vehicle_make')}
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("vehicles.model")} *
                  </label>
                  <div className="flex gap-2">
                    <select
                      required
                      value={customModel ? 'custom' : formData.model}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setCustomModel(true);
                          setFormData(prev => ({ ...prev, model: '' }));
                        } else {
                          setCustomModel(false);
                          handleInputChange("model", e.target.value);
                        }
                      }}
                      className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                      disabled={!formData.make}
                    >
                      <option value="">{t('forms.select_model')}</option>
                      {availableModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                      <option value="custom">{t('forms.custom_model')}</option>
                    </select>
                    {customModel && (
                      <input
                        type="text"
                        required
                        value={formData.model}
                        onChange={(e) => handleInputChange("model", e.target.value)}
                        className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                        placeholder={t('ui.enter_vehicle_model')}
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("vehicles.year")} *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) =>
                      handleInputChange("year", parseInt(e.target.value))
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_vehicle_year')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("vehicles.color")}
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_vehicle_color')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("vehicles.license_plate")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.licensePlate}
                    onChange={(e) =>
                      handleInputChange("licensePlate", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_license_plate')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("vehicles.mileage")}
                  </label>
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) =>
                      handleInputChange("mileage", parseInt(e.target.value))
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_mileage')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("vehicles.engine")}
                  </label>
                  <input
                    type="text"
                    value={formData.engineType}
                    onChange={(e) =>
                      handleInputChange("engineType", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_engine_type')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("vehicles.transmission")}
                  </label>
                  <select
                    value={formData.transmission}
                    onChange={(e) =>
                      handleInputChange("transmission", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                  <option value="automatic">{t("vehicles.automatic")}</option>
                  <option value="manual">{t("vehicles.manual")}</option>
                  <option value="cvt">{t("vehicles.cvt")}</option>
                </select>
              </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("vehicles.fuel_type")}
                  </label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) =>
                      handleInputChange("fuelType", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                  <option value="gasoline">{t("vehicles.gasoline")}</option>
                  <option value="diesel">{t("vehicles.diesel")}</option>
                  <option value="hybrid">{t("vehicles.hybrid")}</option>
                  <option value="electric">{t("vehicles.electric")}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t("forms.vehicle_photos")}
                </h3>
              </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={t("forms.vehicle_photo_alt", { index: index + 1 })}
                    className="w-full h-auto rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <FileUpload onUpload={async (files: File[]) => {
                for (const file of files) {
                  // Upload file and get URL, then call handlePhotoUpload
                  const formData = new FormData();
                  formData.append('file', file);
                  
                  try {
                    const response = await fetch('/api/upload', {
                      method: 'POST',
                      body: formData,
                    });
                    
                    if (response.ok) {
                      const { secure_url } = await response.json();
                      handlePhotoUpload(secure_url);
                    }
                  } catch (error) {
                    console.error('Upload failed:', error);
                  }
                }
              }} />
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
              {t("forms.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group inline-flex items-center px-8 py-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-[#F13F33] to-[#d6352a] hover:shadow-xl hover:shadow-[#F13F33]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5"
            >
              <Save className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
              {loading
                ? t("forms.saving")
                : isEditing
                ? t("forms.update_vehicle")
                : t("forms.save_vehicle")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
