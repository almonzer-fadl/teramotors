'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Car,
  Calendar,
  DollarSign,
  Wrench,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { tableRowHover, fadeInUp } from '@/lib/dashboard-animations';

interface Estimate {
  _id: string;
  jobCardId: {
    _id: string;
  };
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  vehicleId: {
    _id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  mechanicId: {
    _id: string;
    fullName: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  services: Array<{
    name: string;
    serviceId: {
      _id: string;
      name: string;
    };
    quantity: number;
    laborCost: number;
    partsCost: number;
    totalCost: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  notes?: string;
  createdAt: string;
}

interface ResponsiveEstimatesTableProps {
  estimates: Estimate[];
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (status: string) => void;
}

export default function ResponsiveEstimatesTable({
  estimates,
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}: ResponsiveEstimatesTableProps) {
  const { t } = useTranslation('common');

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const isExpired = (validUntil: string) => new Date(validUntil) < new Date();

  const getExpiryClasses = (validUntil: string) => {
    if (isExpired(validUntil)) {
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
    const daysUntil = Math.ceil((new Date(validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 3) {
      return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
    }
    return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  };

  return (
    <div className="space-y-6">
      {/* Search / Filters */}
      <motion.div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm" variants={fadeInUp}>
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('estimates.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-[#F97402] focus:border-[#F97402]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2 focus:ring-[#F97402] focus:border-[#F97402]"
              >
                <option value="all">{t('estimates.all_status')}</option>
                <option value="pending">{t('estimates.pending')}</option>
                <option value="approved">{t('estimates.approved')}</option>
                <option value="rejected">{t('estimates.rejected')}</option>
              </select>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-right">
              {t(estimates.length === 1 ? 'estimates.estimate_count' : 'estimates.estimate_count_plural', { count: estimates.length })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('estimates.estimate')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('estimates.customer')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('estimates.vehicle')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('estimates.services')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('estimates.total')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('estimates.status')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('estimates.valid_until')}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('estimates.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {estimates.map((estimate) => (
                <motion.tr
                  key={estimate._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  variants={tableRowHover}
                  initial="rest"
                  whileHover="hover"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      EST-{estimate._id.slice(-6)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(estimate.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {estimate.customerId.firstName} {estimate.customerId.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {estimate.vehicleId.year} {estimate.vehicleId.make} {estimate.vehicleId.model}
                    <div className="text-xs text-gray-500 dark:text-gray-400">{estimate.vehicleId.licensePlate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {(estimate.services || []).slice(0, 2).map((service) => (
                      <div key={service.serviceId?._id || service.name} className="flex items-center">
                        <Wrench className="h-4 w-4 me-2 text-gray-400 dark:text-gray-500" />
                        <span className="truncate">{service.name || service.serviceId?.name}</span>
                      </div>
                    ))}
                    {estimate.services.length > 2 && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        +{estimate.services.length - 2}{' '}
                        {t('estimates.more_services', { defaultValue: 'more services' })}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                    ${estimate.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClasses(estimate.status)}`}>
                      {getStatusIcon(estimate.status)}
                      <span className="ms-1">{t(`estimates.${estimate.status}`)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getExpiryClasses(estimate.validUntil)}`}>
                      {new Date(estimate.validUntil).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/estimates/${estimate._id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/estimates/${estimate._id}/edit`}
                        className="text-[#F97402] hover:text-[#F13F33] transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {estimates.map((estimate) => (
          <motion.div
            key={estimate._id}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            variants={tableRowHover}
            initial="rest"
            whileHover="hover"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  EST-{estimate._id.slice(-6)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(estimate.createdAt).toLocaleDateString()}
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusClasses(estimate.status)}`}>
                {getStatusIcon(estimate.status)}
                <span className="ms-1">{t(`estimates.${estimate.status}`)}</span>
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
              <div className="flex items-center">
                <User className="h-4 w-4 me-2 text-gray-500 dark:text-gray-400" />
                <span>
                  {estimate.customerId.firstName} {estimate.customerId.lastName}
                </span>
              </div>
              <div className="flex items-center">
                <Car className="h-4 w-4 me-2 text-gray-500 dark:text-gray-400" />
                <span>
                  {estimate.vehicleId.year} {estimate.vehicleId.make} {estimate.vehicleId.model}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 me-2 text-gray-500 dark:text-gray-400" />
                <span>{estimate.vehicleId.licensePlate}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 me-2 text-gray-500 dark:text-gray-400" />
                <span>${estimate.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-800 pt-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getExpiryClasses(estimate.validUntil)}`}>
                {new Date(estimate.validUntil).toLocaleDateString()}
              </span>
              <div className="flex items-center space-x-2">
                <Link
                  href={`/estimates/${estimate._id}`}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <Link
                  href={`/estimates/${estimate._id}/edit`}
                  className="text-[#F97402] hover:text-[#F13F33] transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
