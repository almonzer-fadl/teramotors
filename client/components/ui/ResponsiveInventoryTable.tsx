'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
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
  Eye,
} from 'lucide-react';
import { tableRowHover } from '@/lib/dashboard-animations';

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

type SortKey = 'name' | 'partNumber' | 'stockQuantity' | 'createdAt';
type SortDirection = 'asc' | 'desc';

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

  const renderSortIndicator = (key: SortKey) => {
    if (sortKey !== key) return null;
    return (
      <span className="ml-1 text-xs">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const getStockStatus = (stockQuantity: number, minStockLevel: number) => {
    if (stockQuantity <= 0) {
      return {
        color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
        icon: AlertTriangle,
        iconColor: 'text-red-500 dark:text-red-400',
      };
    }

    if (stockQuantity <= minStockLevel) {
      return {
        color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
        icon: AlertTriangle,
        iconColor: 'text-yellow-500 dark:text-yellow-400',
      };
    }

    return {
      color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
      icon: CheckCircle,
      iconColor: 'text-green-500 dark:text-green-400',
    };
  };

  const getStockStatusLabel = (stockQuantity: number, minStockLevel: number) => {
    if (stockQuantity <= 0) return t('inventory.out_of_stock');
    if (stockQuantity <= minStockLevel) return t('inventory.low_stock');
    return t('inventory.in_stock');
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800/50 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th
                className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => onSort('name')}
              >
                {t('inventory.name')}
                <ArrowUpDown className="inline-block ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                {renderSortIndicator('name')}
              </th>
              <th
                className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => onSort('partNumber')}
              >
                {t('inventory.part_number')}
                <ArrowUpDown className="inline-block ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                {renderSortIndicator('partNumber')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('inventory.category')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('inventory.manufacturer')}
              </th>
              <th
                className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => onSort('stockQuantity')}
              >
                {t('inventory.stock')}
                <ArrowUpDown className="inline-block ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                {renderSortIndicator('stockQuantity')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('inventory.price')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('inventory.status')}
              </th>
              <th
                className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => onSort('createdAt')}
              >
                {t('inventory.created')}
                <ArrowUpDown className="inline-block ms-2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                {renderSortIndicator('createdAt')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('inventory.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {parts.map((part) => {
              const stockStatus = getStockStatus(part.stockQuantity, part.minStockLevel);
              const StatusIcon = stockStatus.icon;

              return (
                <motion.tr
                  key={part._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  variants={tableRowHover}
                  initial="rest"
                  whileHover="hover"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 dark:bg-blue-900/30 flex items-center justify-center">
                          <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="ms-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{part.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{part.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {part.partNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {part.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {part.manufacturer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <StatusIcon className={`h-4 w-4 me-2 ${stockStatus.iconColor}`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{part.stockQuantity}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {t('inventory.min_level', { level: part.minStockLevel })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">${part.sellingPrice.toFixed(2)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('inventory.cost_label', { cost: part.cost.toFixed(2) })}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {getStockStatusLabel(part.stockQuantity, part.minStockLevel)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          part.isActive
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                        }`}
                      >
                        {part.isActive ? t('inventory.active') : t('inventory.inactive')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(part.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/inventory/${part._id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/inventory/${part._id}/edit`}
                        className="text-[#F97402] hover:text-[#F13F33] transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => onDelete(part._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                        title="Delete"
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
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {parts.map((part) => {
          const stockStatus = getStockStatus(part.stockQuantity, part.minStockLevel);
          const StatusIcon = stockStatus.icon;

          return (
            <motion.div
              key={part._id}
              className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800/30 rounded-lg p-4 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              variants={tableRowHover}
              initial="rest"
              whileHover="hover"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 dark:bg-blue-900/30 flex items-center justify-center me-3">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{part.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{part.partNumber}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                  <StatusIcon className={`h-3 w-3 me-1 ${stockStatus.iconColor}`} />
                  {getStockStatusLabel(part.stockQuantity, part.minStockLevel)}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 me-2 text-gray-500 dark:text-gray-400" />
                  <span>{part.category}</span>
                </div>
                <div className="flex items-center">
                  <Building className="h-4 w-4 me-2 text-gray-500 dark:text-gray-400" />
                  <span>{part.manufacturer}</span>
                </div>
                <div className="flex items-center">
                  <Package className="h-4 w-4 me-2 text-gray-500 dark:text-gray-400" />
                  <span>{part.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center">
                  <StatusIcon className={`h-4 w-4 me-2 ${stockStatus.iconColor}`} />
                  <div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{part.stockQuantity}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t('inventory.min_level', { level: part.minStockLevel })}
                    </div>
                  </div>
                </div>
                <div className="text-end">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 me-1 text-green-600 dark:text-green-400" />
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        ${part.sellingPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('inventory.cost_label', { cost: part.cost.toFixed(2) })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    part.isActive
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                  }`}
                >
                  {part.isActive ? t('inventory.active') : t('inventory.inactive')}
                </span>
              </div>

              <div className="flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-800 pt-3">
                <Link
                  href={`/inventory/${part._id}`}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <Eye className="h-3 w-3 me-1" />
                  {t('common.view')}
                </Link>
                <Link
                  href={`/inventory/${part._id}/edit`}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-[#F97402] hover:bg-[#F13F33] transition-colors"
                >
                  <Edit className="h-3 w-3 me-1" />
                  {t('common.edit')}
                </Link>
                <button
                  onClick={() => onDelete(part._id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-3 w-3 me-1" />
                  {t('common.delete')}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
