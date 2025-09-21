"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Eye, Calendar, Clock } from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";

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
}

export default function AppointmentsPage() {
  const { t } = useTranslation('common');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    socket.on("update-appointments", () => {
      fetchAppointments(searchTerm, statusFilter, dateFilter);
    });

    return () => {
      socket.off("update-appointment");
    };
  });

  useEffect(() => {
    fetchAppointments(searchTerm, statusFilter, dateFilter);
  }, [searchTerm, statusFilter, dateFilter]);

  const fetchAppointments = async (
    search: string,
    status: string,
    date: string
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, status, date });
      const response = await fetch(`/api/appointments?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('appointments.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('appointments.description')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/appointments/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('appointments.schedule_appointment')}
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('appointments.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">{t('appointments.all_status')}</option>
                <option value="scheduled">{t('appointments.scheduled')}</option>
                <option value="in-progress">{t('appointments.in_progress')}</option>
                <option value="completed">{t('appointments.completed')}</option>
                <option value="cancelled">{t('appointments.cancelled')}</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">{t('appointments.all_dates')}</option>
                <option value="today">{t('appointments.today')}</option>
                <option value="tomorrow">{t('appointments.tomorrow')}</option>
                <option value="this-week">{t('appointments.this_week')}</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {t(appointments.length === 1 ? 'appointments.appointment_count' : 'appointments.appointment_count_plural', { count: appointments.length })}
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('appointments.appointment')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('appointments.customer')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('appointments.vehicle')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('appointments.service')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('appointments.date_time')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('appointments.mechanic')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('appointments.cost')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('appointments.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('appointments.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <tr key={appointment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          APT-{appointment._id.slice(-6)}
                        </div>
                        <StatusBadge status={appointment.priority} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {appointment.customerId.firstName}{" "}
                      {appointment.customerId.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {appointment.vehicleId.year} {appointment.vehicleId.make}{" "}
                      {appointment.vehicleId.model}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.vehicleId.licensePlate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {appointment.serviceId.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(
                        appointment.appointmentDate
                      ).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {appointment.startTime} - {appointment.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {appointment.mechanicId.fullName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${appointment.estimatedCost.toFixed(2)}
                    </div>
                    {appointment.actualCost && (
                      <div className="text-sm text-gray-500">
                        Actual: ${appointment.actualCost.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={appointment.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/appointments/${appointment._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/appointments/edit/${appointment._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Reschedule"
                      >
                        <Clock className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/job-cards/new?appointmentId=${appointment._id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Plus className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {appointments.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t('appointments.no_appointments_found')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== "all" || dateFilter !== "all"
              ? t('appointments.adjust_search_filters')
              : t('appointments.get_started_scheduling')}
          </p>
          {!searchTerm && statusFilter === "all" && dateFilter === "all" && (
            <div className="mt-6">
              <Link
                href="/appointments/new"
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('appointments.schedule_appointment')}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
