/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Car, Calendar, Wrench, DollarSign, Gauge, User, Settings } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F13F33] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚗</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600">The requested vehicle could not be found.</p>
          <Link
            href="/vehicles"
            className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-[#F13F33] to-[#d6352a] hover:shadow-xl hover:shadow-[#F13F33]/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Vehicles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center">
              <Link
                href="/vehicles"
                className="mr-6 p-3 text-gray-400 hover:text-[#F13F33] transition-all duration-300 rounded-2xl hover:bg-gray-100 group"
              >
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h1>
                <p className="mt-3 text-xl text-gray-600">
                  {vehicle.licensePlate} • {vehicle.vin}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Vehicle Overview */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Car className="mr-3 h-7 w-7 text-[#F13F33]" />
                  Vehicle Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-gray-50/80 rounded-2xl">
                    <Gauge className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        {t('vehicles.mileage')}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {vehicle.mileage?.toLocaleString() || 'N/A'} miles
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50/80 rounded-2xl">
                    <Settings className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        {t('vehicles.engine')}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {vehicle.engineType || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50/80 rounded-2xl">
                    <Wrench className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        {t('vehicles.transmission')}
                      </p>
                      <p className="text-lg font-bold text-gray-900 capitalize">
                        {vehicle.transmission || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <User className="mr-3 h-7 w-7 text-[#F13F33]" />
                  Owner Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-gray-50/80 rounded-2xl">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        {t('vehicles.owner')}
                      </p>
                      <Link 
                        href={`/customers/${vehicle.customerId._id}`} 
                        className="text-lg font-bold text-[#F13F33] hover:text-[#d6352a] transition-colors duration-300"
                      >
                        {vehicle.customerId.firstName} {vehicle.customerId.lastName}
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50/80 rounded-2xl">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        Year
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {vehicle.year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50/80 rounded-2xl">
                    <Car className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        Color
                      </p>
                      <p className="text-lg font-bold text-gray-900 capitalize">
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
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Wrench className="mr-3 h-7 w-7 text-[#F13F33]" />
              {t('vehicles.service_history')}
            </h2>
            
            {vehicle.serviceHistory && vehicle.serviceHistory.length > 0 ? (
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/80">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          <Calendar className="inline h-4 w-4 mr-2" />
                          {t('vehicles.date')}
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          <Wrench className="inline h-4 w-4 mr-2" />
                          {t('vehicles.service')}
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          <DollarSign className="inline h-4 w-4 mr-2" />
                          {t('vehicles.cost')}
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          <Gauge className="inline h-4 w-4 mr-2" />
                          {t('vehicles.mileage')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 divide-y divide-gray-200">
                      {vehicle.serviceHistory.map((service: any, index: number) => (
                        <tr key={service._id || index} className="hover:bg-gray-50/80 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            {new Date(service.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {service.serviceId?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#F13F33]">
                            ${service.cost?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                <Wrench className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Service History</h3>
                <p className="text-gray-600">This vehicle doesn't have any service records yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Photos */}
        {vehicle.photos && vehicle.photos.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Car className="mr-3 h-7 w-7 text-[#F13F33]" />
                Vehicle Photos
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vehicle.photos.map((photo: string, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Vehicle photo ${index + 1}`}
                      className="rounded-2xl object-cover w-full h-48 shadow-lg group-hover:shadow-xl transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}