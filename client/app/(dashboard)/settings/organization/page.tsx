"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Building2,
  ArrowLeft,
  Upload,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

interface OrganizationData {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  country: string;
  logo?: string;
  vatNumber?: string;
  crNumber?: string;
}

export default function OrganizationPage() {
  const { user } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<OrganizationData>({
    name: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    country: "Saudi Arabia",
    logo: undefined,
    vatNumber: "",
    crNumber: "",
  });

  useEffect(() => {
    // Simulate API call - replace with actual API
    const fetchOrganization = async () => {
      try {
        // Mock data - replace with: const response = await fetch('/api/tenant/branding')
        await new Promise(resolve => setTimeout(resolve, 500));
        setFormData({
          name: "Quick Fix Auto Repairs",
          email: "info@quickfix.sa",
          phone: "+966 50 123 4567",
          website: "https://quickfix.sa",
          address: "123 Main Street",
          city: "Riyadh",
          country: "Saudi Arabia",
          vatNumber: "123456789012345",
          crNumber: "1234567890",
        });
      } catch (error) {
        console.error('Error fetching organization:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaved(false);
    setError("");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Logo must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, logo: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      // const response = await fetch('/api/tenant/branding', { method: 'PUT', body: JSON.stringify(formData) })
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 className="w-8 h-8 text-[#F97402] animate-spin" />
          <p className="mt-4 text-gray-500">Loading organization...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/settings" className="me-4">
                <motion.button
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  whileHover={{ x: -3 }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Organization Settings
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage your workshop branding and details
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Success Message */}
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-center"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 me-3" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                    Changes saved successfully!
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 me-3" />
                  <span className="text-red-700 dark:text-red-300 font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Logo Upload */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                  Workshop Logo
                </h2>

                <div className="flex items-start gap-6">
                  <div
                    className={`w-32 h-32 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden ${
                      logoPreview || formData.logo
                        ? "border-transparent"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {logoPreview || formData.logo ? (
                      <img
                        src={logoPreview || formData.logo}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Upload your workshop logo. Recommended size: 512x512px. Maximum file size: 2MB.
                    </p>

                    <div className="flex gap-3">
                      <motion.button
                        type="button"
                        className="inline-flex items-center px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 me-2" />
                        Upload Logo
                      </motion.button>

                      {(logoPreview || formData.logo) && (
                        <motion.button
                          type="button"
                          className="inline-flex items-center px-4 py-2.5 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleRemoveLogo}
                        >
                          <Trash2 className="w-4 h-4 me-2" />
                          Remove
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Business Information */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                  Business Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Building2 className="w-4 h-4 inline-block me-2" />
                      Business Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500"
                      placeholder="Your workshop name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Mail className="w-4 h-4 inline-block me-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500"
                      placeholder="contact@workshop.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Phone className="w-4 h-4 inline-block me-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500"
                      placeholder="+966 50 123 4567"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Globe className="w-4 h-4 inline-block me-2" />
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500"
                      placeholder="https://yourworkshop.com"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Address */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                  Location
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <MapPin className="w-4 h-4 inline-block me-2" />
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500"
                      placeholder="Riyadh"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Country
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                    >
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="Kuwait">Kuwait</option>
                      <option value="Bahrain">Bahrain</option>
                      <option value="Qatar">Qatar</option>
                      <option value="Oman">Oman</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tax Information */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                  Tax & Registration
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      VAT Number
                    </label>
                    <input
                      type="text"
                      name="vatNumber"
                      value={formData.vatNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500"
                      placeholder="15 digit VAT number"
                    />
                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      Required for ZATCA e-invoicing compliance
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Commercial Registration Number
                    </label>
                    <input
                      type="text"
                      name="crNumber"
                      value={formData.crNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500"
                      placeholder="CR Number"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.div
              variants={itemVariants}
              className="flex justify-end"
            >
              <motion.button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white font-semibold rounded-xl shadow-lg shadow-[#F97402]/25 hover:shadow-xl transition-shadow disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 me-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 me-2" />
                    Save Changes
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
