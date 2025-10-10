'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
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
} from 'lucide-react';

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
  overallCondition: string;
  items: Array<{
    itemId: string;
    condition: "good" | "fair" | "poor" | "critical";
    notes: string;
    photos: string[];
    recommendations: string;
    estimatedCost: number;
    priority: "critical" | "safety" | "recommended" | "optional";
  }>;
  totalEstimatedCost: number;
  recommendations: string;
  nextInspectionDate?: string;
  status: "in-progress" | "completed" | "cancelled";
  createdAt: string;
}

interface ResponsiveInspectionsTableProps {
  inspections: VehicleInspection[];
  onGeneratePDF: (inspectionId: string) => void;
  generatingPDF: string | null;
}

export default function ResponsiveInspectionsTable({
  inspections,
  onGeneratePDF,
  generatingPDF,
}: ResponsiveInspectionsTableProps) {
  const { t } = useTranslation('common');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
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
        return "bg-green-100 text-green-800";
      case "fair":
        return "bg-yellow-100 text-yellow-800";
      case "poor":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inspections.inspection')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inspections.customer')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inspections.vehicle')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inspections.template')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inspections.overall_condition')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inspections.status')}
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inspections.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inspections.map((inspection) => (
              <tr key={inspection._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ms-4">
                      <div className="text-sm font-medium text-gray-900">
                        INS-{inspection._id.slice(-6)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(inspection.inspectionDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {inspection.customerId.firstName}{" "}
                    {inspection.customerId.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {inspection.vehicleId ? (
                      <>
                        {inspection.vehicleId.year} {inspection.vehicleId.make}{" "}
                        {inspection.vehicleId.model}
                      </>
                    ) : (
                      <span className="text-gray-400 italic">No vehicle data</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {inspection.vehicleId?.licensePlate || (
                      <span className="text-gray-400 italic">N/A</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {inspection.templateId?.name || t('inspections.no_template')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConditionColor(
                      inspection.overallCondition
                    )}`}
                  >
                    {getConditionLabel(inspection.overallCondition)}
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
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/inspections/${inspection._id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onGeneratePDF(inspection._id)}
                      disabled={generatingPDF === inspection._id}
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      title={t("inspections.generate_pdf")}
                    >
                      {generatingPDF === inspection._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
        {inspections.map((inspection) => (
          <div key={inspection._id} className="bg-white shadow rounded-lg p-4 border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center me-3">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    INS-{inspection._id.slice(-6)}
                  </h3>
                  <p className="text-xs text-gray-500">
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
            <div className="space-y-2 text-sm text-gray-700 mb-4">
              <div className="flex items-center">
                <User className="h-4 w-4 me-2 text-gray-500" />
                <span>
                  {inspection.customerId.firstName} {inspection.customerId.lastName}
                </span>
              </div>
              <div className="flex items-center">
                <Car className="h-4 w-4 me-2 text-gray-500" />
                <span>
                  {inspection.vehicleId ? (
                    `${inspection.vehicleId.year} ${inspection.vehicleId.make} ${inspection.vehicleId.model}`
                  ) : (
                    <span className="text-gray-400 italic">No vehicle data</span>
                  )}
                </span>
              </div>
              <div className="flex items-center">
                <span className="h-4 w-4 me-2 text-gray-500 text-xs">#</span>
                <span className="text-xs text-gray-500">
                  {inspection.vehicleId?.licensePlate || (
                    <span className="text-gray-400 italic">N/A</span>
                  )}
                </span>
              </div>
            </div>

            {/* Template & Condition */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-4 w-4 me-2 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {inspection.templateId?.name || t('inspections.no_template')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t('inspections.template')}
                  </div>
                </div>
              </div>
              <div className="text-end">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConditionColor(
                    inspection.overallCondition
                  )}`}
                >
                  {getConditionLabel(inspection.overallCondition)}
                </span>
              </div>
            </div>

            {/* Inspection Details */}
            <div className="space-y-2 text-sm text-gray-700 mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 me-2 text-gray-500" />
                <span>
                  {t('inspections.mileage')}: {(inspection.mileage || 0).toLocaleString()} km
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 me-2 text-gray-500" />
                <span>
                  {(inspection.items || []).length} {t('inspections.items')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 border-t border-gray-200 pt-3">
              <Link
                href={`/inspections/${inspection._id}`}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Eye className="h-3 w-3 me-1" />
                {t('common.view')}
              </Link>
              <Link
                href={`/inspections/${inspection._id}/edit`}
                className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Edit className="h-3 w-3 me-1" />
                {t('common.edit')}
              </Link>
              <button
                onClick={() => onGeneratePDF(inspection._id)}
                disabled={generatingPDF === inspection._id}
                className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {generatingPDF === inspection._id ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white me-1"></div>
                ) : (
                  <Download className="h-3 w-3 me-1" />
                )}
                PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
