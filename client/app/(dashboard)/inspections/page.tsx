"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download,
} from "lucide-react";
import ResponsiveInspectionsTable from "@/components/ui/ResponsiveInspectionsTable";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";

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

export default function InspectionsPage() {
  const { t } = useTranslation('common');
  const [inspections, setInspections] = useState<VehicleInspection[]>([]);
  const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    socket.on("update-inspections", () => {
      fetchData();
    });

    return () => {
      socket.off("update-inspections");
    };
  }, []);

  const fetchData = async () => {
    try {
      const [inspectionsRes] = await Promise.all([fetch("/api/inspections")]);

      if (inspectionsRes.ok) {
        const inspectionsData = await inspectionsRes.json();
        setInspections(Array.isArray(inspectionsData.inspections) ? inspectionsData.inspections : []);
      } else {
        setInspections([]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setInspections([]);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (inspectionId: string) => {
    setGeneratingPDF(inspectionId);
    try {
      // Open PDF in new tab for viewing
      window.open(`/api/inspections/${inspectionId}/pdf`, '_blank');
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert(t("inspections.failed_to_generate_pdf"));
    } finally {
      setGeneratingPDF(null);
    }
  };

  const filteredInspections = inspections.filter((inspection) => {
    const matchesSearch =
      `${inspection.customerId.firstName} ${inspection.customerId.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      `${inspection.vehicleId.year} ${inspection.vehicleId.make} ${inspection.vehicleId.model}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      inspection.vehicleId.licensePlate
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (inspection.templateId?.name || 'No Template')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || inspection.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalInspections = filteredInspections.length;
  const completedInspections = filteredInspections.filter(i => i.status === 'completed').length;
  const inProgressInspections = filteredInspections.filter(i => i.status === 'in-progress').length;

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t('inspections.title')}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('inspections.description')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/inspections/templates"
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-gray-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 transition-colors"
            >
              <FileText className="me-2 h-4 w-4" />
              {t('inspections.templates')}
            </Link>
            <Link
              href="/inspections/new"
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              <Plus className="me-2 h-4 w-4" />
              {t('inspections.new_inspection')}
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('inspections.total_inspections')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {totalInspections}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('inspections.completed')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {completedInspections}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('inspections.in_progress')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {inProgressInspections}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('inspections.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">{t('inspections.all_status')}</option>
                  <option value="in-progress">{t('inspections.in_progress')}</option>
                  <option value="completed">{t('inspections.completed')}</option>
                  <option value="cancelled">{t('inspections.cancelled')}</option>
                </select>
              </div>
              <div className="text-sm text-gray-500 text-center sm:text-end">
                {t(filteredInspections.length === 1 ? 'inspections.inspection_count' : 'inspections.inspection_count_plural', { count: filteredInspections.length })}
              </div>
            </div>
          </div>
        </div>

        {/* Inspections Table */}
        <ResponsiveInspectionsTable
          inspections={filteredInspections}
          onGeneratePDF={generatePDF}
          generatingPDF={generatingPDF}
        />

        {/* Empty State */}
        {filteredInspections.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {t('inspections.no_inspections_found')}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? t('inspections.adjust_search_filters')
                : t('inspections.get_started_creating')}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <div className="mt-6">
                <Link
                  href="/inspections/new"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
                >
                  <Plus className="me-2 h-4 w-4" />
                  {t('inspections.new_inspection')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
