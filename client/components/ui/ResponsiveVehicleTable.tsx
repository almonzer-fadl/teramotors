'use client';

import React from 'react';
import Link from 'next/link';
import { Edit, Trash2, Eye, Car, User, Gauge, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Vehicle {
  _id: string;
  customerId?: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  mileage: number;
  transmission: string;
  fuelType: string;
  isActive: boolean;
  createdAt: string;
}

interface ResponsiveVehicleTableProps {
  vehicles: Vehicle[];
  onDelete: (id: string) => void;
}

export default function ResponsiveVehicleTable({ 
  vehicles, 
  onDelete
}: ResponsiveVehicleTableProps) {
  const { t } = useTranslation('common');

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('vehicles.vehicle')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('vehicles.owner')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('vehicles.license_plate')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('vehicles.mileage')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('vehicles.transmission')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('customers.status')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('customers.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.map((vehicle) => {
              const customerName = vehicle.customerId ? 
                `${vehicle.customerId.firstName} ${vehicle.customerId.lastName}` : 
                t('vehicles.no_customer');
              
              return (
                <tr key={vehicle._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Car className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div className="ms-4">
                        <div className="text-sm font-medium text-gray-900">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {t('vehicles.vin')} {vehicle.vin?.slice(-8) || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 me-2 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">{customerName}</div>
                        <div className="text-sm text-gray-500">{vehicle.color}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {vehicle.licensePlate}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Gauge className="h-4 w-4 me-2 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {vehicle.mileage.toLocaleString()} {t('vehicles.miles')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 me-2 text-gray-400" />
                      <span className="text-sm text-gray-900">{vehicle.transmission}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vehicle.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {vehicle.isActive ? t('customers.active') : t('customers.inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/vehicles/${vehicle._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/vehicles/${vehicle._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => onDelete(vehicle._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden">
        <div className="divide-y divide-gray-200">
          {vehicles.map((vehicle) => {
            const customerName = vehicle.customerId ? 
              `${vehicle.customerId.firstName} ${vehicle.customerId.lastName}` : 
              t('vehicles.no_customer');
            
            return (
              <div key={vehicle._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Car className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-medium text-gray-900 truncate">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {customerName}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {vehicle.color} • {vehicle.licensePlate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/vehicles/${vehicle._id}`}
                      className="text-blue-600 hover:text-blue-900 p-1"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/vehicles/${vehicle._id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 p-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(vehicle._id)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Gauge className="h-4 w-4 me-2" />
                      <span>{vehicle.mileage.toLocaleString()} {t('vehicles.miles')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Settings className="h-4 w-4 me-2" />
                      <span>{vehicle.transmission}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {t('vehicles.vin')} {vehicle.vin?.slice(-8) || "N/A"}
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vehicle.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {vehicle.isActive ? t('customers.active') : t('customers.inactive')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
