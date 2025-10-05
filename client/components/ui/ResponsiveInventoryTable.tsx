'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  Edit,
  Trash2,
  Package,
  Tag,
  Building,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ArrowUpDown,
} from 'lucide-react';

interface Part {
  _id: string;
  name: string;
  partNumber: string;
  category: string;
  manufacturer: string;
  cost: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  location: string;
  isActive: boolean;
  createdAt: string;
}

type SortKey = "name" | "partNumber" | "stockQuantity" | "createdAt";
type SortDirection = "asc" | "desc";

interface ResponsiveInventoryTableProps {
  parts: Part[];
  onDelete: (id: string) => void;
  onSort: (key: SortKey) => void;
  sortKey: string;
  sortDirection: SortDirection;
}

export default function ResponsiveInventoryTable({
  parts,
  onDelete,
  onSort,
  sortKey,
  sortDirection,
}: ResponsiveInventoryTableProps) {
  const { t } = useTranslation('common');

  const getStockStatus = (stockQuantity: number, minStockLevel: number) => {
    if (stockQuantity <= 0) {
      return { status: 'out', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    } else if (stockQuantity <= minStockLevel) {
      return { status: 'low', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    } else {
      return { status: 'good', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
  };

  const getStockStatusLabel = (stockQuantity: number, minStockLevel: number) => {
    if (stockQuantity <= 0) {
      return t('inventory.out_of_stock');
    } else if (stockQuantity <= minStockLevel) {
      return t('inventory.low_stock');
    } else {
      return t('inventory.in_stock');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort("name")}
              >
                {t('inventory.name')} <ArrowUpDown className="inline-block me-1 h-4 w-4" />
              </th>
              <th
                className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort("partNumber")}
              >
                {t('inventory.part_number')} <ArrowUpDown className="inline-block me-1 h-4 w-4" />
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.category')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.manufacturer')}
              </th>
              <th
                className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort("stockQuantity")}
              >
                {t('inventory.stock')} <ArrowUpDown className="inline-block me-1 h-4 w-4" />
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.price')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.status')}
              </th>
              <th
                className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort("createdAt")}
              >
                {t('inventory.created')} <ArrowUpDown className="inline-block me-1 h-4 w-4" />
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {parts.map((part) => {
              const stockStatus = getStockStatus(part.stockQuantity, part.minStockLevel);
              const StatusIcon = stockStatus.icon;
              
              return (
                <tr key={part._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <Package className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ms-4">
                        <div className="text-sm font-medium text-gray-900">
                          {part.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {part.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {part.partNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {part.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {part.manufacturer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <StatusIcon className={`h-4 w-4 me-2 ${stockStatus.color.split(' ')[1]}`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {part.stockQuantity}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('inventory.min_level', { level: part.minStockLevel })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="font-medium">${part.sellingPrice.toFixed(2)}</div>
                      <div className="text-xs text-gray-400">
                        {t('inventory.cost_label', { cost: part.cost.toFixed(2) })}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}
                      >
                        {getStockStatusLabel(part.stockQuantity, part.minStockLevel)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          part.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {part.isActive ? t('inventory.active') : t('inventory.inactive')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(part.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/inventory/${part._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => onDelete(part._id)}
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
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {parts.map((part) => {
          const stockStatus = getStockStatus(part.stockQuantity, part.minStockLevel);
          const StatusIcon = stockStatus.icon;
          
          return (
            <div key={part._id} className="bg-white shadow rounded-lg p-4 border border-gray-200">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center me-3">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {part.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {part.partNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}
                  >
                    <StatusIcon className="h-3 w-3 me-1" />
                    {getStockStatusLabel(part.stockQuantity, part.minStockLevel)}
                  </span>
                </div>
              </div>

              {/* Part Details */}
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 me-2 text-gray-500" />
                  <span>{part.category}</span>
                </div>
                <div className="flex items-center">
                  <Building className="h-4 w-4 me-2 text-gray-500" />
                  <span>{part.manufacturer}</span>
                </div>
                <div className="flex items-center">
                  <Package className="h-4 w-4 me-2 text-gray-500" />
                  <span>{part.location}</span>
                </div>
              </div>

              {/* Stock & Price */}
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <StatusIcon className="h-4 w-4 me-2 text-gray-500" />
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {part.stockQuantity}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t('inventory.min_level', { level: part.minStockLevel })}
                    </div>
                  </div>
                </div>
                <div className="text-end">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 me-1 text-green-600" />
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        ${part.sellingPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t('inventory.cost_label', { cost: part.cost.toFixed(2) })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    part.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {part.isActive ? t('inventory.active') : t('inventory.inactive')}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 border-t border-gray-200 pt-3">
                <Link
                  href={`/inventory/${part._id}/edit`}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="h-3 w-3 me-1" />
                  {t('common.edit')}
                </Link>
                <button
                  onClick={() => onDelete(part._id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-3 w-3 me-1" />
                  {t('common.delete')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
