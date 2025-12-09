'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Edit,
  Eye,
  Download,
  CheckCircle,
  AlertTriangle,
  User,
  Car,
  FileText,
  Calendar,
  Trash2,
} from 'lucide-react';
import { tableRowHover } from '@/lib/dashboard-animations';

interface InspectionTemplate {
  _id: string;
  name: string;
  category: string;
  vehicleType: string;
  items: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    isRequired: boolean;
    defaultCondition: string;
  }>;
  isActive: boolean;
}

interface VehicleInspection {
  _id: string;
  jobCardId: {
    _id: string;
    vehicleId: {
      _id: string;
      make: string;
      model: string;
      year: number;
      licensePlate: string;
    };
    customerId: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  };
  mechanicId: {
    _id: string;
    fullName: string;
  };
  templateId: {
    _id: string;
    name: string;
  };
  inspectionDate: string;
  mileage: number;
  items: Array<{
    itemId: string;
    name: string;
    category: string;
    uniqueCode?: string;
    condition: "good" | "fair" | "poor";
  }>;
  recommendations: string;
  nextInspectionDate?: string;
  nextInspectionMonths: number;
  status: "in-progress" | "completed" | "cancelled";
  createdAt: string;
}

interface ResponsiveInspectionsTableProps {
  inspections: VehicleInspection[];
  onGeneratePDF: (inspectionId: string) => void;
  generatingPDF: string | null;
  onDelete?: (inspectionId: string) => void;
  deletingId?: string | null;
}

export default function ResponsiveInspectionsTable({
  inspections,
  onGeneratePDF,
  generatingPDF,
  onDelete,
  deletingId,
}: ResponsiveInspectionsTableProps) {
  const { t } = useTranslation('common');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />;
      case "cancelled":
        return <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
      default:
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return t('inspections.completed');
      case "cancelled":
        return t('inspections.cancelled');
      case "in-progress":
        return t('inspections.in_progress');
      default:
        return status;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "good":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
      case "fair":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
      case "poor":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400";
      case "critical":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case "good":
        return t('inspections.condition.good');
      case "fair":
        return t('inspections.condition.fair');
      case "poor":
        return t('inspections.condition.poor');
      case "critical":
        return t('inspections.condition.critical');
      default:
        return condition;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800/50 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('inspections.inspection')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('inspections.customer')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('inspections.vehicle')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('inspections.template')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('inspections.status')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('inspections.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {inspections.map((inspection) => (
              <motion.tr
                key={inspection._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                variants={tableRowHover}
                initial="rest"
                whileHover="hover"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 dark:bg-blue-900/30 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="ms-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        INS-{inspection._id.slice(-6)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(inspection.inspectionDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {inspection.jobCardId?.customerId?.firstName || ''}{" "}
                    {inspection.jobCardId?.customerId?.lastName || ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {inspection.jobCardId?.vehicleId ? (
                      <>
                        {inspection.jobCardId.vehicleId.year} {inspection.jobCardId.vehicleId.make}{" "}
                        {inspection.jobCardId.vehicleId.model}
                      </>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">No vehicle data</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {inspection.jobCardId?.vehicleId?.licensePlate || (
                      <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                    {inspection.templateId?.name || t('inspections.no_template')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(inspection.status)}
                    <span
                      className={`ms-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        inspection.status
                      )}`}
                    >
                      {getStatusLabel(inspection.status)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/inspections/${inspection._id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/inspections/${inspection._id}/edit`}
                      className="text-[#F97402] hover:text-[#F13F33] transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onGeneratePDF(inspection._id)}
                      disabled={generatingPDF === inspection._id}
                      className="text-[#F97402] hover:text-[#F13F33] disabled:opacity-50 transition-colors"
                      title={t("inspections.generate_pdf")}
                    >
                      {generatingPDF === inspection._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#F97402]"></div>
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => onDelete(inspection._id)}
                        disabled={deletingId === inspection._id}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50 transition-colors"
                        title={t('common.delete')}
                      >
                        {deletingId === inspection._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {inspections.map((inspection) => (
          <motion.div
            key={inspection._id}
            className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800/30 rounded-lg p-4 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            variants={tableRowHover}
            initial="rest"
            whileHover="hover"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 dark:bg-blue-900/30 flex items-center justify-center me-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    INS-{inspection._id.slice(-6)}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(inspection.inspectionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(inspection.status)}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    inspection.status
                  )}`}
                >
                  {getStatusLabel(inspection.status)}
                </span>
              </div>
            </div>

            {/* Customer & Vehicle Info */}
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
              <div className="flex items-center">
                <User className="h-4 w-4 me-2 text-gray-500 dark:text-gray-400" />
                <span>
                  {inspection.jobCardId?.customerId?.firstName || ''} {inspection.jobCardId?.customerId?.lastName || ''}
                </span>
              </div>
              <div className="flex items-center">
                <Car className="h-4 w-4 me-2 text-gray-500 dark:text-gray-400" />
                <span>
                  {inspection.jobCardId?.vehicleId ? (
                    `${inspection.jobCardId.vehicleId.year} ${inspection.jobCardId.vehicleId.make} ${inspection.jobCardId.vehicleId.model}`
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 italic">No vehicle data</span>
                  )}
                </span>
              </div>
              <div className="flex items-center">
                <span className="h-4 w-4 me-2 text-gray-500 dark:text-gray-400 text-xs">#</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {inspection.jobCardId?.vehicleId?.licensePlate || (
                    <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>
                  )}
                </span>
              </div>
            </div>

            {/* Template */}
            <div className="flex items-center mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <FileText className="h-4 w-4 me-2 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {inspection.templateId?.name || t('inspections.no_template')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t('inspections.template')}
                </div>
              </div>
            </div>

            {/* Inspection Details */}
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 me-2 text-gray-500 dark:text-gray-400" />
                <span>
                  {t('inspections.mileage')}: {(inspection.mileage || 0).toLocaleString()} km
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 me-2 text-gray-500 dark:text-gray-400" />
                <span>
                  {(inspection.items || []).length} {t('inspections.items')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-800 pt-3">
              <Link
                href={`/inspections/${inspection._id}`}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Eye className="h-3 w-3 me-1" />
                {t('common.view')}
              </Link>
              <Link
                href={`/inspections/${inspection._id}/edit`}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-[#F97402] hover:bg-[#F13F33] transition-colors"
              >
                <Edit className="h-3 w-3 me-1" />
                {t('common.edit')}
              </Link>
              <button
                onClick={() => onGeneratePDF(inspection._id)}
                disabled={generatingPDF === inspection._id}
                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-[#F97402] hover:bg-[#F13F33] disabled:opacity-50 transition-colors"
              >
                {generatingPDF === inspection._id ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white me-1"></div>
                ) : (
                  <Download className="h-3 w-3 me-1" />
                )}
                PDF
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(inspection._id)}
                  disabled={deletingId === inspection._id}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deletingId === inspection._id ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white me-1"></div>
                  ) : (
                    <Trash2 className="h-3 w-3 me-1" />
                  )}
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
