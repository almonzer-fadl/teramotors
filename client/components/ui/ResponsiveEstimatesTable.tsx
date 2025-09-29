'use client';

import React from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Car,
  Calendar,
  DollarSign,
  AlertTriangle,
  Wrench,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  status: "pending" | "approved" | "rejected";
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const getExpiryColor = (validUntil: string) => {
    if (isExpired(validUntil)) {
      return "text-red-600 bg-red-50 border-red-200";
    }
    const daysUntilExpiry = Math.ceil((new Date(validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 3) {
      return "text-orange-600 bg-orange-50 border-orange-200";
    }
    return "text-green-600 bg-green-50 border-green-200";
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('estimates.title')}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('estimates.description')}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              href="/estimates/new"
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              <Plus className="me-2 h-4 w-4" />
              {t('estimates.create_estimate')}
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                <div className="relative flex-1 sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('estimates.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => onStatusFilterChange(e.target.value)}
                  className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                >
                  <option value="all">{t('estimates.all_status')}</option>
                  <option value="pending">{t('estimates.pending')}</option>
                  <option value="approved">{t('estimates.approved')}</option>
                  <option value="rejected">{t('estimates.rejected')}</option>
                </select>
              </div>
              <div className="text-sm text-gray-500 text-center sm:text-end">
                {t(estimates.length === 1 ? 'estimates.estimate_count' : 'estimates.estimate_count_plural', { count: estimates.length })}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('estimates.estimate')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('estimates.customer')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('estimates.vehicle')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('estimates.services')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('estimates.total')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('estimates.status')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('estimates.valid_until')}
                  </th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('estimates.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {estimates.map((estimate) => (
                  <tr key={estimate._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ms-4">
                          <div className="text-sm font-medium text-gray-900">
                            EST-{estimate._id.slice(-6)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(estimate.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 me-2 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {estimate.customerId.firstName} {estimate.customerId.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car className="h-4 w-4 me-2 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {estimate.vehicleId.year} {estimate.vehicleId.make} {estimate.vehicleId.model}
                          </div>
                          <div className="text-sm text-gray-500">
                            {estimate.vehicleId.licensePlate}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Wrench className="h-4 w-4 me-2 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {estimate.services.length} {t('estimates.service')}
                            {estimate.services.length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {estimate.services
                              .map((s) => s.name || (s.serviceId?.name || 'Unknown Service'))
                              .join(', ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 me-2 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            ${estimate.total.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {t('estimates.subtotal')}: ${estimate.subtotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(estimate.status)}
                        <span
                          className={`ms-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            estimate.status
                          )}`}
                        >
                          {t(`estimates.${estimate.status}`)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 me-2 text-gray-400" />
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getExpiryColor(
                            estimate.validUntil
                          )}`}
                        >
                          {new Date(estimate.validUntil).toLocaleDateString()}
                          {isExpired(estimate.validUntil) && (
                            <AlertTriangle className="h-3 w-3 ms-1" />
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/estimates/${estimate._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/estimates/${estimate._id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile/Tablet Cards */}
        <div className="lg:hidden space-y-4">
          {estimates.map((estimate) => (
            <div
              key={estimate._id}
              className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              {/* Card Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        EST-{estimate._id.slice(-6)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(estimate.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(estimate.status)}
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        estimate.status
                      )}`}
                    >
                      {t(`estimates.${estimate.status}`)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 py-4 space-y-4">
                {/* Customer & Vehicle */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {estimate.customerId.firstName} {estimate.customerId.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{t('estimates.customer')}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Car className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {estimate.vehicleId.year} {estimate.vehicleId.make} {estimate.vehicleId.model}
                      </div>
                      <div className="text-xs text-gray-500">{estimate.vehicleId.licensePlate}</div>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <Wrench className="h-4 w-4 me-2 text-gray-400" />
                    {estimate.services.length} {t('estimates.service')}
                    {estimate.services.length !== 1 ? 's' : ''}
                  </div>
                  <div className="space-y-1">
                    {estimate.services.slice(0, 2).map((service, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 truncate flex-1">
                          {service.name || service.serviceId?.name || 'Unknown Service'}
                        </span>
                        <span className="text-gray-500 ml-2">
                          ${service.totalCost.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {estimate.services.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{estimate.services.length - 2} {t('estimates.more_services')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Info */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      ${estimate.total.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">{t('estimates.total')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      ${estimate.subtotal.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">{t('estimates.subtotal')}</div>
                  </div>
                </div>

                {/* Validity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 me-2 text-gray-400" />
                    <span>{t('estimates.valid_until')}</span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getExpiryColor(
                      estimate.validUntil
                    )}`}
                  >
                    {new Date(estimate.validUntil).toLocaleDateString()}
                    {isExpired(estimate.validUntil) && (
                      <AlertTriangle className="h-3 w-3 ms-1" />
                    )}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-end space-x-3">
                  <Link
                    href={`/estimates/${estimate._id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="h-3 w-3 me-1" />
                    {t('common.view')}
                  </Link>
                  <Link
                    href={`/estimates/${estimate._id}/edit`}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-3 w-3 me-1" />
                    {t('common.edit')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {estimates.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {t('estimates.no_estimates_found')}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? t('estimates.adjust_search')
                : t('estimates.get_started')}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <div className="mt-6">
                <Link
                  href="/estimates/new"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
                >
                  <Plus className="me-2 h-4 w-4" />
                  {t('estimates.create_estimate')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
