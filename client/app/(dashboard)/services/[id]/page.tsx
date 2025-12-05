'use client'

import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Wrench, DollarSign, Clock, Tag, Calendar, TrendingUp, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  laborRate: number;
  laborHours: number;
  isActive: boolean;
  uniqueCode?: string;
  createdAt: string;
  updatedAt?: string;
}

interface JobCard {
  _id: string;
  customerId: { firstName: string; lastName: string };
  vehicleId: { make: string; model: string; year: number };
  createdAt: string;
  status: string;
}

export default function ServiceDetailsPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [service, setService] = useState<Service | null>(null);
  const [usage, setUsage] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      try {
        const [serviceRes, usageRes] = await Promise.all([
          fetch(`/api/services/${id}`),
          fetch(`/api/services/${id}/usage`),
        ]);

        if (serviceRes.ok) {
          const serviceData = await serviceRes.json();
          setService(serviceData);
        }

        if (usageRes.ok) {
          const usageData = await usageRes.json();
          setUsage(usageData.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch service data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97402] mx-auto"></div>
          <p className="mt-4 text-base text-gray-700 dark:text-gray-300">{t('common.loading')}...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('services.not_found')}</h2>
          <Link href="/services" className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg hover:scale-[1.02] transition-all duration-200">
            <ArrowLeft className="me-2 h-5 w-5" />
            {t('services.back_to_services')}
          </Link>
        </div>
      </div>
    );
  }

  const totalCost = service.laborRate * service.laborHours;
  const timesUsed = usage.length;
  const totalRevenue = totalCost * timesUsed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="mr-6 p-3 text-gray-600 dark:text-gray-400 hover:text-[#F97402] transition-all duration-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group"
                >
                  <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    {service.name}
                  </h1>
                  <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                    {service.uniqueCode && `Code: ${service.uniqueCode}`}
                    {service.category && ` • ${service.category}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/services/${service._id}/edit`}
                  className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <Edit className="me-2 h-5 w-5" />
                  {t('common.edit')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Details */}
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 sm:px-8 py-8">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F97402] to-[#F13F33] rounded-2xl flex items-center justify-center mr-4">
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                    {t('services.service_details')}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {service.description && (
                    <div className="md:col-span-2 space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('services.description')}</p>
                      <p className="text-base text-gray-900 dark:text-white">{service.description}</p>
                    </div>
                  )}
                  {service.category && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('services.category')}</p>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 text-gray-500 dark:text-gray-400 me-2" />
                        <p className="text-base text-gray-900 dark:text-white">{service.category}</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('services.status')}</p>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        service.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }`}>
                        {service.isActive ? t('services.active') : t('services.inactive')}
                      </span>
                    </div>
                  </div>
                  {service.createdAt && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('services.created_on')}</p>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 me-2" />
                        <p className="text-base text-gray-900 dark:text-white">{new Date(service.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Usage History */}
            {usage.length > 0 && (
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-6 sm:px-8 py-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                      {t('services.usage_history')}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {usage.slice(0, 10).map((job) => (
                      <Link
                        key={job._id}
                        href={`/job-cards/${job._id}`}
                        className="block px-4 py-3 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base text-gray-900 dark:text-white font-medium">
                              {job.customerId.firstName} {job.customerId.lastName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {job.vehicleId.year} {job.vehicleId.make} {job.vehicleId.model}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              job.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                              job.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                              'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                            }`}>
                              {t(`status.${job.status.replace('-', '_')}`)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Pricing */}
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mr-4">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('services.pricing')}
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base text-gray-600 dark:text-gray-400">{t('services.labor_rate')}</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">${service.laborRate.toFixed(2)}/hr</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base text-gray-600 dark:text-gray-400">{t('services.labor_hours')}</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">{service.laborHours} hrs</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium text-gray-900 dark:text-white">{t('services.total_cost')}</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-[#F97402] to-[#F13F33] bg-clip-text text-transparent">
                        ${totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t('services.statistics')}
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('services.times_used')}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{timesUsed}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t('services.total_revenue')}</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-[#F97402] to-[#F13F33] bg-clip-text text-transparent">
                      ${totalRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
