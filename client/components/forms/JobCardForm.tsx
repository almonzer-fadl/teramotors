"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { socketService } from "../../lib/services/socket";
import { useTranslation } from "react-i18next";

interface AppointmentMinimal {
  _id: string;
}
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
  _id: string;
  name: string;
  laborHours: number;
  laborRate: number;
}
interface PartMinimal {
  _id: string;
  name: string;
  compatibleVehicles?: string[];
}

interface JobCardFormData {
  appointmentId: string;
  customerId: string;
  vehicleId: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  estimatedStartTime: string;
  estimatedEndTime: string;
  services: { serviceId: string; quantity: number; laborHours: number; laborRate: number }[];
  partsUsed: { partId: string; quantity: number; cost: number }[];
  notes: string;
}

export default function JobCardForm({
  jobCardId,
  appointmentId,
}: {
  jobCardId?: string;
  appointmentId?: string;
}) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentMinimal[]>([]);
  const [customers, setCustomers] = useState<CustomerMinimal[]>([]);
  const [vehicles, setVehicles] = useState<VehicleMinimal[]>([]);
  const [services, setServices] = useState<ServiceMinimal[]>([]);
  const [parts, setParts] = useState<PartMinimal[]>([]);
  const [formData, setFormData] = useState<JobCardFormData>({
    appointmentId: "",
    customerId: "",
    vehicleId: "",
    status: "pending",
    priority: "medium",
    estimatedStartTime: "",
    estimatedEndTime: "",
    services: [],
    partsUsed: [],
    notes: "",
  });

  const isEditing = !!jobCardId;

  const fetchJobCard = async () => {
    try {
      const response = await fetch(`/api/job-cards/${jobCardId}`);
      if (response.ok) {
        const jobCard = await response.json();
        setFormData({
          ...jobCard,
          estimatedStartTime: jobCard.estimatedStartTime
            ? new Date(jobCard.estimatedStartTime).toISOString().slice(0, 16)
            : "",
          estimatedEndTime: jobCard.estimatedEndTime
            ? new Date(jobCard.estimatedEndTime).toISOString().slice(0, 16)
            : "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch job card:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();
    if (isEditing) {
      fetchJobCard();
    } else if (appointmentId) {
      fetchAppointmentDetails(appointmentId);
    }
  }, [jobCardId, isEditing, appointmentId]);

  const fetchInitialData = async () => {
    try {
      const [
        appointmentsRes,
        customersRes,
        vehiclesRes,
        servicesRes,
        partsRes,
      ] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/customers"),
        fetch("/api/vehicles"),
        fetch("/api/services"),
        fetch("/api/parts"),
      ]);
      
      if (appointmentsRes.ok) {
        const data = await appointmentsRes.json();
        // The appointments API returns { appointments: [...], pagination: {...} }
        const appointmentsArray = Array.isArray(data.appointments) ? data.appointments : (Array.isArray(data) ? data : []);
        setAppointments(appointmentsArray);
      }
      
      if (customersRes.ok) {
        const json = await customersRes.json();
        // The customers API returns { customers: [...], pagination: {...} }
        const items = Array.isArray(json.customers) ? json.customers : (Array.isArray(json) ? json : []);
        setCustomers(items);
      } else {
        console.error("Failed to fetch customers:", customersRes.status, customersRes.statusText);
      }
      
      if (vehiclesRes.ok) {
        const data = await vehiclesRes.json();
        // The vehicles API returns { vehicles: [...], pagination: {...} }
        const vehiclesArray = Array.isArray(data.vehicles) ? data.vehicles : (Array.isArray(data) ? data : []);
        setVehicles(vehiclesArray);
      }
      
      if (servicesRes.ok) {
        const data = await servicesRes.json();
        const servicesArray = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
        setServices(servicesArray);
      }
      
      if (partsRes.ok) {
        const data = await partsRes.json();
        // The parts API returns { parts: [...], pagination: {...} }
        const partsArray = Array.isArray(data.parts) ? data.parts : (Array.isArray(data) ? data : []);
        setParts(partsArray);
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      // Set empty arrays on error to prevent runtime errors
      setAppointments([]);
      setCustomers([]);
      setVehicles([]);
      setServices([]);
      setParts([]);
    }
  };

  const fetchAppointmentDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`);
      if (response.ok) {
        const appointment = await response.json();
        setFormData((prev) => ({
          ...prev,
          appointmentId: appointment._id,
          customerId: appointment.customerId._id,
          vehicleId: appointment.vehicleId._id,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch appointment details:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing ? `/api/job-cards/${jobCardId}` : "/api/job-cards";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        socketService.emitJobCreated();
        router.push("/job-cards");
      } else {
        const error = await response.json();
        alert(error.message || t("forms.failed_to_save_job_card"));
      }
    } catch (error) {
      console.error("Failed to save job card:", error);
      alert(t("forms.failed_to_save_job_card"));
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (index: number, field: string, value: any) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };

    if (field === 'serviceId') {
      const service = services.find(s => s._id === value);
      if (service) {
        updatedServices[index].laborHours = service.laborHours;
        updatedServices[index].laborRate = service.laborRate;
      }
    }

    // Recalculate end time based on total labor hours
    let estimatedEndTime = '';
    if (formData.estimatedStartTime) {
        const totalLaborHours = updatedServices.reduce((sum, s) => sum + (s.laborHours || 0), 0);
        const startTime = new Date(formData.estimatedStartTime);
        const endTime = new Date(startTime.getTime() + (totalLaborHours * 60 * 60 * 1000));
        estimatedEndTime = endTime.toISOString().slice(0, 16);
    }

    setFormData(prev => ({
      ...prev,
      services: updatedServices,
      estimatedEndTime: estimatedEndTime
    }));
  };

  const addService = () => {
    handleInputChange("services", [
      ...formData.services,
      { serviceId: "", quantity: 1, laborHours: 0, laborRate: 0 },
    ]);
  };

  const removeService = (index: number) => {
    const updatedServices = formData.services.filter((_, i) => i !== index);
    handleInputChange("services", updatedServices);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newFormData = { ...prev, [field]: value };
      if (field === 'customerId') {
        newFormData.vehicleId = '';
        const customerVehicles = vehicles.filter(v => {
            const customerId = typeof v.customerId === 'object' ? v.customerId._id : v.customerId;
            return customerId === value;
        });
        if (customerVehicles.length > 0) {
            newFormData.vehicleId = customerVehicles[0]._id;
        }
      }
      return newFormData;
    });
  };

  const handlePartChange = (index: number, field: string, value: any) => {
    const updatedParts = [...formData.partsUsed];
    updatedParts[index] = { ...updatedParts[index], [field]: value };

    // Auto-fill cost when part selected
    if (field === 'partId') {
      const selected = parts.find(p => p._id === value) as any;
      if (selected && typeof selected.cost === 'number') {
        updatedParts[index].cost = selected.cost;
      } else if (selected && typeof selected.sellingPrice === 'number') {
        updatedParts[index].cost = selected.sellingPrice;
      }
    }

    handleInputChange("partsUsed", updatedParts);
  };

  const addPart = () => {
    handleInputChange("partsUsed", [
      ...formData.partsUsed,
      { partId: "", quantity: 1, cost: 0 },
    ]);
  };

  const removePart = (index: number) => {
    const updatedParts = formData.partsUsed.filter((_, i) => i !== index);
    handleInputChange("partsUsed", updatedParts);
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
                  {isEditing ? t("forms.edit_job_card") : t("forms.new_job_card")}
                </h1>
                <p className="mt-3 text-xl text-gray-600">
                  {isEditing
                    ? t("forms.update_job_card_details")
                    : t("forms.create_new_job_card")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Job Card Details Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center mr-4">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t("forms.job_card_details")}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("forms.customer")}
                  </label>
                  <select
                    required
                    value={formData.customerId}
                    onChange={(e) =>
                      handleInputChange("customerId", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                    <option value="">{t("forms.select_customer")}</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.firstName} {c.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("forms.vehicle")}
                  </label>
                  <select
                    required
                    value={formData.vehicleId}
                    onChange={(e) => handleInputChange("vehicleId", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300 disabled:opacity-50"
                    disabled={!formData.customerId}
                  >
                    <option value="">{t("forms.select_vehicle")}</option>
                    {vehicles
                      .filter((v) => {
                        if (!formData.customerId) return false;
                        const customerId = typeof v.customerId === 'object' ? v.customerId._id : v.customerId;
                        return customerId === formData.customerId;
                      })
                      .map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.make} {v.model} ({v.year})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("forms.status")}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                    <option value="pending">{t("estimates.pending")}</option>
                    <option value="in-progress">{t("forms.in_progress")}</option>
                    <option value="completed">{t("forms.completed")}</option>
                    <option value="cancelled">{t("forms.cancelled")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("forms.priority")}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange("priority", e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
                    <option value="low">{t("forms.low")}</option>
                    <option value="medium">{t("forms.medium")}</option>
                    <option value="high">{t("forms.high")}</option>
                    <option value="urgent">{t("forms.urgent")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("job_cards.estimated_start_time")}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.estimatedStartTime}
                    onChange={(e) =>
                      handleInputChange("estimatedStartTime", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("job_cards.estimated_end_time")}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.estimatedEndTime}
                    onChange={(e) =>
                      handleInputChange("estimatedEndTime", e.target.value)
                    }
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t("forms.notes")}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={4}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300 resize-none"
                    placeholder={t('ui.enter_job_card_notes')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-[#063479] to-[#052a5f] rounded-2xl flex items-center justify-center mr-4">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t("forms.services")}
                </h3>
              </div>
              {formData.services.map((service, index) => (
                <div
                  key={index}
                  className="grid grid-cols-5 gap-4 items-center mb-4"
                >
                  <div className="col-span-2 space-y-2">
                    <label className="block text-sm font-bold text-gray-700">{t('forms.service')}</label>
                    <select
                      value={service.serviceId}
                      onChange={(e) =>
                        handleServiceChange(index, "serviceId", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    >
                      <option value="">{t("forms.select_service")}</option>
                      {services.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">{t('forms.qty')}</label>
                    <input
                      type="number"
                      value={service.quantity}
                      onChange={(e) =>
                        handleServiceChange(index, "quantity", parseInt(e.target.value))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">{t('job_cards.labor_hours')}</label>
                    <input
                      type="number"
                      value={service.laborHours}
                      onChange={(e) =>
                        handleServiceChange(index, "laborHours", parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">{t('job_cards.labor_rate')}</label>
                    <input
                      type="number"
                      value={service.laborRate}
                      onChange={(e) =>
                        handleServiceChange(index, "laborRate", parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addService}
                className="mt-4 inline-flex items-center px-4 py-2 border border-dashed border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("forms.add_service")}
              </button>
            </div>
          </div>

          {/* Parts Used Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {t("forms.parts_used")}
                </h3>
              </div>
              {formData.partsUsed.map((part, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-4 items-center mb-4"
                >
                  <div className="col-span-2 space-y-2">
                    <label className="block text-sm font-bold text-gray-700">{t('job_cards.select_part')}</label>
                    <select
                      value={part.partId}
                      onChange={(e) =>
                        handlePartChange(index, "partId", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    >
                      <option value="">{t("job_cards.select_part")}</option>
                      {parts.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">{t('job_cards.qty')}</label>
                    <input
                      type="number"
                      value={part.quantity}
                      onChange={(e) =>
                        handlePartChange(index, "quantity", parseInt(e.target.value))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">{t('job_cards.cost')}</label>
                    <input
                      type="number"
                      name="cost"
                      value={part.cost}
                      onChange={(e) =>
                        handlePartChange(index, "cost", parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePart(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPart}
                className="mt-4 inline-flex items-center px-4 py-2 border border-dashed border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("forms.add_part")}
              </button>
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
              {t("forms.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group inline-flex items-center px-8 py-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-[#F13F33] to-[#d6352a] hover:shadow-xl hover:shadow-[#F13F33]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5"
            >
              <Save className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
              {loading
                ? t("forms.saving")
                : isEditing
                ? t("forms.update_job_card")
                : t("forms.save_job_card")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}