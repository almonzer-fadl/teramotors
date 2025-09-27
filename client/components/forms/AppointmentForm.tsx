'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X } from "lucide-react";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";

interface CustomerMinimal {
  _id: string;
  firstName: string;
  lastName: string;
}
interface VehicleMinimal {
  _id: string;
  make: string;
  model: string;
  year: number;
  customerId: string | { _id: string };
}
interface ServiceMinimal {
  _id: string | { toString: () => string };
  name: string;
  laborHours: number;
}
interface MechanicMinimal {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

interface AppointmentFormData {
  customerId: string;
  vehicleId: string;
  serviceId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  notes: string;
  estimatedCost: number;
  mechanicId: string;
  priority: "low" | "medium" | "high" | "urgent";
}

export default function AppointmentForm({
  appointmentId,
}: {
  appointmentId?: string;
}) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerMinimal[]>([]);
  const [vehicles, setVehicles] = useState<VehicleMinimal[]>([]);
  const [services, setServices] = useState<ServiceMinimal[]>([]);
  const [mechanics, setMechanics] = useState<MechanicMinimal[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [formData, setFormData] = useState<AppointmentFormData>({
    customerId: "",
    vehicleId: "",
    serviceId: "",
    appointmentDate: "",
    startTime: "",
    endTime: "",
    status: "scheduled",
    notes: "",
    estimatedCost: 0,
    mechanicId: "",
    priority: "medium",
  });

  const isEditing = !!appointmentId;

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`);
      if (response.ok) {
        const appointment = await response.json();
        setFormData({
          customerId: appointment.customerId || "",
          vehicleId: appointment.vehicleId || "",
          serviceId: appointment.serviceId || "",
          appointmentDate: appointment.appointmentDate
            ? new Date(appointment.appointmentDate).toISOString().split("T")[0]
            : "",
          startTime: appointment.startTime || "",
          endTime: appointment.endTime || "",
          status: appointment.status || "scheduled",
          notes: appointment.notes || "",
          estimatedCost: appointment.estimatedCost || 0,
          mechanicId: appointment.mechanicId || "",
          priority: appointment.priority || "medium",
        });
      }
    } catch (error) {
      console.error("Failed to fetch appointment:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();
    if (isEditing) {
      fetchAppointment();
    }
  }, [appointmentId, isEditing]);

  useEffect(() => {
    if (formData.appointmentDate && formData.serviceId) {
      fetchAvailableSlots();
    }
  }, [formData.appointmentDate, formData.serviceId]);

  const fetchInitialData = async () => {
    try {
      const [customersRes, vehiclesRes, servicesRes, mechanicsRes] =
        await Promise.all([
          fetch("/api/customers"),
          fetch("/api/vehicles"),
          fetch("/api/services"),
          fetch("/api/mechanics"),
        ]);
      if (customersRes.ok) {
        const data = await customersRes.json();
        const customersArray = Array.isArray(data.customers) ? data.customers : (Array.isArray(data) ? data : []);
        setCustomers(customersArray);
      }
      if (vehiclesRes.ok) {
        const data = await vehiclesRes.json();
        const vehiclesArray = Array.isArray(data.vehicles) ? data.vehicles : (Array.isArray(data) ? data : []);
        setVehicles(vehiclesArray);
      }
      if (servicesRes.ok) {
        const data = await servicesRes.json();
        const servicesArray = Array.isArray(data) ? data : [];
        setServices(servicesArray);
      }
      if (mechanicsRes.ok) {
        const data = await mechanicsRes.json();
        const mechanicsArray = Array.isArray(data) ? data : [];
        setMechanics(mechanicsArray);
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    }
  };

  const fetchAvailableSlots = async () => {
    const selectedService = services.find(
      (s) => s._id.toString() === formData.serviceId
    );
    if (!selectedService) return;

    const duration = selectedService.laborHours * 60; // convert hours to minutes
    try {
      const response = await fetch(
        `/api/appointments/available-slots?date=${formData.appointmentDate}&duration=${duration}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch available slots:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing
        ? `/api/appointments/${appointmentId}`
        : "/api/appointments";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        socket.emit("appointment-created");
        router.push("/appointments");
      } else {
        const error = await response.json();
        alert(error.message || t('forms.failed_to_save_appointment'));
      }
    } catch (error) {
      console.error("Failed to save appointment:", error);
      alert(t('forms.failed_to_save_appointment'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => {
      const newFormData = { ...prev, [field]: value };
      if (field === "startTime") {
        const selectedService = services.find(
          (s) => s._id.toString() === newFormData.serviceId
        );
        if (selectedService) {
          const startTime = value as string;
          const duration = selectedService.laborHours * 60;
          const [hours, minutes] = startTime.split(":").map(Number);
          const startDate = new Date();
          startDate.setHours(hours, minutes, 0, 0);
          const endDate = new Date(startDate.getTime() + duration * 60000);
          newFormData.endTime = `${String(endDate.getHours()).padStart(
            2,
            "0"
          )}:${String(endDate.getMinutes()).padStart(2, "0")}`;
        }
      }
      return newFormData;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-6 p-3 text-gray-400 hover:text-[#F13F33] transition-all duration-300 rounded-2xl hover:bg-gray-100 group"
              >
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {isEditing ? t('forms.edit_appointment') : t('forms.new_appointment')}
                </h1>
                <p className="mt-3 text-xl text-gray-600">
                  {isEditing
                    ? t('forms.update_appointment_details')
                    : t('forms.schedule_new_appointment')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12">

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center mr-4">
                  <ArrowLeft className="w-6 h-6 text-white" />
                </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t('forms.appointment_details')}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.customer')}
                  </label>
                  <select
                    required
                    value={formData.customerId}
                    onChange={(e) =>
                      handleInputChange("customerId", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                <option value="">{t('forms.select_customer')}</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.firstName} {c.lastName}
                  </option>
                ))}
              </select>
            </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.vehicle')}
                  </label>
                  <select
                    required
                    value={formData.vehicleId}
                    onChange={(e) => handleInputChange("vehicleId", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                <option value="">{t('forms.select_vehicle')}</option>
                {vehicles
                  .filter(
                    (v) =>
                      (typeof v.customerId === "string"
                        ? v.customerId
                        : v.customerId?._id) === formData.customerId
                  )
                  .map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.make} {v.model} ({v.year})
                    </option>
                  ))}
              </select>
            </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.service')}
                  </label>
                  <select
                    required
                    value={formData.serviceId}
                    onChange={(e) => handleInputChange("serviceId", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                <option value="">{t('forms.select_service')}</option>
                {services.map((s) => (
                  <option key={s._id.toString()} value={s._id.toString()}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.mechanic')}
                  </label>
                  <select
                    required
                    value={formData.mechanicId}
                    onChange={(e) =>
                      handleInputChange("mechanicId", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                <option value="">{t('forms.assign_mechanic')}</option>
                {mechanics.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.userId.firstName} {m.userId.lastName}
                  </option>
                ))}
              </select>
            </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.appointment_date')}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.appointmentDate}
                    onChange={(e) =>
                      handleInputChange("appointmentDate", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  />
                </div>
            <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      {t('forms.start_time')}
                    </label>
                    <select
                      required
                      value={formData.startTime}
                      onChange={(e) =>
                        handleInputChange("startTime", e.target.value)
                      }
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    >
                  <option value="">{t('forms.select_time')}</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      {t('forms.end_time')}
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.endTime}
                      readOnly
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-gray-100/80 backdrop-blur-sm"
                    />
                  </div>
            </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.priority')}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange("priority", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                <option value="low">{t('forms.low')}</option>
                <option value="medium">{t('forms.medium')}</option>
                <option value="high">{t('forms.high')}</option>
                <option value="urgent">{t('forms.urgent')}</option>
              </select>
            </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                <option value="scheduled">{t('forms.scheduled')}</option>
                <option value="in-progress">{t('forms.in_progress')}</option>
                <option value="completed">{t('forms.completed')}</option>
                <option value="cancelled">{t('forms.cancelled')}</option>
              </select>
            </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.estimated_cost')}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.estimatedCost}
                    onChange={(e) =>
                      handleInputChange("estimatedCost", parseFloat(e.target.value))
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('ui.enter_estimated_cost')}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('forms.notes')}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={4}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300 resize-none"
                    placeholder={t('ui.enter_appointment_notes')}
                  ></textarea>
                </div>
          </div>
        </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="group inline-flex items-center px-8 py-4 border-2 border-gray-300 text-sm font-bold rounded-2xl text-gray-700 bg-white hover:border-[#F13F33] hover:text-[#F13F33] hover:bg-[#F13F33]/5 transition-all duration-300"
            >
              <X className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
              {t('forms.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group inline-flex items-center px-8 py-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-[#F13F33] to-[#d6352a] hover:shadow-xl hover:shadow-[#F13F33]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5"
            >
              <Save className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
              {loading
                ? t('forms.saving')
                : isEditing
                ? t('forms.update_appointment')
                : t('forms.save_appointment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}