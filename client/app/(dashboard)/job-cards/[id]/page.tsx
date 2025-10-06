/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  User,
  Car,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  Plus,
  Trash2,
} from "lucide-react";
import FileUpload from "@/components/dashboard/FileUpload";
import { useTranslation } from "react-i18next";
import { socket } from "@/lib/services/socket";
import { useSession } from "@/lib/hooks/useSession";

interface PartMinimal {
  _id: string;
  name: string;
  cost: number;
}

interface ServiceMinimal {
  _id: string;
  name: string;
  description: string;
  laborHours: number;
  laborRate: number;
}

interface JobCard {
  _id: string;
  appointmentId?: {
    _id: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
  };
  inspectionId?: {
    _id: string;
    inspectionDate: string;
    overallCondition: string;
    totalEstimatedCost: number;
    items: {
      itemId: string;
      condition: string;
      priority: string;
      estimatedCost: number;
      notes: string;
      recommendations: string;
    }[];
  };
  customerId: { _id: string; firstName: string; lastName: string };
  vehicleId: {
    _id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  mechanicId?: { _id: string; fullName: string };
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  estimatedStartTime: string;
  estimatedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  laborHours: number;
  notes?: string;
  photos: string[];
  services: { 
    serviceId: { _id: string; name: string; description: string; laborHours: number; laborRate: number } | string; 
    quantity: number; 
    laborHours: number; 
    laborRate: number 
  }[];
  partsUsed: { 
    partId: { _id: string; name: string; partNumber: string; cost: number } | string; 
    quantity: number; 
    cost: number 
  }[];
}

export default function JobCardDetailsPage() {
  const { t } = useTranslation("common");
  const params = useParams();
  const router = useRouter();
  const { user } = useSession();
  const { id } = params;
  const [jobCard, setJobCard] = useState<JobCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [parts, setParts] = useState<PartMinimal[]>([]);
  const [services, setServices] = useState<ServiceMinimal[]>([]);
  
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (id) {
      fetchJobCard();
      fetchParts();
      fetchServices();
    }
  }, [id]);

  const fetchJobCard = async () => {
    try {
      const response = await fetch(`/api/job-cards/${id}`);
      if (response.ok) {
        setJobCard(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch job card:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParts = async () => {
    try {
      const response = await fetch("/api/parts");
      if (response.ok) {
        const data = await response.json();
        // Ensure data is always an array
        const partsArray = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
        setParts(partsArray);
      }
    } catch (error) {
      console.error("Failed to fetch parts:", error);
      setParts([]); // Set empty array on error
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        // Ensure data is always an array
        const servicesArray = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
        setServices(servicesArray);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
      setServices([]); // Set empty array on error
    }
  };

  const handleTimeTracking = async (action: "start" | "end") => {
    try {
      const response = await fetch(`/api/job-cards/${id}/time`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (response.ok) {
        const updatedJobCard = await response.json();
        setJobCard(updatedJobCard.jobCard);
      }
    } catch (error) {
      console.error(`Failed to ${action} job:`, error);
    }
  };

  const handlePhotoUpload = async (url: string) => {
    if (jobCard) {
      const updatedPhotos = [...jobCard.photos, url];
      try {
        const response = await fetch(`/api/job-cards/${id}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photos: updatedPhotos }),
        });
        if (response.ok) {
          setJobCard({ ...jobCard, photos: updatedPhotos });
        }
      } catch (error) {
        console.error("Failed to upload photo:", error);
      }
    }
  };

  const handlePartChange = (index: number, field: string, value: any) => {
    if (jobCard) {
      const updatedParts = [...jobCard.partsUsed];
      updatedParts[index] = { ...updatedParts[index], [field]: value };
      
      // If partId is being changed, update the part cost
      if (field === 'partId') {
        const part = parts.find(p => p._id === value);
        if (part) {
          updatedParts[index].cost = part.cost || 0;
        }
      }
      
      setJobCard({ ...jobCard, partsUsed: updatedParts });
    }
  };

  const addPart = () => {
    if (jobCard) {
      const updatedParts = [
        ...jobCard.partsUsed,
        { partId: "", quantity: 1, cost: 0 },
      ];
      setJobCard({ ...jobCard, partsUsed: updatedParts });
    }
  };

  const removePart = (index: number) => {
    if (jobCard) {
      const updatedParts = jobCard.partsUsed.filter((_, i) => i !== index);
      setJobCard({ ...jobCard, partsUsed: updatedParts });
    }
  };

  const saveParts = async () => {
    if (jobCard) {
      try {
        const response = await fetch(`/api/job-cards/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partsUsed: jobCard.partsUsed }),
        });
        socket.emit("part-updated");
        if (!response.ok) {
          throw new Error(t("job_cards.failed_to_save_parts"));
        }
      } catch (error) {
        console.error("Failed to save parts:", error);
      }
    }
  };

  const saveNotes = async () => {
    if (jobCard) {
      try {
        const response = await fetch(`/api/job-cards/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes: jobCard.notes }),
        });
        socket.emit("part-updated");
        if (!response.ok) {
          throw new Error(t("job_cards.failed_to_save_notes"));
        }
      } catch (error) {
        console.error("Failed to save notes:", error);
      }
    }
  };

  const handleServiceChange = (index: number, field: string, value: any) => {
    if (jobCard) {
      const updatedServices = [...jobCard.services];
      updatedServices[index] = { ...updatedServices[index], [field]: value };
      
      // If serviceId is being changed, update the service details
      if (field === 'serviceId') {
        const service = services.find(s => s._id === value);
        if (service) {
          updatedServices[index].laborHours = service.laborHours;
          updatedServices[index].laborRate = service.laborRate;
        }
      }
      
      setJobCard({ ...jobCard, services: updatedServices });
    }
  };

  const addService = () => {
    if (jobCard) {
      const updatedServices = [
        ...jobCard.services,
        { serviceId: "", quantity: 1, laborHours: 0, laborRate: 0 },
      ];
      setJobCard({ ...jobCard, services: updatedServices });
    }
  };

  const removeService = (index: number) => {
    if (jobCard) {
      const updatedServices = jobCard.services.filter((_, i) => i !== index);
      setJobCard({ ...jobCard, services: updatedServices });
    }
  };

  const saveServices = async () => {
    if (jobCard) {
      try {
        const response = await fetch(`/api/job-cards/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ services: jobCard.services }),
        });
        socket.emit("service-updated");
        if (!response.ok) {
          throw new Error(t("job_cards.failed_to_save_services"));
        }
      } catch (error) {
        console.error("Failed to save services:", error);
      }
    }
  };

  const handleDeleteJobCard = async () => {
    if (!isAdmin) return;
    
    if (!confirm(t("job_cards.delete_confirmation"))) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/job-cards/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert(t("job_cards.delete_success"));
        router.push("/job-cards");
      } else {
        const error = await response.json();
        alert(error.error || t("job_cards.failed_to_delete"));
      }
    } catch (error) {
      console.error("Failed to delete job card:", error);
      alert(t("job_cards.failed_to_delete"));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F13F33] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">{t("job_cards.loading")}</p>
        </div>
      </div>
    );
  }

  if (!jobCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("job_cards.not_found")}</h2>
          <p className="text-gray-600">{t("job_cards.not_found")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center">
              <Link
                href="/job-cards"
                className="mr-6 p-3 text-gray-400 hover:text-[#F13F33] transition-all duration-300 rounded-2xl hover:bg-gray-100 group"
              >
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {t("job_cards.details_title")}
                </h1>
                <p className="mt-3 text-xl text-gray-600">
                  Job Card #{jobCard._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <div className="flex space-x-2">
                {!jobCard.actualStartTime && (
                  <button
                    onClick={() => handleTimeTracking("start")}
                    className="group inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-xl hover:shadow-blue-600/25 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Clock className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                    {t("job_cards.start_job")}
                  </button>
                )}
                {jobCard.actualStartTime && !jobCard.actualEndTime && (
                  <button
                    onClick={() => handleTimeTracking("end")}
                    className="group inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:shadow-xl hover:shadow-red-600/25 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <CheckCircle className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                    {t("job_cards.end_job")}
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={handleDeleteJobCard}
                    disabled={deleting}
                    className="group inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:shadow-xl hover:shadow-red-600/25 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                    {deleting ? t("job_cards.deleting") : t("job_cards.delete_job_card")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Job Card Overview */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  {t("job_cards.customer_info")}
                </h3>
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-lg font-bold text-gray-900">
                    {jobCard.customerId.firstName} {jobCard.customerId.lastName}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  {t("job_cards.vehicle_info")}
                </h3>
                <div className="flex items-center">
                  <Car className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {jobCard.vehicleId.make} {jobCard.vehicleId.model} ({jobCard.vehicleId.year})
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("job_cards.license_plate")}: {jobCard.vehicleId.licensePlate}
                    </p>
                  </div>
                </div>
              </div>
              {jobCard.mechanicId && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    {t("job_cards.assigned_mechanic")}
                  </h3>
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-lg font-bold text-gray-900">
                      {jobCard.mechanicId.fullName}
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  {t("job_cards.status")}
                </h3>
                <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${
                  jobCard.status === 'completed' ? 'bg-green-100 text-green-800' :
                  jobCard.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  jobCard.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {t(`job_cards.status_${jobCard.status}`)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Inspection Details Section */}
        {jobCard.inspectionId && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t("job_cards.inspection_details")}
                </h2>
                <Link
                  href={`/inspections/${jobCard.inspectionId._id}`}
                  className="group inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-2xl text-[#F13F33] bg-[#F13F33]/10 hover:bg-[#F13F33]/20 transition-all duration-300"
                >
                  {t("job_cards.view_full_inspection")}
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    {t("inspections.inspection_date")}
                  </h3>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(jobCard.inspectionId.inspectionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    {t("inspections.overall_condition")}
                  </h3>
                  <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${
                    jobCard.inspectionId.overallCondition === 'excellent' ? 'bg-green-100 text-green-800' :
                    jobCard.inspectionId.overallCondition === 'good' ? 'bg-blue-100 text-blue-800' :
                    jobCard.inspectionId.overallCondition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {t(`forms.condition_${jobCard.inspectionId.overallCondition}`)}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                    {t("inspections.total_estimated_cost")}
                  </h3>
                  <p className="text-2xl font-bold text-[#F13F33]">
                    ${jobCard.inspectionId.totalEstimatedCost.toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {t("inspections.inspection_findings")}
                </h3>
                <div className="space-y-4">
                  {jobCard.inspectionId.items.map((item, index) => (
                    <div key={index} className="bg-gray-50/80 rounded-2xl p-6 border border-gray-200/50">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-bold text-gray-900 capitalize">
                          {item.itemId}
                        </h4>
                        <div className="flex space-x-2">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                            item.condition === 'good' ? 'bg-green-100 text-green-800' :
                            item.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                            item.condition === 'poor' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {t(`forms.condition_${item.condition}`)}
                          </span>
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                            item.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            item.priority === 'safety' ? 'bg-orange-100 text-orange-800' :
                            item.priority === 'recommended' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {t(`forms.priority_${item.priority}`)}
                          </span>
                        </div>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>{t("forms.notes")}:</strong> {item.notes}
                        </p>
                      )}
                      {item.recommendations && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>{t("forms.recommendations")}:</strong> {item.recommendations}
                        </p>
                      )}
                      {item.estimatedCost > 0 && (
                        <p className="text-sm font-bold text-gray-900">
                          <strong>{t("forms.estimated_cost")}:</strong> ${item.estimatedCost.toFixed(2)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t("job_cards.services")}
            </h2>
            {jobCard.services.map((service, index) => {
              const serviceId = typeof service.serviceId === 'string' ? service.serviceId : service.serviceId?._id || '';
              const serviceName = typeof service.serviceId === 'object' && service.serviceId ? service.serviceId.name : '';
              const selectedService = services.find(s => s._id === serviceId) || { name: serviceName };
              
              return (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start mb-6 p-4 bg-gray-50/80 rounded-2xl">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t("forms.select_service")}
                    </label>
                    <select
                      value={serviceId}
                      onChange={(e) =>
                        handleServiceChange(index, "serviceId", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    >
                      <option value="">{t("forms.select_service")}</option>
                      {services.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {selectedService && selectedService.name && (
                      <p className="mt-2 text-sm text-gray-600">
                        <strong>{t("job_cards.selected")}</strong> {selectedService.name}
                      </p>
                    )}
                  </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t("forms.qty")}
                  </label>
                  <input
                    type="number"
                    value={service.quantity}
                    onChange={(e) =>
                      handleServiceChange(index, "quantity", parseInt(e.target.value))
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t("job_cards.labor_hours")}
                  </label>
                  <input
                    type="number"
                    value={service.laborHours}
                    onChange={(e) =>
                      handleServiceChange(index, "laborHours", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    min="0"
                    step="0.1"
                  />
                </div>
                {isAdmin ? (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t("forms.labor_placeholder")}
                    </label>
                    <input
                      type="number"
                      value={service.laborRate}
                      onChange={(e) =>
                        handleServiceChange(index, "laborRate", parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                      min="0"
                      step="0.01"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t("forms.labor_placeholder")}
                    </label>
                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500 text-center">
                      {t("job_cards.admin_only")}
                    </div>
                  </div>
                )}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="text-red-500 hover:text-red-700 p-3 rounded-xl hover:bg-red-50 transition-all duration-300"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              );
            })}
            <div className="flex justify-between items-center mt-6">
              <button
                type="button"
                onClick={addService}
                className="group inline-flex items-center px-6 py-3 border-2 border-dashed border-gray-300 text-sm font-bold rounded-2xl text-gray-700 bg-white hover:bg-gray-50 hover:border-[#F13F33] hover:text-[#F13F33] transition-all duration-300"
              >
                <Plus className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                {t("job_cards.add_service")}
              </button>
              <button
                onClick={saveServices}
                className="group inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-[#F13F33] to-[#d6352a] hover:shadow-xl hover:shadow-[#F13F33]/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                {t("job_cards.save_services")}
              </button>
            </div>
          </div>
        </div>

        {/* Parts Used Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t("job_cards.parts_used")}
            </h2>
            {jobCard.partsUsed.map((part, index) => {
              const partId = typeof part.partId === 'string' ? part.partId : part.partId?._id || '';
              const partName = typeof part.partId === 'object' && part.partId ? part.partId.name : '';
              const selectedPart = parts.find(p => p._id === partId) || { name: partName };
              
              return (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start mb-6 p-4 bg-gray-50/80 rounded-2xl">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t("forms.select_part")}
                    </label>
                    <select
                      value={partId}
                      onChange={(e) =>
                        handlePartChange(index, "partId", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    >
                      <option value="">{t("forms.select_part")}</option>
                      {parts.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {selectedPart && selectedPart.name && (
                      <p className="mt-2 text-sm text-gray-600">
                        <strong>{t("job_cards.selected")}</strong> {selectedPart.name}
                      </p>
                    )}
                  </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t("forms.qty")}
                  </label>
                  <input
                    type="number"
                    value={part.quantity}
                    onChange={(e) =>
                      handlePartChange(index, "quantity", parseInt(e.target.value))
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    min="1"
                  />
                </div>
                {isAdmin ? (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t("forms.cost_placeholder")}
                    </label>
                    <input
                      type="number"
                      value={part.cost}
                      onChange={(e) =>
                        handlePartChange(index, "cost", parseFloat(e.target.value))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                      min="0"
                      step="0.01"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {t("forms.cost_placeholder")}
                    </label>
                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-500 text-center">
                      {t("job_cards.admin_only")}
                    </div>
                  </div>
                )}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removePart(index)}
                    className="text-red-500 hover:text-red-700 p-3 rounded-xl hover:bg-red-50 transition-all duration-300"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              );
            })}
            <div className="flex justify-between items-center mt-6">
              <button
                type="button"
                onClick={addPart}
                className="group inline-flex items-center px-6 py-3 border-2 border-dashed border-gray-300 text-sm font-bold rounded-2xl text-gray-700 bg-white hover:bg-gray-50 hover:border-[#F13F33] hover:text-[#F13F33] transition-all duration-300"
              >
                <Plus className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                {t("job_cards.add_part")}
              </button>
              <button
                onClick={saveParts}
                className="group inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-[#F13F33] to-[#d6352a] hover:shadow-xl hover:shadow-[#F13F33]/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                {t("job_cards.save_parts")}
              </button>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t("forms.notes")}
            </h2>
            <textarea
              value={jobCard.notes || ""}
              onChange={(e) => setJobCard({ ...jobCard, notes: e.target.value })}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300 resize-none"
              rows={4}
              placeholder={t("ui.enter_job_card_notes")}
            />
            <div className="flex justify-end mt-6">
              <button
                onClick={saveNotes}
                className="group inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-[#F13F33] to-[#d6352a] hover:shadow-xl hover:shadow-[#F13F33]/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                {t("job_cards.save_notes")}
              </button>
            </div>
          </div>
        </div>

        {/* Progress Photos Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t("job_cards.progress_photos")}
            </h2>
            <FileUpload onUpload={async (files: File[]) => {
              for (const file of files) {
                try {
                  // Upload file to /api/upload
                  const formData = new FormData();
                  formData.append('file', file);
                  
                  const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                  });
                  
                  if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();
                    await handlePhotoUpload(uploadData.url);
                  }
                } catch (error) {
                  console.error('Error uploading file:', error);
                }
              }
            }} />
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {jobCard.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={t("job_cards.progress_photo_alt", { index: index + 1 })}
                    className="rounded-2xl object-cover w-full h-48 shadow-lg group-hover:shadow-xl transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}