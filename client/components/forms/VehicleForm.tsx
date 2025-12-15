/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Loader2, Car } from "lucide-react";
import { motion } from "framer-motion";
import FileUpload from "@/components/dashboard/FileUpload";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";
import { CAR_MAKES, getModelsForMake } from "@/lib/data/carMakesModels";
import { fadeInUp } from "@/lib/dashboard-animations";
import { useReferenceData } from "@/lib/stores/referenceDataStore";

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
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
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

  // Use global cache for customers
  const { customers: cachedCustomers, fetchCustomers: fetchCachedCustomers, invalidateVehicles } = useReferenceData();

  const fetchCustomers = async () => {
    try {
      // Try to use cached customers first
      if (cachedCustomers && cachedCustomers.length > 0) {
        setCustomers(cachedCustomers);
        return;
      }

      // Otherwise fetch from cache store (will use cache or fetch)
      await fetchCachedCustomers();
      if (cachedCustomers && cachedCustomers.length > 0) {
        setCustomers(cachedCustomers);
      }
    } catch (error) {
      setCustomers([]);
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

        // Set up available models for current make
        const models = getModelsForMake(vehicle.make);
        setAvailableModels(models);
        setCustomMake(!CAR_MAKES.includes(vehicle.make));

        // Set customer search text
        if (vehicle.customerId) {
          setCustomerSearch(`${vehicle.customerId.firstName} ${vehicle.customerId.lastName}`);
        }
      }
    } catch (error) {
      alert(t("forms.failed_to_load_vehicle"));
    }
  };

  useEffect(() => {
    fetchCustomers();
    if (isEditing) {
      fetchVehicle();
    }
  }, [vehicleId, isEditing]);

  // Update customers when cache changes
  useEffect(() => {
    if (cachedCustomers && cachedCustomers.length > 0) {
      setCustomers(cachedCustomers);
    }
  }, [cachedCustomers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return; // Prevent double-submit

    setLoading(true);

    try {
      const url = isEditing ? `/api/vehicles/${vehicleId}` : "/api/vehicles";
      const method = isEditing ? "PUT" : "POST";

      const dataToSubmit = {
        ...formData,
        vin: formData.vin !== "" ? formData.vin : t("forms.na"),
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        socket.emit("vehicle-created");
        invalidateVehicles(); // Invalidate cache after create/update
        alert(isEditing ? t("forms.vehicle_updated") : t("forms.vehicle_created"));
        router.push("/vehicles");
      } else {
        const error = await response.json();
        alert(error.message || t("forms.failed_to_save_vehicle"));
      }
    } catch (error) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="me-6 p-3 text-gray-400 dark:text-gray-500 hover:text-[#F97402] dark:hover:text-[#F97402] transition-all duration-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group"
              >
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  {isEditing ? t("forms.edit_vehicle") : t("forms.new_vehicle")}
                </h1>
                <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                  {isEditing
                    ? t("forms.update_vehicle_information")
                    : t("forms.enter_vehicle_details")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          {/* Vehicle Information Section */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F97402] to-[#F13F33] rounded-xl flex items-center justify-center me-4 shadow-lg shadow-[#F97402]/25">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {t("vehicles.title")}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Customer - Searchable */}
                <div className="space-y-2 relative">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t("forms.customer")} *
                  </label>
                  <div className="relative" ref={customerDropdownRef}>
                    <input
                      type="text"
                      required
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowCustomerDropdown(true);
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      placeholder={t("forms.search_customer")}
                      className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    />
                    {showCustomerDropdown && customerSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-auto">
                        {customers
                          .filter(customer => {
                            const search = customerSearch.toLowerCase();
                            return (
                              customer.firstName.toLowerCase().includes(search) ||
                              customer.lastName.toLowerCase().includes(search)
                            );
                          })
                          .map((customer) => (
                            <button
                              key={customer._id}
                              type="button"
                              onClick={() => {
                                handleInputChange("customerId", customer._id);
                                setCustomerSearch(`${customer.firstName} ${customer.lastName}`);
                                setShowCustomerDropdown(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                            >
                              {customer.firstName} {customer.lastName}
                            </button>
                          ))}
                        {customers.filter(c => {
                          const search = customerSearch.toLowerCase();
                          return (
                            c.firstName.toLowerCase().includes(search) ||
                            c.lastName.toLowerCase().includes(search)
                          );
                        }).length === 0 && (
                          <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                            {t("forms.no_customers_found")}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* VIN */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t("vehicles.vin")}
                  </label>
                  <input
                    type="text"
                    value={formData.vin}
                    onChange={(e) => handleInputChange("vin", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('ui.enter_vin_number')}
                  />
                </div>

                {/* Make */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
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
                      className="flex-1 px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
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
                        className="flex-1 px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                        placeholder={t('ui.enter_vehicle_make')}
                      />
                    )}
                  </div>
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
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
                      className="flex-1 px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
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
                        className="flex-1 px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                        placeholder={t('ui.enter_vehicle_model')}
                      />
                    )}
                  </div>
                </div>

                {/* Year */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t("vehicles.year")} *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", parseInt(e.target.value))}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('ui.enter_vehicle_year')}
                  />
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t("vehicles.color")}
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('ui.enter_vehicle_color')}
                  />
                </div>

                {/* License Plate */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t("vehicles.license_plate")} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.licensePlate}
                    onChange={(e) => handleInputChange("licensePlate", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('ui.enter_license_plate')}
                  />
                </div>

                {/* Mileage */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t("vehicles.mileage")}
                  </label>
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange("mileage", parseInt(e.target.value))}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('ui.enter_mileage')}
                  />
                </div>

                {/* Engine Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t("vehicles.engine")}
                  </label>
                  <input
                    type="text"
                    value={formData.engineType}
                    onChange={(e) => handleInputChange("engineType", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('ui.enter_engine_type')}
                  />
                </div>

                {/* Transmission */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t("vehicles.transmission")}
                  </label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => handleInputChange("transmission", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                  >
                    <option value="automatic">{t("vehicles.automatic")}</option>
                    <option value="manual">{t("vehicles.manual")}</option>
                    <option value="cvt">{t("vehicles.cvt")}</option>
                  </select>
                </div>

                {/* Fuel Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t("vehicles.fuel_type")}
                  </label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => handleInputChange("fuelType", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
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

          {/* Vehicle Photos Section */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-6">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center me-4 shadow-lg shadow-purple-500/25">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {t("forms.vehicle_photos")}
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={t("forms.vehicle_photo_alt", { index: index + 1 })}
                      className="w-full h-32 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 dark:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 dark:hover:bg-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <FileUpload onUpload={async (files: File[]) => {
                  for (const file of files) {
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
                      alert(t("forms.upload_failed"));
                    }
                  }
                }} />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#F97402] hover:text-[#F97402] hover:bg-[#F97402]/5 active:scale-[0.98] transition-all duration-200"
            >
              <X className="inline-block me-2 h-5 w-5" />
              {t("forms.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="me-2 h-5 w-5 animate-spin" />
                  {t("forms.saving")}
                </>
              ) : (
                <>
                  <Save className="me-2 h-5 w-5" />
                  {isEditing ? t("forms.update_vehicle") : t("forms.save_vehicle")}
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
