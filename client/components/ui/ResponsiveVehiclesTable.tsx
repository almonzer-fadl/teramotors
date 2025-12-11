'use client';

import React from 'react';
import Link from 'next/link';
import { Edit, Trash2, Eye, Car } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { tableRowHover } from '@/lib/dashboard-animations';

interface Vehicle {
    _id: string;
    make: string;
    model: string;
    year: number;
    licensePlate?: string;
    vin?: string;
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
  const { t } = useTranslation('common'); // Assuming vehicle translations are in common

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800/50 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th
                className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => onSort("make")}
              >
                {t("vehicles.make")}
                <span className="ms-1">
                  {sortKey === "make" && (sortDirection === "asc" ? "↑" : "↓")}
                </span>
              </th>
              <th
                className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => onSort("model")}
              >
                {t("vehicles.model")}
                <span className="ms-1">
                  {sortKey === "model" && (sortDirection === "asc" ? "↑" : "↓")}
                </span>
              </th>
              <th
                className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => onSort("year")}
              >
                {t("vehicles.year")}
                <span className="ms-1">
                  {sortKey === "year" && (sortDirection === "asc" ? "↑" : "↓")}
                </span>
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("vehicles.license_plate")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("vehicles.vin")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {vehicles.map((vehicle) => (
              <motion.tr
                key={vehicle._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                variants={tableRowHover}
                initial="rest"
                whileHover="hover"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="ms-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {vehicle.make}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {vehicle._id.slice(-8)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{vehicle.model}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{vehicle.year}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{vehicle.licensePlate || t('common.na')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{vehicle.vin || t('common.na')}</div>
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
                      onClick={() => onDelete(vehicle._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {vehicles.map((vehicle) => (
            <motion.div
              key={vehicle._id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              variants={tableRowHover}
              initial="rest"
              whileHover="hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-medium text-gray-900 dark:text-white truncate">
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </div>
                    {vehicle.licensePlate && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {t('vehicles.license_plate')}: {vehicle.licensePlate}
                      </div>
                    )}
                    {vehicle.vin && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {t('vehicles.vin')}: {vehicle.vin}
                      </div>
                    )}
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
                    onClick={() => onDelete(vehicle._id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
