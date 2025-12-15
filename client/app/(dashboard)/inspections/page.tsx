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
import { motion, AnimatePresence } from "framer-motion";
import ResponsiveInspectionsTable from "@/components/ui/ResponsiveInspectionsTable";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/dashboard-animations";

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

export default function InspectionsPage() {
  const { t } = useTranslation('common');
  const [inspections, setInspections] = useState<VehicleInspection[]>([]);
  const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      setInspections([]);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (inspectionId: string) => {
    setGeneratingPDF(inspectionId);
    try {
      // Get current language from i18n
      const currentLanguage = localStorage.getItem('i18nextLng') || 'en';
      // Open PDF in new tab for viewing with language parameter
      window.open(`/api/inspections/${inspectionId}/pdf?lang=${currentLanguage}`, '_blank');
    } catch (error) {
      alert(t("inspections.failed_to_generate_pdf"));
    } finally {
      setGeneratingPDF(null);
    }
  };

  const filteredInspections = inspections.filter((inspection) => {
    const matchesSearch =
      `${inspection.jobCardId?.customerId?.firstName || ''} ${inspection.jobCardId?.customerId?.lastName || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      `${inspection.jobCardId?.vehicleId?.year || ''} ${inspection.jobCardId?.vehicleId?.make || ''} ${inspection.jobCardId?.vehicleId?.model || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (inspection.jobCardId?.vehicleId?.licensePlate || '')
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97402] dark:border-[#F97402]"></div>
      </div>
    );
  }

  const handleDelete = async (inspectionId: string) => {
    if (!confirm(t('inspections.confirm_delete') || 'Delete inspection?')) return;
    setDeletingId(inspectionId);
    try {
      const res = await fetch(`/api/inspections/${inspectionId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      await fetchData();
    } catch (e) {
      alert(t('common.error_generic'));
    } finally {
      setDeletingId(null);
    }
  };

  const totalInspections = filteredInspections.length;
  const completedInspections = filteredInspections.filter(i => i.status === 'completed').length;
  const inProgressInspections = filteredInspections.filter(i => i.status === 'in-progress').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-6">
      <motion.div
        className="space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          variants={fadeInUp}
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              {t('inspections.title')}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('inspections.description')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/inspections/templates"
                className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-gray-600 hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300"
              >
                <FileText className="me-2 h-4 w-4" />
                {t('inspections.templates')}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/inspections/new"
                className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-[#F97402] hover:bg-[#F13F33] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300"
              >
                <Plus className="me-2 h-4 w-4" />
                {t('inspections.new_inspection')}
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <motion.div
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800"
            variants={scaleIn}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {t('inspections.total_inspections')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {totalInspections}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800"
            variants={scaleIn}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {t('inspections.completed')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {completedInspections}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800"
            variants={scaleIn}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {t('inspections.in_progress')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {inProgressInspections}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <motion.div
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800"
          variants={scaleIn}
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder={t('inspections.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full ps-10 pe-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#F97402] focus:border-[#F97402] transition-all"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border-gray-300 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-[#F97402]"
                >
                  <option value="all">{t('inspections.all_status')}</option>
                  <option value="in-progress">{t('inspections.in_progress')}</option>
                  <option value="completed">{t('inspections.completed')}</option>
                  <option value="cancelled">{t('inspections.cancelled')}</option>
                </select>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-end">
                {t(filteredInspections.length === 1 ? 'inspections.inspection_count' : 'inspections.inspection_count_plural', { count: filteredInspections.length })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Inspections Table */}
        <motion.div variants={fadeInUp}>
          <ResponsiveInspectionsTable
            inspections={filteredInspections}
            onGeneratePDF={generatePDF}
            generatingPDF={generatingPDF}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        </motion.div>

        {/* Empty State */}
        <AnimatePresence>
          {filteredInspections.length === 0 && (
            <motion.div
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-8 text-center"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {t('inspections.no_inspections_found')}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== "all"
                  ? t('inspections.adjust_search_filters')
                  : t('inspections.get_started_creating')}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <motion.div
                  className="mt-6"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/inspections/new"
                    className="inline-flex items-center rounded-lg bg-[#F97402] hover:bg-[#F13F33] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300"
                  >
                    <Plus className="me-2 h-4 w-4" />
                    {t('inspections.new_inspection')}
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
