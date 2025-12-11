"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Plus, Search, Eye, Calendar, Clock, User, Car, Wrench,
  DollarSign, Filter, X, ChevronDown, Loader2, CalendarDays
} from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";
import { fadeInUp, staggerContainer } from "@/lib/dashboard-animations";

interface Appointment {
  _id: string;
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
  serviceId: {
    _id: string;
    name: string;
  };
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  notes?: string;
  estimatedCost: number;
  actualCost?: number;
  createdAt: string;
  confirmationNumber?: string;
  source?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export default function AppointmentsPage() {
  const { t } = useTranslation('common');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    socket.on("update-appointments", () => {
      fetchAppointments(searchTerm, statusFilter, dateFilter, currentPage, itemsPerPage);
    });

    return () => {
      socket.off("update-appointment");
    };
  });

  useEffect(() => {
    fetchAppointments(searchTerm, statusFilter, dateFilter, currentPage, itemsPerPage);
  }, [searchTerm, statusFilter, dateFilter, currentPage, itemsPerPage]);

  const fetchAppointments = async (
    search: string,
    status: string,
    date: string,
    page: number,
    limit: number
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status,
        date,
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await fetch(`/api/appointments?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.appointments && data.pagination) {
          setAppointments(data.appointments);
          setPagination(data.pagination);
        } else {
          // Fallback for old API format
          setAppointments(data);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalCount: data.length,
            limit: data.length,
            hasNextPage: false,
            hasPrevPage: false
          });
        }
      } else {
        setAppointments([]);
        setPagination({
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setAppointments([]);
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFilter("all");
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" || dateFilter !== "all";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 text-[#F97402] animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              {t('appointments.title')}
            </h1>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
              {t('appointments.description')}
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/appointments/new"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white rounded-xl font-semibold shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/30 transition-all"
            >
              <Plus className="me-2 h-5 w-5" />
              {t('appointments.schedule_appointment')}
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={fadeInUp} className="mb-6">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('appointments.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97402] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                  showFilters || hasActiveFilters
                    ? 'bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
                {hasActiveFilters && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {[searchTerm, statusFilter !== "all", dateFilter !== "all"].filter(Boolean).length}
                  </span>
                )}
              </motion.button>

              {hasActiveFilters && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="p-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/30 transition-all"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}

              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-xl">
                {pagination.totalCount} {pagination.totalCount === 1 ? 'Appointment' : 'Appointments'}
              </div>
            </div>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-6 mt-6 border-t-2 border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97402] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">{t('appointments.all_status')}</option>
                      <option value="scheduled">{t('appointments.scheduled')}</option>
                      <option value="in-progress">{t('appointments.in_progress')}</option>
                      <option value="completed">{t('appointments.completed')}</option>
                      <option value="cancelled">{t('appointments.cancelled')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Date Range
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97402] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="all">{t('appointments.all_dates')}</option>
                      <option value="today">{t('appointments.today')}</option>
                      <option value="tomorrow">{t('appointments.tomorrow')}</option>
                      <option value="this-week">{t('appointments.this_week')}</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Appointments Grid */}
      {appointments.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 p-12 text-center"
        >
          <CalendarDays className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('appointments.no_appointments_found')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {hasActiveFilters
              ? t('appointments.adjust_search_filters')
              : t('appointments.get_started_scheduling')}
          </p>
          {!hasActiveFilters && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/appointments/new"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white rounded-xl font-semibold shadow-lg shadow-[#F97402]/25"
              >
                <Plus className="me-2 h-5 w-5" />
                {t('appointments.schedule_appointment')}
              </Link>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 gap-4 mb-6"
          >
            {appointments.map((appointment, index) => (
              <motion.div
                key={appointment._id}
                custom={index}
                variants={itemVariants}
                whileHover={{ scale: 1.01, y: -2 }}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Appointment Info */}
                  <div className="lg:col-span-3">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-[#F97402]/10 to-[#F13F33]/10 rounded-xl">
                        <Calendar className="w-6 h-6 text-[#F97402]" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          {appointment.confirmationNumber || `APT-${appointment._id.slice(-6).toUpperCase()}`}
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          {appointment.startTime} - {appointment.endTime}
                        </div>
                        <div className="mt-2">
                          <StatusBadge status={appointment.priority} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Details */}
                  <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Customer</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {appointment.customerId.firstName} {appointment.customerId.lastName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <Car className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Vehicle</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {appointment.vehicleId.year} {appointment.vehicleId.make} {appointment.vehicleId.model}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {appointment.vehicleId.licensePlate}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Wrench className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Service</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {appointment.serviceId.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <DollarSign className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Cost</div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          ${appointment.estimatedCost.toFixed(2)}
                        </div>
                        {appointment.actualCost && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Actual: ${appointment.actualCost.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="lg:col-span-3 flex flex-col justify-between items-end gap-4">
                    <div className="w-full">
                      <StatusBadge status={appointment.status} />
                      {appointment.source && (
                        <div className="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          via {appointment.source}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          href={`/appointments/${appointment._id}`}
                          className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-all"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          href={`/appointments/edit/${appointment._id}`}
                          className="p-3 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-all"
                          title="Reschedule"
                        >
                          <Clock className="w-5 h-5" />
                        </Link>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          href={`/job-cards/new?appointmentId=${appointment._id}`}
                          className="p-3 bg-gradient-to-br from-[#F97402]/10 to-[#F13F33]/10 text-[#F97402] rounded-xl hover:from-[#F97402]/20 hover:to-[#F13F33]/20 transition-all"
                          title="Create Job Card"
                        >
                          <Plus className="w-5 h-5" />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <motion.div variants={fadeInUp}>
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 px-6 py-4">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalCount}
                  itemsPerPage={pagination.limit}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  itemsPerPageOptions={[10, 30, 50]}
                  showItemsPerPage={true}
                />
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
