'use client';

import React from 'react';
import Link from 'next/link';
import { Edit, Trash2, Eye, Phone, Mail, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { tableRowHover } from '@/lib/dashboard-animations';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  vehicles: number | Array<unknown>;
  isActive: boolean;
  createdAt: string;
}

type SortKey = "name" | "createdAt";
type SortDirection = "asc" | "desc";

interface ResponsiveTableProps {
  customers: Customer[];
  onDelete: (id: string) => void;
  onSort: (key: SortKey) => void;
  sortKey: string;
  sortDirection: SortDirection;
}

export default function ResponsiveTable({ 
  customers, 
  onDelete, 
  onSort, 
  sortKey, 
  sortDirection 
}: ResponsiveTableProps) {
  const { t } = useTranslation('common');

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800/50 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th
                className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => onSort("name")}
              >
                {t("customers.name")}
                <span className="ms-1">
                  {sortKey === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                </span>
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("customers.contact")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("customers.address")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("customers.vehicles")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("customers.status")}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("customers.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {customers.map((customer) => (
              <motion.tr
                key={customer._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                variants={tableRowHover}
                initial="rest"
                whileHover="hover"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="ms-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {customer._id.slice(-8)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{customer.email}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {customer.address?.street && customer.address?.city
                      ? `${customer.address.street}, ${customer.address.city}`
                      : 'No address'
                    }
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {customer.address?.state && customer.address?.zipCode
                      ? `${customer.address.state} ${customer.address.zipCode}`
                      : ''
                    }
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30 backdrop-blur-sm">
                    {typeof customer.vehicles === 'number' ? customer.vehicles : (Array.isArray(customer.vehicles) ? customer.vehicles.length : 0)} {t("customers.vehicles")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.isActive
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                    }`}
                  >
                    {customer.isActive ? t("customers.active") : t("customers.inactive")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/customers/${customer._id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/customers/${customer._id}/edit`}
                      className="text-[#F97402] hover:text-[#F13F33] transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this customer? This will archive related vehicles.')) {
                          onDelete(customer._id)
                        }
                      }}
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
          {customers.map((customer) => (
            <motion.div
              key={customer._id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              variants={tableRowHover}
              initial="rest"
              whileHover="hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-medium text-gray-900 dark:text-white truncate">
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {customer.email}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {customer.phone}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/customers/${customer._id}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/customers/${customer._id}/edit`}
                    className="text-[#F97402] hover:text-[#F13F33] p-1 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => onDelete(customer._id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="h-4 w-4 me-2" />
                  <span className="truncate">
                    {customer.address?.street && customer.address?.city && customer.address?.state
                      ? `${customer.address.street}, ${customer.address.city}, ${customer.address.state}`
                      : 'No address'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30 backdrop-blur-sm">
                      {typeof customer.vehicles === 'number' ? customer.vehicles : (Array.isArray(customer.vehicles) ? customer.vehicles.length : 0)} {t("customers.vehicles")}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.isActive
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                          : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                      }`}
                    >
                      {customer.isActive ? t("customers.active") : t("customers.inactive")}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
