'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Users, MapPin, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";
import { fadeInUp } from "@/lib/dashboard-animations";
import { useReferenceData } from "@/lib/stores/referenceDataStore";

interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneNumber: string;
  whatsappEnabled: boolean;
  language: 'ar' | 'en';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  vatNumber: string;
  idNumber: string;
  companyName: string;
  notes: string;
}

export default function CustomerForm({ customerId }: { customerId?: string }) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingCustomer, setFetchingCustomer] = useState(false);
  const { invalidateCustomers } = useReferenceData();
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneNumber: "",
    whatsappEnabled: true,
    language: "ar",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Saudi Arabia",
    },
    vatNumber: "",
    idNumber: "",
    companyName: "",
    notes: "",
  });

  const isEditing = !!customerId;

  const fetchCustomer = async () => {
    setFetchingCustomer(true);
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      if (response.ok) {
        const customer = await response.json();
        setFormData({
          firstName: customer.firstName || "",
          lastName: customer.lastName || "",
          email: customer.email || "",
          phone: customer.phone || "",
          phoneNumber: customer.phoneNumber || customer.phone || "",
          whatsappEnabled: customer.whatsappEnabled !== false,
          language: customer.language || "ar",
          address: {
            street: customer.address?.street || "",
            city: customer.address?.city || "",
            state: customer.address?.state || "",
            zipCode: customer.address?.zipCode || "",
            country: customer.address?.country || "Saudi Arabia",
          },
          vatNumber: customer.vatNumber || "",
          idNumber: customer.idNumber || "",
          companyName: customer.companyName || "",
          notes: customer.notes || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch customer:", error);
    } finally {
      setFetchingCustomer(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      fetchCustomer();
    }
  }, [customerId, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing ? `/api/customers/${customerId}` : "/api/customers";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        socket.emit("customer-created");
        invalidateCustomers(); // Invalidate cache after create/update
        router.push("/customers");
      } else {
        const error = await response.json();
        alert(error.message || t('forms.failed_to_save_customer'));
      }
    } catch (error) {
      console.error("Failed to save customer:", error);
      alert(t('forms.failed_to_save_customer'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => {
      const newFormData = { ...prev };
      const fieldParts = field.split(".");

      if (fieldParts.length === 2) {
        const [parent, child] = fieldParts as [
          keyof CustomerFormData,
          keyof CustomerFormData[keyof CustomerFormData]
        ];
        (newFormData[parent] as any)[child] = value;
      } else {
        (newFormData as any)[field] = value;
      }

      return newFormData;
    });
  };

  // Show loading skeleton while fetching customer data
  if (fetchingCustomer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#F97402] transition-all duration-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#F97402]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#F97402] transition-all duration-200 group"
            >
              <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                {isEditing ? t('forms.edit_customer') : t('forms.add_new_customer')}
              </h1>
              <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                {isEditing
                  ? t('forms.update_customer_information')
                  : t('forms.enter_customer_details')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form - Animate container only */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F97402] to-[#F13F33] rounded-xl flex items-center justify-center shadow-lg shadow-[#F97402]/25">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {t('forms.basic_information')}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('forms.first_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('ui.enter_first_name')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('forms.last_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('ui.enter_last_name')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('forms.email_address')}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('ui.enter_email_address')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('forms.phone_number')}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('ui.enter_phone_number')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder="+966590090612 (leave empty to use phone number)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Language Preference
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange("language", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                    <option value="ar">العربية (Arabic)</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="whatsappEnabled"
                      checked={formData.whatsappEnabled}
                      onChange={(e) => handleInputChange("whatsappEnabled", e.target.checked)}
                      className="h-4 w-4 text-[#F13F33] focus:ring-[#F13F33] border-gray-300 rounded"
                    />
                    <label htmlFor="whatsappEnabled" className="ms-2 block text-sm font-bold text-gray-700">
                      Enable WhatsApp Messages
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Customer will receive automatic WhatsApp messages for job updates
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-6">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#063479] to-[#052a5f] rounded-2xl flex items-center justify-center me-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {t('forms.address_information')}
                </h3>
              </div>
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t('forms.street_address')}
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) =>
                      handleInputChange("address.street", e.target.value)
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder={t('forms.street_address')}
                  />
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      {t('forms.city')}
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) =>
                        handleInputChange("address.city", e.target.value)
                      }
                      className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                      placeholder={t('forms.city')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      {t('forms.state')}
                    </label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) =>
                        handleInputChange("address.state", e.target.value)
                      }
                      className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                      placeholder={t('forms.state')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      {t('forms.zip_code')}
                    </label>
                    <input
                      type="text"
                      value={formData.address.zipCode}
                      onChange={(e) =>
                        handleInputChange("address.zipCode", e.target.value)
                      }
                      className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                      placeholder={t('forms.zip_code')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-6">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center me-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  Business Information
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) =>
                      handleInputChange("companyName", e.target.value)
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder="Enter Company Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    VAT Number
                  </label>
                  <input
                    type="text"
                    value={formData.vatNumber}
                    onChange={(e) =>
                      handleInputChange("vatNumber", e.target.value)
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder="Enter VAT Number (15 digits)"
                    maxLength={15}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    CR / License / ID No
                  </label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) =>
                      handleInputChange("idNumber", e.target.value)
                    }
                    className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                    placeholder="Enter CR / License / ID No (10 digits)"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-6">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center me-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {t('forms.additional_notes')}
                </h3>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  {t('forms.notes')}
                </label>
                <textarea
                  rows={6}
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 resize-none transition-all duration-200"
                  placeholder="Enter any additional notes about the customer..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#F97402] hover:text-[#F97402] hover:bg-[#F97402]/5 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="me-2 h-5 w-5" />
              {t('forms.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="me-2 h-5 w-5 animate-spin" />
                  {t('forms.saving')}
                </>
              ) : (
                <>
                  <Save className="me-2 h-5 w-5" />
                  {isEditing ? t('forms.update_customer') : t('forms.save_customer')}
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
