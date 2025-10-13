'use client';

import React from 'react';
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
import { useTranslation } from 'react-i18next';
import { useSession } from '@/lib/hooks/useSession';

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
  notes?: string;
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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  const totalLaborHours = (services: JobCard['services']) => {
    return services.reduce((sum, s) => sum + s.laborHours, 0);
  };

  const totalCost = (services: JobCard['services']) => {
    return services.reduce((sum, s) => sum + (s.laborHours * s.laborRate), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('job_cards.title')}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('job_cards.description')}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              href="/job-cards/new"
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              <Plus className="me-2 h-4 w-4" />
              {t('job_cards.create')}
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
                    placeholder={t('job_cards.search_placeholder')}
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
                  <option value="all">{t('appointments.all_status')}</option>
                  <option value="pending">{t('estimates.pending')}</option>
                  <option value="in-progress">{t('appointments.in_progress')}</option>
                  <option value="completed">{t('appointments.completed')}</option>
                  <option value="cancelled">{t('appointments.cancelled')}</option>
                </select>
              </div>
              <div className="text-sm text-gray-500 text-center sm:text-end">
                {t(jobCards.length === 1 ? 'job_cards.job_card_count' : 'job_cards.job_card_count_plural', { count: jobCards.length })}
              </div>
            </div>
          </div>
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobCards.map((jobCard) => (
            <div
              key={jobCard._id}
              className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Card Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
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
                  <div className="flex items-center space-x-1">
                    {getPriorityIcon(jobCard.priority)}
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                        jobCard.priority
                      )}`}
                    >
                      {t(`priority.${jobCard.priority}`)}
                    </span>
                  </div>
                </div>
                
                {/* Job Card ID */}
                <div className="text-xs text-gray-500 font-mono">
                  #{jobCard._id.slice(-8).toUpperCase()}
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
                        {jobCard.customerId.firstName} {jobCard.customerId.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{t('job_cards.customer')}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Car className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {jobCard.vehicleId ? (
                          `${jobCard.vehicleId.year} ${jobCard.vehicleId.make} ${jobCard.vehicleId.model}`
                        ) : (
                          <span className="text-gray-400 italic">No vehicle data</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {jobCard.vehicleId?.licensePlate || (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>


                {/* Services */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <Wrench className="h-4 w-4 me-2 text-gray-400" />
                    {t('job_cards.services_label')}
                  </div>
                  <div className="space-y-1">
                    {jobCard.services.slice(0, 2).map((service, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 truncate flex-1">
                          {service.serviceId.name}
                        </span>
                        <span className="text-gray-500 ml-2">
                          {service.laborHours}h
                        </span>
                      </div>
                    ))}
                    {jobCard.services.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{jobCard.services.length - 2} {t('job_cards.more_services')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className={`grid gap-3 pt-2 border-t border-gray-100 ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {totalLaborHours(jobCard.services)}h
                    </div>
                    <div className="text-xs text-gray-500">{t('job_cards.labor_hours')}</div>
                  </div>
                  {isAdmin && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        ${totalCost(jobCard.services).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500">{t('job_cards.estimated_cost')}</div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {jobCard.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-xs font-medium text-yellow-800 mb-1">{t('forms.notes')}</div>
                    <div className="text-xs text-yellow-700 line-clamp-2">{jobCard.notes}</div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      href={`/job-cards/${jobCard._id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="h-3 w-3 me-1" />
                      {t('common.view')}
                    </Link>
                    <Link
                      href={`/job-cards/${jobCard._id}/edit`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="h-3 w-3 me-1" />
                      {t('common.edit')}
                    </Link>
                    {isAdmin && onDeleteJobCard && (
                      <button
                        onClick={() => onDeleteJobCard(jobCard._id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-3 w-3 me-1" />
                        {t('common.delete')}
                      </button>
                    )}
                  </div>
                  <select
                    value={jobCard.status}
                    onChange={(e) => onStatusChange(jobCard._id, e.target.value)}
                    className="text-xs rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                  >
                    <option value="pending">{t('estimates.pending')}</option>
                    <option value="in-progress">{t('appointments.in_progress')}</option>
                    <option value="completed">{t('appointments.completed')}</option>
                    <option value="cancelled">{t('appointments.cancelled')}</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {jobCards.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {t('job_cards.no_job_cards_found')}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? t('job_cards.adjust_search')
                : t('job_cards.get_started')}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <div className="mt-6">
                <Link
                  href="/job-cards/new"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
                >
                  <Plus className="me-2 h-4 w-4" />
                  {t('job_cards.create')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
