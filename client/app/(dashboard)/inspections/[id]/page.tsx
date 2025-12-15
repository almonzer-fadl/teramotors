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
import PrintInspectionModal from "@/components/pdf/PrintInspectionModal";
import PrintAllReportsModal from "@/components/pdf/PrintAllReportsModal";

interface InspectionItem {
  itemId: string;
  category: string;
  condition: string;
}

interface VehicleInspection {
  _id: string;
  jobCardId: {
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
  items: InspectionItem[];
  recommendations: string;
  nextInspectionDate: string;
  nextInspectionMonths: number;
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

  // Print modal state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedJobCard, setSelectedJobCard] = useState<any>(null);

  // Print Reports - all three modals
  const [showAllPrintModals, setShowAllPrintModals] = useState(false);
  const [estimateData, setEstimateData] = useState<any>(null);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loadingReports, setLoadingReports] = useState(false);

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
        router.push("/inspections");
      }
    } catch (error) {
      router.push("/inspections");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!inspection) return;

    setGeneratingPDF(true);
    try {
      // Fetch job card data for printing
      const response = await fetch(`/api/inspections/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedJobCard(data.jobCardId);
        setShowPrintModal(true);
      } else {
        alert(t("inspections.failed_to_generate_pdf"));
      }
    } catch (error) {
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
        alert(t("inspections.failed_to_delete"));
      }
    } catch (error) {
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

        // Trigger automation when status changes to "completed"
        if (newStatus === "completed") {
          try {
            // Get inspection items that need repair (fair, poor, or critical condition)
            const itemsNeedingRepair = inspection.items.filter((item: any) =>
              item.condition === 'fair' || item.condition === 'poor' || item.condition === 'critical'
            );


            if (itemsNeedingRepair.length === 0) {
              alert('Inspection completed, but no items need repair. Estimate and invoice not generated.');
              return;
            }

            // 1. Auto-generate estimate from inspection with selected items
            const estimateResponse = await fetch('/api/estimates/from-inspection', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                inspectionId: id,
                selectedItems: itemsNeedingRepair
              }),
            });

            if (!estimateResponse.ok) {
              const errorData = await estimateResponse.json();
              throw new Error(`Failed to create estimate: ${JSON.stringify(errorData)}`);
            }

            const estimateData = await estimateResponse.json();

            // 2. Auto-generate invoice from inspection job card AS IS (just inspection fee)
            // The estimate is saved for later use when creating a repair job card
            const invoiceResponse = await fetch('/api/invoices', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jobCardId: inspection.jobCardId._id,
                autoCloseJobCard: false // Don't close job card yet
              }),
            });

            if (!invoiceResponse.ok) {
              const errorData = await invoiceResponse.json();
              throw new Error(`Failed to create invoice: ${JSON.stringify(errorData)}`);
            }

            const invoiceData = await invoiceResponse.json();

            // 3. Send WhatsApp notification
            try {
              await fetch('/api/whatsapp/inspection-completed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  customerId: inspection.jobCardId.customerId._id,
                  vehicleMake: inspection.jobCardId.vehicleId.make,
                  vehicleModel: inspection.jobCardId.vehicleId.model,
                  itemsChecked: inspection.items.length,
                  itemsNeedingAttention: itemsNeedingRepair.length,
                  inspectionFee: invoiceData.invoice.totalAmount,
                  invoiceNumber: invoiceData.invoice.invoiceNumber,
                  estimateTotal: estimateData.estimate.total,
                  serviceCount: estimateData.estimate.services.length
                }),
              });
            } catch (whatsappError) {
              // Don't fail the whole automation if WhatsApp fails
            }

            alert('Inspection completed! Estimate and invoice generated successfully. WhatsApp notification sent to customer. Click "Print Reports" to review and print.');
          } catch (autoError) {
            alert(`Inspection marked as completed, but automation failed: ${autoError instanceof Error ? autoError.message : 'Unknown error'}. Please check the console for details.`);
          }
        }
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
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

  const handlePrintAllReports = async () => {
    if (!inspection || inspection.status !== 'completed') {
      alert('Inspection must be completed before printing reports');
      return;
    }

    setLoadingReports(true);
    try {
      // Fetch the estimate generated for this inspection
      const estimatesResponse = await fetch(`/api/estimates?inspectionId=${id}`);
      if (!estimatesResponse.ok) throw new Error('Failed to fetch estimate');
      const estimatesData = await estimatesResponse.json();
      const estimate = estimatesData.estimates?.[0] || estimatesData[0];

      // Fetch the invoice generated for this job card
      const invoicesResponse = await fetch(`/api/invoices?jobCardId=${inspection.jobCardId._id}`);
      if (!invoicesResponse.ok) throw new Error('Failed to fetch invoice');
      const invoicesData = await invoicesResponse.json();
      const invoice = invoicesData.invoices?.[0] || invoicesData[0];

      if (!estimate || !invoice) {
        alert('Estimate or invoice not found. Please ensure the automation completed successfully.');
        return;
      }

      // Fetch full details with populated data
      const [estimateDetail, invoiceDetail] = await Promise.all([
        fetch(`/api/estimates/${estimate._id}`).then(r => r.json()),
        fetch(`/api/invoices/${invoice._id}/view`).then(r => r.json())
      ]);

      setEstimateData(estimateDetail);
      setInvoiceData(invoiceDetail);
      setSelectedJobCard(inspection.jobCardId);
      setShowAllPrintModals(true);
    } catch (error) {
      alert('Failed to load reports. Please try again.');
    } finally {
      setLoadingReports(false);
    }
  };

  const handleClosePrintReports = async () => {
    // Close all modals
    setShowAllPrintModals(false);
    setEstimateData(null);
    setInvoiceData(null);

    // Close the job card
    if (inspection?.jobCardId?._id) {
      try {
        const response = await fetch(`/api/job-cards/${inspection.jobCardId._id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed' }),
        });

        if (response.ok) {
          alert('Reports printed successfully! Job card has been closed.');
          // Redirect to job cards page or inspections list
          router.push('/inspections');
        } else {
          alert('Reports printed, but failed to close job card. Please close it manually.');
        }
      } catch (error) {
        alert('Reports printed, but failed to close job card. Please close it manually.');
      }
    }
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
            <ArrowLeft className="me-2 h-5 w-5" />
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
                  {inspection.jobCardId?.vehicleId?.make} {inspection.jobCardId?.vehicleId?.model} - {formatDate(inspection.inspectionDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {inspection.status === 'completed' && (
                <button
                  onClick={handlePrintAllReports}
                  disabled={loadingReports}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-xl transition-all duration-300 font-medium disabled:opacity-50"
                >
                  <Download className="me-2 h-4 w-4" />
                  {loadingReports ? 'Loading...' : 'Print Reports'}
                </button>
              )}
              <button
                onClick={generatePDF}
                disabled={generatingPDF}
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300 font-medium"
              >
                <Download className="me-2 h-4 w-4" />
                {generatingPDF ? t("inspections.generating_pdf") : t("inspections.generate_pdf")}
              </button>
              <Link
                href={`/inspections/${id}/edit`}
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300 font-medium"
              >
                <Edit className="me-2 h-4 w-4" />
                {t("forms.edit")}
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-300 font-medium"
              >
                <Trash2 className="me-2 h-4 w-4" />
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
                    <div className="p-3 bg-[#F13F33]/10 rounded-xl me-4">
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
                      <p className="text-sm text-gray-500">Next Inspection</p>
                      <p className="font-semibold text-gray-900">
                        {inspection.nextInspectionDate ? formatDate(inspection.nextInspectionDate) : 'Not set'}
                        {inspection.nextInspectionMonths && ` (${inspection.nextInspectionMonths} months)`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-blue-100 rounded-xl me-4">
                    <Car className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Vehicle Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Make & Model</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {inspection.jobCardId?.vehicleId?.make} {inspection.jobCardId?.vehicleId?.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Year</p>
                    <p className="text-lg font-semibold text-gray-900">{inspection.jobCardId?.vehicleId?.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">License Plate</p>
                    <p className="text-lg font-semibold text-gray-900">{inspection.jobCardId?.vehicleId?.licensePlate}</p>
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
                  <div className="p-3 bg-green-100 rounded-xl me-4">
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
                    <div className="p-3 bg-yellow-100 rounded-xl me-4">
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
                  <div className="p-3 bg-purple-100 rounded-xl me-4">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Customer</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-semibold text-gray-900">
                      {inspection.jobCardId?.customerId?.firstName} {inspection.jobCardId?.customerId?.lastName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mechanic Information */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-orange-100 rounded-xl me-4">
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
                    <div className="p-3 bg-indigo-100 rounded-xl me-4">
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
                    <div className="p-3 bg-teal-100 rounded-xl me-4">
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

      {/* Single Print Inspection Modal */}
      {inspection && (
        <PrintInspectionModal
          isOpen={showPrintModal}
          onClose={() => {
            setShowPrintModal(false);
            setSelectedJobCard(null);
          }}
          inspection={inspection}
          jobCard={selectedJobCard}
          language={'ar'}
        />
      )}

      {/* Print All Reports Modal - Unified View */}
      {showAllPrintModals && inspection && estimateData && invoiceData && (
        <PrintAllReportsModal
          isOpen={showAllPrintModals}
          onClose={handleClosePrintReports}
          inspection={inspection}
          estimate={estimateData}
          invoice={invoiceData.invoice}
          jobCard={selectedJobCard || invoiceData.jobCard}
          language={'ar'}
        />
      )}
    </div>
  );
}
