'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Users, MapPin, Phone, FileText } from "lucide-react";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";

interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes: string;
}

export default function CustomerForm({ customerId }: { customerId?: string }) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
    },
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
    notes: "",
  });

  const isEditing = !!customerId;

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      if (response.ok) {
        const customer = await response.json();
        setFormData({
          firstName: customer.firstName || "",
          lastName: customer.lastName || "",
          email: customer.email || "",
          phone: customer.phone || "",
          address: {
            street: customer.address?.street || "",
            city: customer.address?.city || "",
            state: customer.address?.state || "",
            zipCode: customer.address?.zipCode || "",
            country: customer.address?.country || "USA",
          },
          emergencyContact: {
            name: customer.emergencyContact?.name || "",
            phone: customer.emergencyContact?.phone || "",
            relationship: customer.emergencyContact?.relationship || "",
          },
          notes: customer.notes || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch customer:", error);
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

  const handleInputChange = (field: string, value: string) => {
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
                  {isEditing ? t('forms.edit_customer') : t('forms.add_new_customer')}
                </h1>
                <p className="mt-3 text-xl text-gray-600">
                  {isEditing
                    ? t('forms.update_customer_information')
                    : t('forms.enter_customer_details')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t('forms.basic_information')}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.first_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_first_name')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.last_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_last_name')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.email_address')}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_email_address')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.phone_number')}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_phone_number')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#063479] to-[#052a5f] rounded-2xl flex items-center justify-center mr-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t('forms.address_information')}
                </h3>
              </div>
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.street_address')}
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) =>
                      handleInputChange("address.street", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('forms.street_address')}
                  />
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      {t('forms.city')}
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) =>
                        handleInputChange("address.city", e.target.value)
                      }
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                      placeholder={t('forms.city')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      {t('forms.state')}
                    </label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) =>
                        handleInputChange("address.state", e.target.value)
                      }
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                      placeholder={t('forms.state')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      {t('forms.zip_code')}
                    </label>
                    <input
                      type="text"
                      value={formData.address.zipCode}
                      onChange={(e) =>
                        handleInputChange("address.zipCode", e.target.value)
                      }
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                      placeholder={t('forms.zip_code')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('forms.emergency_contact')}
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('forms.contact_name')}
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) =>
                    handleInputChange("emergencyContact.name", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('forms.contact_phone')}
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) =>
                    handleInputChange("emergencyContact.phone", e.target.value)
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('forms.relationship')}
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) =>
                    handleInputChange(
                      "emergencyContact.relationship",
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
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
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300 resize-none"
                  placeholder="Enter any additional notes about the customer..."
                />
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
                ? t('forms.update_customer')
                : t('forms.save_customer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}