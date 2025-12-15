'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, MapPin, Edit, Car, User, FileText, Loader2, Building2, Hash, Languages } from 'lucide-react';
import { fadeInUp, scaleIn } from '@/lib/dashboard-animations';

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  plateNumber?: string;
  licensePlate?: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  whatsappEnabled?: boolean;
  language?: 'ar' | 'en';
  address?: Address;
  companyName?: string;
  vatNumber?: string;
  idNumber?: string;
  notes?: string;
  vehicles: Vehicle[];
}

export default function CustomerDetailPage() {
  const { t } = useTranslation('common');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (id) {
      const fetchCustomer = async (customerId: string) => {
        try {
          const res = await fetch(`/api/customers/${customerId}`, {
            cache: 'no-store',
          });
          if (!res.ok) {
            return notFound();
          }
          const data = await res.json();
          setCustomer(data);
        } catch (error) {
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer(id as string);
    }
  }, [id]);

  if (loading) {
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

  if (!customer) {
    return notFound();
  }

  const InfoCard = ({ icon: Icon, label, value, iconColor }: { icon: any; label: string; value: string; iconColor: string }) => (
    <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:border-[#F97402]/30 transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className={`p-3 ${iconColor} rounded-xl`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-base font-semibold text-gray-900 dark:text-white break-words">{value || '-'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#F97402] transition-all duration-200 group"
              >
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  {customer.firstName} {customer.lastName}
                </h1>
                <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                  {t('customers.customer_details')}
                </p>
              </div>
            </div>
            <Link
              href={`/customers/${id}/edit`}
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Edit className="me-2 h-5 w-5" />
              {t('customers.edit_customer')}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Contact Information */}
          <motion.div
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
          >
            <div className="px-6 py-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F97402] to-[#F13F33] rounded-xl flex items-center justify-center shadow-lg shadow-[#F97402]/25">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  {t('customers.personal_information')}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={Mail} label={t('customers.email')} value={customer.email} iconColor="bg-blue-500" />
                <InfoCard icon={Phone} label={t('customers.phone')} value={customer.phone} iconColor="bg-green-500" />
                {customer.phoneNumber && customer.phoneNumber !== customer.phone && (
                  <InfoCard icon={Phone} label="WhatsApp Number" value={customer.phoneNumber} iconColor="bg-emerald-500" />
                )}
                {customer.language && (
                  <InfoCard
                    icon={Languages}
                    label="Language"
                    value={customer.language === 'ar' ? 'العربية (Arabic)' : 'English'}
                    iconColor="bg-purple-500"
                  />
                )}
              </div>
            </div>
          </motion.div>

          {/* Address Information */}
          {customer.address && (customer.address.street || customer.address.city) && (
            <motion.div
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <div className="px-6 py-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                    {t('forms.address_information')}
                  </h2>
                </div>
                <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="space-y-3">
                    {customer.address.street && (
                      <p className="text-base text-gray-900 dark:text-white font-medium">{customer.address.street}</p>
                    )}
                    <p className="text-base text-gray-700 dark:text-gray-300">
                      {[customer.address.city, customer.address.state, customer.address.zipCode].filter(Boolean).join(', ')}
                    </p>
                    {customer.address.country && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{customer.address.country}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Business Information */}
          {(customer.companyName || customer.vatNumber || customer.idNumber) && (
            <motion.div
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <div className="px-6 py-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                    Business Information
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.companyName && (
                    <InfoCard icon={Building2} label="Company Name" value={customer.companyName} iconColor="bg-amber-500" />
                  )}
                  {customer.vatNumber && (
                    <InfoCard icon={Hash} label="VAT Number" value={customer.vatNumber} iconColor="bg-violet-500" />
                  )}
                  {customer.idNumber && (
                    <InfoCard icon={Hash} label="CR / License / ID No" value={customer.idNumber} iconColor="bg-cyan-500" />
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Notes */}
          {customer.notes && (
            <motion.div
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <div className="px-6 py-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                    {t('forms.additional_notes')}
                  </h2>
                </div>
                <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">{customer.notes}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Vehicles */}
          {customer.vehicles && customer.vehicles.length > 0 && (
            <motion.div
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                      <Car className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                        {t('customers.vehicles')}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {customer.vehicles.length} {customer.vehicles.length === 1 ? 'vehicle' : 'vehicles'} registered
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/vehicles"
                    className="inline-flex items-center px-4 py-2 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-[#F97402]/10 hover:text-[#F97402] transition-all duration-200"
                  >
                    View All
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customer.vehicles.slice(0, 6).map((vehicle) => (
                    <Link
                      key={vehicle._id}
                      href={`/vehicles/${vehicle._id}`}
                      className="group bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50 hover:border-[#F97402] hover:bg-[#F97402]/5 dark:hover:bg-[#F97402]/10 transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-red-500/10 rounded-xl flex-shrink-0">
                          <Car className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#F97402] transition-colors truncate">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {vehicle.year} • {vehicle.plateNumber || vehicle.licensePlate || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {customer.vehicles.length > 6 && (
                  <div className="mt-4 text-center">
                    <Link
                      href="/vehicles"
                      className="inline-flex items-center text-sm font-medium text-[#F97402] hover:text-[#F13F33] transition-colors"
                    >
                      View {customer.vehicles.length - 6} more vehicles
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
