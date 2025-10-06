"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  FileText,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Wrench,
  Download,
  Trash2,
  Calendar,
  User,
  Car,
  Settings,
  Clock,
  MapPin,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface InspectionItem {
  itemId: string;
  category: string;
  condition: string;
}

interface VehicleInspection {
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
  mechanicId: {
    _id: string;
    firstName: string;
    lastName: string;
    displayName: string;
  };
  templateId: {
    _id: string;
    name: string;
  };
  inspectionDate: string;
  mileage: number;
  overallCondition: string;
  items: InspectionItem[];
  recommendations: string;
  nextInspectionDate: string;
  status: "in-progress" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export default function InspectionDetailsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [inspection, setInspection] = useState<VehicleInspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchInspection();
  }, [id]);

  const fetchInspection = async () => {
    try {
      const response = await fetch(`/api/inspections/${id}`);
      if (response.ok) {
        const data = await response.json();
        setInspection(data);
      } else {
        console.error("Failed to fetch inspection");
        router.push("/inspections");
      }
    } catch (error) {
      console.error("Error fetching inspection:", error);
      router.push("/inspections");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!inspection) return;

    setGeneratingPDF(true);
    try {
      // Get current language from i18n
      const currentLanguage = localStorage.getItem('i18nextLng') || 'en';
      // Open PDF in new tab for viewing with language parameter
      window.open(`/api/inspections/${id}/pdf?lang=${currentLanguage}`, '_blank');
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert(t("inspections.failed_to_generate_pdf"));
    } finally {
      setGeneratingPDF(false);
    }
  };

  const deleteInspection = async () => {
    if (!inspection) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/inspections/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/inspections");
      } else {
        console.error("Failed to delete inspection");
        alert(t("inspections.failed_to_delete"));
      }
    } catch (error) {
      console.error("Error deleting inspection:", error);
      alert(t("inspections.failed_to_delete"));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!inspection) return;

    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/inspections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...inspection,
          status: newStatus,
        }),
      });

      if (response.ok) {
        setInspection(prev => prev ? { ...prev, status: newStatus as any } : null);
      } else {
        console.error("Failed to update status");
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(false);
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
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "good":
        return "bg-green-100 text-green-800 border-green-200";
      case "fair":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "poor":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F13F33] mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Loading inspection...</p>
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inspection Not Found</h2>
          <p className="text-gray-600 mb-6">The inspection you're looking for doesn't exist.</p>
          <Link
            href="/inspections"
            className="inline-flex items-center px-6 py-3 bg-[#F13F33] text-white font-bold rounded-xl hover:bg-[#E03A2F] transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Inspections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/inspections"
                className="p-2 text-gray-400 hover:text-[#F13F33] hover:bg-[#F13F33]/10 rounded-xl transition-all duration-300"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Inspection Details
                </h1>
                <p className="text-sm text-gray-500">
                  {inspection.vehicleId.make} {inspection.vehicleId.model} - {formatDate(inspection.inspectionDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={generatePDF}
                disabled={generatingPDF}
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300 font-medium"
              >
                <Download className="mr-2 h-4 w-4" />
                {generatingPDF ? t("inspections.generating_pdf") : t("inspections.generate_pdf")}
              </button>
              <Link
                href={`/inspections/${id}/edit`}
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300 font-medium"
              >
                <Edit className="mr-2 h-4 w-4" />
                {t("forms.edit")}
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-300 font-medium"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("forms.delete")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-[#F13F33]/10 rounded-xl mr-4">
                      <Settings className="h-6 w-6 text-[#F13F33]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Inspection Status</h2>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border ${getStatusColor(inspection.status)}`}>
                      {inspection.status.replace("-", " ").toUpperCase()}
                    </span>
                    <select
                      value={inspection.status}
                      onChange={(e) => updateStatus(e.target.value)}
                      disabled={updatingStatus}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300"
                    >
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Inspection Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(inspection.inspectionDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Overall Condition</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold border ${getConditionColor(inspection.overallCondition)}`}>
                        {inspection.overallCondition.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-blue-100 rounded-xl mr-4">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Vehicle Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Make & Model</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {inspection.vehicleId.make} {inspection.vehicleId.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Year</p>
                    <p className="text-lg font-semibold text-gray-900">{inspection.vehicleId.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">License Plate</p>
                    <p className="text-lg font-semibold text-gray-900">{inspection.vehicleId.licensePlate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mileage</p>
                    <p className="text-lg font-semibold text-gray-900">{inspection.mileage?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspection Items */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-green-100 rounded-xl mr-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Inspection Items</h2>
                </div>
                {inspection.items && inspection.items.length > 0 ? (
                  <div className="space-y-4">
                    {inspection.items.map((item, index) => (
                      <div key={index} className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:border-[#F13F33]/30 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{item.itemId}</h3>
                              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold border ${getConditionColor(item.condition)}`}>
                                {item.condition.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{item.category}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No inspection items found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            {inspection.recommendations && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="px-6 py-8">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-yellow-100 rounded-xl mr-4">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Recommendations</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{inspection.recommendations}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Customer Information */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-purple-100 rounded-xl mr-4">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Customer</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-semibold text-gray-900">
                      {inspection.customerId.firstName} {inspection.customerId.lastName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mechanic Information */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-orange-100 rounded-xl mr-4">
                    <Wrench className="h-6 w-6 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Mechanic</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-semibold text-gray-900">
                      {inspection.mechanicId.displayName || `${inspection.mechanicId.firstName} ${inspection.mechanicId.lastName}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Information */}
            {inspection.templateId && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="px-6 py-8">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-indigo-100 rounded-xl mr-4">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Template</h2>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Template Name</p>
                      <p className="font-semibold text-gray-900">{inspection.templateId.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Next Inspection */}
            {inspection.nextInspectionDate && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="px-6 py-8">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-teal-100 rounded-xl mr-4">
                      <Calendar className="h-6 w-6 text-teal-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Next Inspection</h2>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(inspection.nextInspectionDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t("inspections.delete_inspection")}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {t("inspections.delete_warning")}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 font-medium"
                >
                  {t("forms.cancel")}
                </button>
                <button
                  onClick={deleteInspection}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 rounded-xl transition-all duration-300 font-medium"
                >
                  {deleting ? t("inspections.deleting") : t("forms.delete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}