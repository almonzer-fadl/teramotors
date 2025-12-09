'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit,
  Eye,
  Clock,
  User,
  Car,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wrench,
  Zap,
  AlertTriangle,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/lib/hooks/useSession';
import { fadeInUp, staggerContainer, scaleIn } from '@/lib/dashboard-animations';

interface JobCard {
  _id: string;
  appointmentId: {
    _id: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
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
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  estimatedStartTime: string;
  estimatedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  services: Array<{
    serviceId: {
      _id: string;
      name: string;
      laborHours: number;
      laborRate: number;
    };
    quantity: number;
    laborHours: number;
    laborRate: number;
  }>;
  partsUsed?: Array<{
    partId: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
    cost: number;
  }>;
  notes?: string;
  discount?: number;
  createdAt: string;
}

interface ResponsiveJobCardsGridProps {
  jobCards: JobCard[];
  onStatusChange: (id: string, status: string) => void;
  onDeleteJobCard?: (id: string) => void;
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (status: string) => void;
}

export default function ResponsiveJobCardsGrid({
  jobCards,
  onStatusChange,
  onDeleteJobCard,
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}: ResponsiveJobCardsGridProps) {
  const { t } = useTranslation('common');
  const { user } = useSession();
  
  const isAdmin = user?.role === 'admin';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800";
      case "in-progress":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800";
      default:
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800";
      case "high":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-800";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-3 w-3" />;
      case "high":
        return <Zap className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const [activeWorkersMap, setActiveWorkersMap] = useState<Record<string, { names: string[]; isSelfActive: boolean }>>({})

  useEffect(() => {
    const loadActive = async () => {
      const entries = await Promise.all(jobCards.map(async (jc) => {
        try {
          const res = await fetch(`/api/job-cards/${jc._id}/work/active`)
          if (!res.ok) return [jc._id, { names: [] as string[], isSelfActive: false }] as const
          const data = await res.json()
          const names: string[] = (data.logs || []).map((l: any) => l.userId?.displayName || `${l.userId?.firstName || ''} ${l.userId?.lastName || ''}`.trim()).filter(Boolean)
          const isSelfActive = (data.logs || []).some((l: any) => (l.userId?._id || '').toString() === (user as any)?.id)
          return [jc._id, { names, isSelfActive }] as const
        } catch {
          return [jc._id, { names: [] as string[], isSelfActive: false }] as const
        }
      }))
      const map: Record<string, { names: string[]; isSelfActive: boolean }> = {}
      entries.forEach(([id, info]) => { map[id] = info })
      setActiveWorkersMap(map)
    }
    void loadActive()
  }, [jobCards, user])

  const totalLaborHours = (services: JobCard['services']) => {
    return services.reduce((sum, s) => sum + s.laborHours, 0);
  };

  const totalCost = (jobCard: JobCard) => {
    const servicesCost = jobCard.services.reduce((sum, s) => sum + (s.laborHours * s.laborRate), 0);
    const partsCost = (jobCard.partsUsed || []).reduce((sum, p) => sum + (p.quantity * p.cost), 0);
    const subtotal = servicesCost + partsCost;
    const tax = partsCost * 0.15; // 15% tax only on parts
    const discountAmount = (subtotal + tax) * ((jobCard.discount || 0) / 100); // Discount as percentage
    return subtotal + tax - discountAmount;
  };

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
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">{t('job_cards.title')}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('job_cards.description')}
            </p>
          </div>
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/job-cards/new"
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-[#F97402] hover:bg-[#F13F33] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300"
            >
              <Plus className="me-2 h-4 w-4" />
              {t('job_cards.create')}
            </Link>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800"
          variants={scaleIn}
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                <div className="relative flex-1 sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder={t('job_cards.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#F97402] focus:border-[#F97402] transition-all"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => onStatusFilterChange(e.target.value)}
                  className="rounded-lg border-gray-300 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-[#F97402] px-3 py-2"
                >
                  <option value="active">{t('job_cards.active_jobs')}</option>
                  <option value="all">{t('appointments.all_status')}</option>
                  <option value="pending">{t('estimates.pending')}</option>
                  <option value="in-progress">{t('appointments.in_progress')}</option>
                  <option value="completed">{t('appointments.completed')}</option>
                  <option value="cancelled">{t('appointments.cancelled')}</option>
                </select>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-end">
                {t(jobCards.length === 1 ? 'job_cards.job_card_count' : 'job_cards.job_card_count_plural', { count: jobCards.length })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Job Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          variants={staggerContainer}
        >
          {jobCards.map((jobCard) => (
            <motion.div
              key={jobCard._id}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 flex flex-col"
              variants={scaleIn}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              {/* Active Workers moved under header near ID */}
              {/* Card Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(jobCard.status)}
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        jobCard.status
                      )}`}
                    >
                      {t(`status.${jobCard.status.replace("-", "_")}`)}
                    </span>
                  </div>
                <div className="flex items-center space-x-2">
                    {getPriorityIcon(jobCard.priority)}
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                        jobCard.priority
                      )}`}
                    >
                      {t(`priority.${jobCard.priority}`)}
                    </span>
                  {/* Start/Stop Buttons */}
                  {activeWorkersMap[jobCard._id]?.isSelfActive ? (
                    <button
                      onClick={async () => { try { await fetch(`/api/job-cards/${jobCard._id}/work/stop`, { method: 'POST' }); } catch {} finally { try { const res = await fetch(`/api/job-cards/${jobCard._id}/work/active`); const data = await res.json(); setActiveWorkersMap(prev => ({ ...prev, [jobCard._id]: { names: (data.logs||[]).map((l:any)=>l.userId?.displayName||`${l.userId?.firstName||''} ${l.userId?.lastName||''}`.trim()).filter(Boolean), isSelfActive: false } })) } catch {} } }}
                      className="ml-2 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium text-white bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
                      title={t('job_cards.stop_work')}
                    >
                      <Clock className="h-3 w-3 mr-1" /> {t('job_cards.stop')}
                    </button>
                  ) : (
                    <button
                      onClick={async () => { try { await fetch(`/api/job-cards/${jobCard._id}/work/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }); } catch {} finally { try { const res = await fetch(`/api/job-cards/${jobCard._id}/work/active`); const data = await res.json(); const names = (data.logs||[]).map((l:any)=>l.userId?.displayName||`${l.userId?.firstName||''} ${l.userId?.lastName||''}`.trim()).filter(Boolean); setActiveWorkersMap(prev => ({ ...prev, [jobCard._id]: { names, isSelfActive: true } })) } catch {} } }}
                      className="ml-2 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium text-white bg-[#F97402] hover:bg-[#F13F33] transition-colors"
                      title={t('job_cards.start_work')}
                    >
                      <Clock className="h-3 w-3 mr-1" /> {t('job_cards.start')}
                    </button>
                  )}
                  </div>
                </div>

                {/* Job Card ID */}
                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  #{jobCard._id.slice(-8).toUpperCase()}
                </div>
                {/* Active Workers under header */}
                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                  {activeWorkersMap[jobCard._id]?.names?.length
                    ? `${t('job_cards.active_workers')}: ${activeWorkersMap[jobCard._id].names.join(', ')}`
                    : t('job_cards.no_active_workers')}
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 py-4 space-y-4 flex-1 flex flex-col">
                {/* Customer & Vehicle */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {jobCard.customerId.firstName} {jobCard.customerId.lastName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t('job_cards.customer')}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Car className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {jobCard.vehicleId ? (
                          `${jobCard.vehicleId.year} ${jobCard.vehicleId.make} ${jobCard.vehicleId.model}`
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 italic">No vehicle data</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {jobCard.vehicleId?.licensePlate || (
                          <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>


                {/* Services */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Wrench className="h-4 w-4 me-2 text-gray-400 dark:text-gray-500" />
                    {t('job_cards.services_label')}
                  </div>
                  <div className="space-y-1">
                    {jobCard.services.slice(0, 3).map((service, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400 truncate flex-1">
                          {service.serviceId.name}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">
                          {service.laborHours}h
                        </span>
                      </div>
                    ))}
                    {jobCard.services.length > 3 && (() => {
                      const remaining = jobCard.services.slice(3);
                      const remainingNames = remaining
                        .map((s) => (typeof s.serviceId === 'object' && s.serviceId ? s.serviceId.name : ''))
                        .filter(Boolean)
                        .join(', ');
                      return (
                        <div className="text-xs text-gray-500 dark:text-gray-400" title={remainingNames}>
                          {t('job_cards.more_services_count', { count: remaining.length })}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Stats */}
                <div className={`grid gap-3 pt-2 border-t border-gray-100 dark:border-gray-800 ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'} mt-auto`}>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {totalLaborHours(jobCard.services)}h
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t('job_cards.labor_hours')}</div>
                  </div>
                  {isAdmin && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        ${totalCost(jobCard).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{t('job_cards.estimated_cost')}</div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {jobCard.notes && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <div className="text-xs font-medium text-yellow-800 dark:text-yellow-400 mb-1">{t('forms.notes')}</div>
                    <div className="text-xs text-yellow-700 dark:text-yellow-300 line-clamp-2">{jobCard.notes}</div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 h-16 flex items-center">
                <div className="flex items-center justify-between w-full">
                  <div className="flex space-x-2">
                    <Link
                      href={`/job-cards/${jobCard._id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-700 shadow-sm text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Eye className="h-3 w-3 me-1" />
                      {t('common.view')}
                    </Link>
                    {isAdmin && (
                      <Link
                        href={`/job-cards/${jobCard._id}/edit`}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-lg text-white bg-[#F97402] hover:bg-[#F13F33] transition-colors"
                      >
                        <Edit className="h-3 w-3 me-1" />
                        {t('common.edit')}
                      </Link>
                    )}
                    {isAdmin && onDeleteJobCard && (
                      <button
                        onClick={() => onDeleteJobCard(jobCard._id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="h-3 w-3 me-1" />
                        {t('common.delete')}
                      </button>
                    )}
                  </div>
                  <select
                    value={jobCard.status}
                    onChange={(e) => onStatusChange(jobCard._id, e.target.value)}
                    className="text-xs rounded-lg border-gray-300 dark:border-gray-700 shadow-sm focus:border-[#F97402] focus:ring-[#F97402] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="pending">{t('estimates.pending')}</option>
                    <option value="in-progress">{t('appointments.in_progress')}</option>
                    <option value="completed">{t('appointments.completed')}</option>
                    <option value="cancelled">{t('appointments.cancelled')}</option>
                  </select>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        <AnimatePresence>
          {jobCards.length === 0 && (
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-gray-800/50 border border-gray-200 dark:border-gray-800 p-8 text-center"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {t('job_cards.no_job_cards_found')}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || (statusFilter !== "all" && statusFilter !== "active")
                  ? t('job_cards.adjust_search')
                  : t('job_cards.get_started')}
              </p>
              {!searchTerm && (statusFilter === "all" || statusFilter === "active") && (
                <motion.div
                  className="mt-6"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/job-cards/new"
                    className="inline-flex items-center rounded-lg bg-[#F97402] hover:bg-[#F13F33] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300"
                  >
                    <Plus className="me-2 h-4 w-4" />
                    {t('job_cards.create')}
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
