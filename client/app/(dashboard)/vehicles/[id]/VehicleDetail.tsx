/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Car, Calendar, Wrench, DollarSign, Gauge, User, Settings, Edit } from 'lucide-react';
import { fadeInUp } from '@/lib/dashboard-animations';

export default function VehicleDetail({ vehicleId }: { vehicleId: string }) {
  const { t } = useTranslation('common');
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getVehicle() {
      if (!vehicleId) return;
      const res = await fetch(`/api/vehicles/${vehicleId}`);
      if (!res.ok) {
        setVehicle(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setVehicle(data);
      setLoading(false);
    }
    getVehicle();
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97402] mx-auto"></div>
          <p className="mt-4 text-base text-gray-700 dark:text-gray-300">{t('vehicles.loading_vehicle_details')}</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🚗</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('vehicles.vehicle_not_found')}</h2>
          <p className="text-base text-gray-700 dark:text-gray-300 mb-8">{t('vehicles.vehicle_not_found_description')}</p>
          <Link
            href="/vehicles"
            className="inline-flex items-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <ArrowLeft className="me-2 h-5 w-5" />
            {t('vehicles.back_to_vehicles')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  href="/vehicles"
                  className="me-6 p-3 text-gray-400 dark:text-gray-500 hover:text-[#F97402] dark:hover:text-[#F97402] transition-all duration-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group"
                >
                  <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                  <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                    {vehicle.licensePlate} • {vehicle.vin}
                  </p>
                </div>
              </div>
              <Link
                href={`/vehicles/${vehicleId}/edit`}
                className="inline-flex items-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Edit className="me-2 h-5 w-5" />
                {t('forms.edit_vehicle')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="space-y-6"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          {/* Vehicle Overview */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#F97402] to-[#F13F33] rounded-xl flex items-center justify-center me-3 shadow-lg shadow-[#F97402]/25">
                      <Car className="h-5 w-5 text-white" />
                    </div>
                    {t('vehicles.vehicle_information')}
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                      <Gauge className="h-5 w-5 text-gray-400 dark:text-gray-500 me-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          {t('vehicles.mileage')}
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {vehicle.mileage?.toLocaleString() || 'N/A'} {t('vehicles.miles')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                      <Settings className="h-5 w-5 text-gray-400 dark:text-gray-500 me-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          {t('vehicles.engine')}
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {vehicle.engineType || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                      <Wrench className="h-5 w-5 text-gray-400 dark:text-gray-500 me-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          {t('vehicles.transmission')}
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white capitalize">
                          {vehicle.transmission || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Owner Information */}
                <div className="space-y-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center me-3 shadow-lg shadow-blue-500/25">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    {t('vehicles.owner_information')}
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                      <User className="h-5 w-5 text-gray-400 dark:text-gray-500 me-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          {t('vehicles.owner')}
                        </p>
                        {vehicle.customerId ? (
                          <Link
                            href={`/customers/${vehicle.customerId._id}`}
                            className="text-base font-semibold text-[#F97402] hover:text-[#F13F33] transition-colors duration-200"
                          >
                            {vehicle.customerId.firstName} {vehicle.customerId.lastName}
                          </Link>
                        ) : (
                          <span className="text-base font-semibold text-gray-500 dark:text-gray-400">
                            {t('vehicles.no_customer_assigned')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                      <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500 me-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          {t('vehicles.year')}
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {vehicle.year}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                      <Car className="h-5 w-5 text-gray-400 dark:text-gray-500 me-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                          {t('vehicles.color')}
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white capitalize">
                          {vehicle.color || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service History */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center me-3 shadow-lg shadow-green-500/25">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                {t('vehicles.service_history')}
              </h2>

              {vehicle.serviceHistory && vehicle.serviceHistory.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                      <thead className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <Calendar className="inline h-4 w-4 me-2" />
                            {t('vehicles.date')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <Wrench className="inline h-4 w-4 me-2" />
                            {t('vehicles.service')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <DollarSign className="inline h-4 w-4 me-2" />
                            {t('vehicles.cost')}
                          </th>
                          <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            <Gauge className="inline h-4 w-4 me-2" />
                            {t('vehicles.mileage')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {vehicle.serviceHistory.map((service: any, index: number) => (
                          <tr key={service._id || index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(service.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {service.serviceId?.name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#F97402]">
                              ${service.cost?.toFixed(2) || '0.00'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {service.mileage?.toLocaleString() || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center">
                    <Wrench className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('vehicles.no_service_history')}</h3>
                  <p className="text-base text-gray-700 dark:text-gray-300">{t('vehicles.no_service_records')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Photos */}
          {vehicle.photos && vehicle.photos.length > 0 && (
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center me-3 shadow-lg shadow-purple-500/25">
                    <Car className="h-5 w-5 text-white" />
                  </div>
                  {t('vehicles.vehicle_photos')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {vehicle.photos.map((photo: string, index: number) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Vehicle photo ${index + 1}`}
                        className="rounded-xl object-cover w-full h-48 border border-gray-200 dark:border-gray-700 group-hover:scale-[1.02] transition-transform duration-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
