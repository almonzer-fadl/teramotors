'use client';

import React from 'react';
import Link from 'next/link';
import { Edit, Trash2, Eye, Car, User, Gauge, Settings, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { tableRowHover } from '@/lib/dashboard-animations';

interface Vehicle {
    _id: string;
    customerId?: {
      _id: string;
      firstName: string;
      lastName: string;
    } | null;
    vin?: string;
    make: string;
    model: string;
    year: number;
    color?: string;
    licensePlate?: string;
    mileage?: number | null;
    transmission?: string;
    fuelType?: string;
    isActive?: boolean;
    createdAt?: string;
}

type SortKey = "make" | "model" | "year" | "licensePlate";
type SortDirection = "asc" | "desc";

interface ResponsiveVehiclesTableProps {
  vehicles: Vehicle[];
  onDelete: (id: string) => void;
  onSort: (key: SortKey) => void;
  sortKey: string;
  sortDirection: SortDirection;
}

export default function ResponsiveVehiclesTable({
  vehicles,
  onDelete,
  onSort,
  sortKey,
  sortDirection
}: ResponsiveVehiclesTableProps) {
  const { t } = useTranslation('common');

  const handleDelete = (id: string) => {
    if (window.confirm(t('vehicles.delete_confirm', 'Are you sure you want to delete this vehicle?'))) {
      onDelete(id);
    }
  };

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('vehicles.vehicle', 'Vehicle')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('vehicles.owner', 'Owner')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('vehicles.license_plate', 'License Plate')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('vehicles.mileage', 'Mileage')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('vehicles.transmission', 'Transmission')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('customers.status', 'Status')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('customers.actions', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {vehicles.map((vehicle) => {
              const customerName = vehicle.customerId ?
                `${vehicle.customerId.firstName} ${vehicle.customerId.lastName}` :
                t('vehicles.no_customer', 'No Customer');

              return (
                <motion.tr
                  key={vehicle._id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-150"
                  variants={tableRowHover}
                  initial="rest"
                  whileHover="hover"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#F97402] to-[#F13F33] flex items-center justify-center shadow-lg shadow-[#F97402]/25">
                          <Car className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ms-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {t('vehicles.vin', 'VIN')} {vehicle.vin?.slice(-8) || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 me-2 text-gray-400 dark:text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white">{customerName}</div>
                        {vehicle.color && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{vehicle.color}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30 backdrop-blur-sm">
                      {vehicle.licensePlate || t('common.na', 'N/A')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Gauge className="h-4 w-4 me-2 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {typeof vehicle.mileage === 'number' ? vehicle.mileage.toLocaleString() : '-'} {t('vehicles.miles', 'mi')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 me-2 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm text-gray-900 dark:text-white">{vehicle.transmission || t('common.na', 'N/A')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                        vehicle.isActive !== false
                          ? "bg-green-50/80 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-800/30"
                          : "bg-red-50/80 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-800/30"
                      }`}
                    >
                      {vehicle.isActive !== false ? t('customers.active', 'Active') : t('customers.inactive', 'Inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/vehicles/${vehicle._id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/vehicles/${vehicle._id}/edit`}
                        className="text-[#F97402] hover:text-[#F13F33] transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(vehicle._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {vehicles.map((vehicle) => {
            const customerName = vehicle.customerId ?
              `${vehicle.customerId.firstName} ${vehicle.customerId.lastName}` :
              t('vehicles.no_customer', 'No Customer');

            return (
              <motion.div
                key={vehicle._id}
                className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-150"
                variants={tableRowHover}
                initial="rest"
                whileHover="hover"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#F97402] to-[#F13F33] flex items-center justify-center shadow-lg shadow-[#F97402]/25">
                        <Car className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-medium text-gray-900 dark:text-white truncate">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {customerName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {vehicle.color} • {vehicle.licensePlate || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/vehicles/${vehicle._id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/vehicles/${vehicle._id}/edit`}
                      className="text-[#F97402] hover:text-[#F13F33] p-1 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(vehicle._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Gauge className="h-4 w-4 me-2" />
                      <span>{typeof vehicle.mileage === 'number' ? vehicle.mileage.toLocaleString() : '-'} {t('vehicles.miles', 'mi')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Settings className="h-4 w-4 me-2" />
                      <span>{vehicle.transmission || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t('vehicles.vin', 'VIN')} {vehicle.vin?.slice(-8) || "N/A"}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                        vehicle.isActive !== false
                          ? "bg-green-50/80 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-800/30"
                          : "bg-red-50/80 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-800/30"
                      }`}
                    >
                      {vehicle.isActive !== false ? t('customers.active', 'Active') : t('customers.inactive', 'Inactive')}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
