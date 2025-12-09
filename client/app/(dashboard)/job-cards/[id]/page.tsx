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
import InlineInvoiceCreator from "@/components/forms/InlineInvoiceCreator";
import InlineEstimateCreator from "@/components/forms/InlineEstimateCreator";
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
  discount?: number;
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
  const [linkedInvoiceId, setLinkedInvoiceId] = useState<string | null>(null);
  const [showInvoiceCreator, setShowInvoiceCreator] = useState(false);
  const [showEstimateCreator, setShowEstimateCreator] = useState(false);
  const [linkedEstimateId, setLinkedEstimateId] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (id) {
      fetchJobCard();
      fetchParts();
      fetchServices();
      fetchLinkedInvoice();
      fetchLinkedEstimate();
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

  const fetchLinkedInvoice = async () => {
    try {
      const response = await fetch(`/api/job-cards/${id}/invoice`);
      if (response.ok) {
        const data = await response.json();
        setLinkedInvoiceId(data.invoice?._id || null);
      }
    } catch (error) {
      console.error('Failed to fetch linked invoice:', error);
    }
  };

  const fetchLinkedEstimate = async () => {
    try {
      const response = await fetch(`/api/estimates?jobCardId=${id}`);
      if (response.ok) {
        const data = await response.json();
        // Find the first estimate linked to this job card
        const linkedEstimate = data.estimates?.find((est: any) => est.jobCardId?._id === id || est.jobCardId === id);
        setLinkedEstimateId(linkedEstimate?._id || null);
      }
    } catch (error) {
      console.error('Failed to fetch linked estimate:', error);
    }
  };

  const createInvoiceFromJobCard = async () => {
    setShowInvoiceCreator(true);
  };

  const createEstimateFromJobCard = async () => {
    setShowEstimateCreator(true);
  };

  const handleInvoiceCreated = (invoice: { _id: string }) => {
    setLinkedInvoiceId(invoice._id);
    setShowInvoiceCreator(false);
    alert(t('invoices.invoice_created_successfully'));
  };

  const handleEstimateCreated = (estimate: { _id: string }) => {
    setLinkedEstimateId(estimate._id);
    setShowEstimateCreator(false);
    alert(t('estimates.estimate_created_successfully'));
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97402] mx-auto"></div>
          <p className="mt-4 text-base text-gray-700 dark:text-gray-300">{t("job_cards.loading")}</p>
        </div>
      </div>
    );
  }

  if (!jobCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("job_cards.not_found")}</h2>
          <p className="text-gray-700 dark:text-gray-300">{t("job_cards.not_found_description")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/job-cards"
              className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#F97402] transition-all duration-200 group"
            >
              <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                {t("job_cards.details_title")}
              </h1>
              <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                Job Card #{jobCard._id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <button
                  onClick={handleDeleteJobCard}
                  disabled={deleting}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
                >
                  <Trash2 className="me-2 h-5 w-5" />
                  {deleting ? t("job_cards.deleting") : t("job_cards.delete_job_card")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Job Card Overview */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  {t("job_cards.customer_info")}
                </h3>
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
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
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {jobCard.vehicleId.make} {jobCard.vehicleId.model} ({jobCard.vehicleId.year})
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
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

        {/* Invoice and Estimate Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Invoice Quick Actions */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-8 py-6 flex flex-col">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('invoices.title')}</h2>
                <p className="text-gray-600 text-sm mt-1">
                  {linkedInvoiceId ? t('common.view') : t('invoices.create_invoice')}
                </p>
              </div>
              <div className="flex gap-2">
                {!linkedInvoiceId && (
                  <button onClick={createInvoiceFromJobCard} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">
                    {t('invoices.create_invoice')}
                  </button>
                )}
                {linkedInvoiceId && (
                  <Link href={`/invoices/${linkedInvoiceId}`} className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50 transition-colors">
                    {t('invoices.view_invoice')}
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Estimate Quick Actions */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-8 py-6 flex flex-col">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('estimates.title')}</h2>
                <p className="text-gray-600 text-sm mt-1">
                  {linkedEstimateId ? t('common.view') : t('estimates.create_estimate')}
                </p>
              </div>
              <div className="flex gap-2">
                {!linkedEstimateId && (
                  <button onClick={createEstimateFromJobCard} className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm hover:bg-green-700 transition-colors">
                    {t('estimates.create_estimate')}
                  </button>
                )}
                {linkedEstimateId && (
                  <Link href={`/estimates/${linkedEstimateId}`} className="px-4 py-2 rounded-xl border text-sm hover:bg-gray-50 transition-colors">
                    {t('estimates.view_estimate')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inspection Details Section */}
        {jobCard.inspectionId && (
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-8 py-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
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
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
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
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
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
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
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
                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-700">
                      {selectedService && selectedService.name ? selectedService.name : t("forms.no_service_selected")}
                    </div>
                    {selectedService && selectedService.name && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <strong>{t("job_cards.selected")}</strong> {selectedService.name}
                      </p>
                    )}
                  </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t("forms.qty")}
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-700">
                    {service.quantity}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t("job_cards.labor_hours")}
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-700">
                    {service.laborHours}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t("forms.labor_placeholder")}
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-700">
                    {service.laborRate}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Parts Used Section */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
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
                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-700">
                      {selectedPart && selectedPart.name ? selectedPart.name : t("forms.no_part_selected")}
                    </div>
                    {selectedPart && selectedPart.name && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <strong>{t("job_cards.selected")}</strong> {selectedPart.name}
                      </p>
                    )}
                  </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t("forms.qty")}
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-700">
                    {part.quantity}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {t("forms.cost_placeholder")}
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-700">
                    {part.cost}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t("forms.notes")}
            </h2>
            <div className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl bg-gray-100 text-gray-700 min-h-[100px]">
              {jobCard.notes || t("ui.no_notes_available")}
            </div>
          </div>
        </div>

        {/* Discount Section */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t("common.discount_percentage")}
            </h2>
            <div className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl bg-gray-100 text-gray-700">
              {jobCard.discount ? `${jobCard.discount}%` : "0%"}
            </div>
          </div>
        </div>

        {/* Progress Photos Section */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
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

        {/* Inline Invoice Creator Modal */}
        <InlineInvoiceCreator
          isOpen={showInvoiceCreator}
          onClose={() => setShowInvoiceCreator(false)}
          jobCardId={Array.isArray(id) ? id[0] || "" : id || ""}
          onCreated={handleInvoiceCreated}
        />

        {/* Inline Estimate Creator Modal */}
        <InlineEstimateCreator
          isOpen={showEstimateCreator}
          onClose={() => setShowEstimateCreator(false)}
          jobCardId={Array.isArray(id) ? id[0] || "" : id || ""}
          onCreated={handleEstimateCreated}
        />
      </div>
    </div>
  );
}