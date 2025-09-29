'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
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
} from 'lucide-react';
import StatusBadge from '@/components/dashboard/StatusBadge';

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

type SortKey = "name" | "category" | "laborRate" | "laborHours" | "createdAt";
type SortDirection = "asc" | "desc";

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

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    return (
      <ArrowUpDown 
        className={`h-4 w-4 ${sortDirection === 'asc' ? 'text-blue-600' : 'text-blue-600'}`} 
      />
    );
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? t('services.active') : t('services.inactive');
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("name")}
              >
                <div className="flex items-center">
                  {t('services.name')}
                  {getSortIcon("name")}
                </div>
              </th>
              <th
                className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("category")}
              >
                <div className="flex items-center">
                  {t('services.category')}
                  {getSortIcon("category")}
                </div>
              </th>
              <th
                className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("laborRate")}
              >
                <div className="flex items-center">
                  {t('services.labor_rate')}
                  {getSortIcon("laborRate")}
                </div>
              </th>
              <th
                className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("laborHours")}
              >
                <div className="flex items-center">
                  {t('services.labor_hours')}
                  {getSortIcon("laborHours")}
                </div>
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('services.status')}
              </th>
              <th
                className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort("createdAt")}
              >
                <div className="flex items-center">
                  {t('services.created')}
                  {getSortIcon("createdAt")}
                </div>
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('services.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {service.name}
                  </div>
                  {service.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {service.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {service.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${service.laborRate.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {service.laborHours} {t('services.hours')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge
                    status={service.isActive ? "active" : "inactive"}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(service.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/services/${service._id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                      title={t('common.edit')}
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    {canDelete && (
                      <button
                        onClick={() => onDelete(service._id)}
                        className="text-red-600 hover:text-red-900"
                        title={t('common.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {services.map((service) => (
          <div key={service._id} className="bg-white shadow rounded-lg p-4 border border-gray-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {service.description}
                  </p>
                )}
              </div>
              <div className="flex items-center ms-2">
                {getStatusIcon(service.isActive)}
                <span className={`ms-2 text-xs font-medium ${
                  service.isActive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {getStatusLabel(service.isActive)}
                </span>
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-2 text-sm text-gray-700 mb-4">
              <div className="flex items-center">
                <Tag className="h-4 w-4 me-2 text-gray-500" />
                <span className="font-medium">{t('services.category')}:</span>
                <span className="ms-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {service.category}
                </span>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 me-2 text-gray-500" />
                <span className="font-medium">{t('services.labor_rate')}:</span>
                <span className="ms-2 text-gray-900">${service.laborRate.toFixed(2)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 me-2 text-gray-500" />
                <span className="font-medium">{t('services.labor_hours')}:</span>
                <span className="ms-2 text-gray-900">{service.laborHours} {t('services.hours')}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 me-2 text-gray-500" />
                <span className="font-medium">{t('services.created')}:</span>
                <span className="ms-2 text-gray-900">
                  {new Date(service.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 border-t border-gray-200 pt-3">
              <Link
                href={`/services/${service._id}/edit`}
                className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Edit className="h-3 w-3 me-1" />
                {t('common.edit')}
              </Link>
              {canDelete && (
                <button
                  onClick={() => onDelete(service._id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-3 w-3 me-1" />
                  {t('common.delete')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
