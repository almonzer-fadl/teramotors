"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { socket } from "../../lib/services/socket";
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
      if (appointmentsRes.ok) setAppointments(await appointmentsRes.json());
      if (customersRes.ok) setCustomers(await customersRes.json());
      if (vehiclesRes.ok) setVehicles(await vehiclesRes.json());
      if (servicesRes.ok) setServices(await servicesRes.json());
      if (partsRes.ok) setParts(await partsRes.json());
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
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
        socket.emit("job-created");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? t("forms.edit_job_card") : t("forms.new_job_card")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditing
                ? t("forms.update_job_card_details")
                : t("forms.create_new_job_card")}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("forms.customer")}
              </label>
              <select
                required
                value={formData.customerId}
                onChange={(e) =>
                  handleInputChange("customerId", e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">{t("forms.select_customer")}</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.firstName} {c.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("forms.vehicle")}
              </label>
              <select
                required
                value={formData.vehicleId}
                onChange={(e) => handleInputChange("vehicleId", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("forms.status")}
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="pending">{t("estimates.pending")}</option>
                <option value="in-progress">{t("forms.in_progress")}</option>
                <option value="completed">{t("forms.completed")}</option>
                <option value="cancelled">{t("forms.cancelled")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("forms.priority")}
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="low">{t("forms.low")}</option>
                <option value="medium">{t("forms.medium")}</option>
                <option value="high">{t("forms.high")}</option>
                <option value="urgent">{t("forms.urgent")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("job_cards.estimated_start_time")}
              </label>
              <input
                type="datetime-local"
                value={formData.estimatedStartTime}
                onChange={(e) =>
                  handleInputChange("estimatedStartTime", e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("job_cards.estimated_end_time")}
              </label>
              <input
                type="datetime-local"
                value={formData.estimatedEndTime}
                onChange={(e) =>
                  handleInputChange("estimatedEndTime", e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                {t("forms.notes")}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t("forms.services")}
          </h3>
          {formData.services.map((service, index) => (
            <div
              key={index}
              className="grid grid-cols-5 gap-4 items-center mb-4"
            >
              <select
                value={service.serviceId}
                onChange={(e) =>
                  handleServiceChange(index, "serviceId", e.target.value)
                }
                className="col-span-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">{t("forms.select_service")}</option>
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder={t("forms.qty_placeholder")}
                value={service.quantity}
                onChange={(e) =>
                  handleServiceChange(index, "quantity", parseInt(e.target.value))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
.              <input
                type="number"
                placeholder={t("forms.labor_placeholder")}
                value={service.laborHours}
                onChange={(e) =>
                  handleServiceChange(index, "laborHours", parseFloat(e.target.value))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
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

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t("forms.parts_used")}
          </h3>
          {formData.partsUsed.map((part, index) => (
            <div
              key={index}
              className="grid grid-cols-4 gap-4 items-center mb-4"
            >
              <select
                value={part.partId}
                onChange={(e) =>
                  handlePartChange(index, "partId", e.target.value)
                }
                className="col-span-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">{t("job_cards.select_part")}</option>
                {parts.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder={t("job_cards.qty")}
                value={part.quantity}
                onChange={(e) =>
                  handlePartChange(index, "quantity", parseInt(e.target.value))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder={t("job_cards.cost")}
                value={part.cost}
                onChange={(e) =>
                  handlePartChange(index, "cost", parseFloat(e.target.value))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
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

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="mr-2 h-4 w-4" />
            {t("forms.cancel")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading
              ? t("forms.saving")
              : isEditing
              ? t("forms.update_job_card")
              : t("forms.save_job_card")}
          </button>
        </div>
      </form>
    </div>
  );
}
