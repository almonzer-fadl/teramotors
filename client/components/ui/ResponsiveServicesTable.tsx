'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Edit,
  Trash2,
  ArrowUpDown,
  DollarSign,
  Clock,
  Tag,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import { tableRowHover } from '@/lib/dashboard-animations';

interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  laborRate: number;
  laborHours: number;
  isActive: boolean;
  createdAt: string;
}

type SortKey = 'name' | 'category' | 'laborRate' | 'laborHours' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface ResponsiveServicesTableProps {
  services: Service[];
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

export default function ResponsiveServicesTable({
  services,
  sortKey,
  sortDirection,
  onSort,
  onDelete,
  canDelete,
}: ResponsiveServicesTableProps) {
  const { t } = useTranslation('common');

  const renderSortIcon = (key: SortKey) => {
    const active = sortKey === key;
    return (
      <span className="ml-2 inline-flex items-center text-xs text-gray-400 dark:text-gray-500">
        <ArrowUpDown className={`h-4 w-4 ${active ? 'text-[#F97402]' : ''}`} />
        {active && (
          <span className="ml-1 text-[#F97402]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    );
  };

  const getStatusIcon = (isActive: boolean) =>
    isActive ? (
      <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
    );

  const getStatusClasses = (isActive: boolean) =>
    isActive
      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800'
      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800';

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              {[
                { key: 'name', label: t('services.name'), sortable: true },
                { key: 'category', label: t('services.category'), sortable: true },
                { key: 'laborRate', label: t('services.labor_rate'), sortable: true },
                { key: 'laborHours', label: t('services.labor_hours'), sortable: true },
                { key: 'status', label: t('services.status'), sortable: false },
                { key: 'createdAt', label: t('services.created'), sortable: true },
                { key: 'actions', label: t('services.actions'), sortable: false },
              ].map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-start text-xs font-medium uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : ''
                  } text-gray-500 dark:text-gray-400`}
                  onClick={() => col.sortable && onSort(col.key as SortKey)}
                >
                  <div className="flex items-center">
                    <span>{col.label}</span>
                    {col.sortable && renderSortIcon(col.key as SortKey)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {services.map((service) => (
              <motion.tr
                key={service._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                variants={tableRowHover}
                initial="rest"
                whileHover="hover"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</div>
                  {service.description && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {service.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                    {service.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  ${service.laborRate.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {service.laborHours} {t('services.hours')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClasses(service.isActive)}`}>
                    {getStatusIcon(service.isActive)}
                    <span className="ml-1">{service.isActive ? t('services.active') : t('services.inactive')}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(service.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/services/${service._id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                      title={t('common.view')}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/services/${service._id}/edit`}
                      className="text-[#F97402] hover:text-[#F13F33] transition-colors"
                      title={t('common.edit')}
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    {canDelete && (
                      <button
                        onClick={() => onDelete(service._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                        title={t('common.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {services.map((service) => (
          <motion.div
            key={service._id}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            variants={tableRowHover}
            initial="rest"
            whileHover="hover"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{service.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                  {service.category}
                </span>
                {getStatusIcon(service.isActive)}
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                <span>
                  ${service.laborRate.toFixed(2)} · {service.laborHours} {t('services.hours')}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                <span>
                  {t('services.created_on', { date: new Date(service.createdAt).toLocaleDateString() })}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-800 pt-3">
              <Link
                href={`/services/${service._id}`}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Eye className="h-3 w-3 mr-1" />
                {t('common.view')}
              </Link>
              <Link
                href={`/services/${service._id}/edit`}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-[#F97402] hover:bg-[#F13F33] transition-colors"
              >
                <Edit className="h-3 w-3 mr-1" />
                {t('common.edit')}
              </Link>
              {canDelete && (
                <button
                  onClick={() => onDelete(service._id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {t('common.delete')}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
