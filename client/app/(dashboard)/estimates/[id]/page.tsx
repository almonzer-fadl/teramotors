'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Download, Trash2, Calendar, User, Car, FileText, DollarSign, CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import PrintEstimateModal from '@/components/pdf/PrintEstimateModal';

interface Estimate {
  _id: string;
  inspectionId?: {
    _id: string;
    inspectionDate: string;
    overallCondition: string;
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
  mechanicId?: {
    _id: string;
    firstName: string;
    lastName: string;
    displayName: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  services: Array<{
    name: string;
    serviceId?: {
      _id: string;
      name: string;
    };
    quantity: number;
    laborCost: number;
    partsCost: number;
    totalCost: number;
  }>;
  parts: Array<{
    name: string;
    partId?: {
      _id: string;
      name: string;
      partNumber: string;
    };
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export default function EstimateDetailPage() {
  const { t } = useTranslation('common');
  const params = useParams();
  const router = useRouter();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Print modal state
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchEstimate();
    }
  }, [params.id]);

  const fetchEstimate = async () => {
    try {
      const response = await fetch(`/api/estimates/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setEstimate(data);
      } else {
        console.error(t('estimates.failed_to_fetch'));
        router.push('/estimates');
      }
    } catch (error) {
      console.error(t('estimates.error_fetching'), error);
      router.push('/estimates');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!estimate) return;

    setGeneratingPDF(true);
    try {
      // Show print modal with estimate data
      setShowPrintModal(true);
    } catch (error) {
      console.error(t('estimates.error_generating_pdf'), error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const deleteEstimate = async () => {
    if (!estimate) return;
    
    if (!confirm(t('estimates.delete_confirmation'))) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/estimates/${estimate._id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.push('/estimates');
      } else {
        console.error(t('estimates.failed_to_delete'));
      }
    } catch (error) {
      console.error(t('estimates.error_deleting'), error);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F97402] border-t-transparent"></div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{t('estimates.loading_estimate')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Estimate Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">The estimate you're looking for doesn't exist.</p>
          <Link
            href="/estimates"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white font-bold rounded-xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <ArrowLeft className="me-2 h-5 w-5" />
            {t('estimates.back_to_estimates')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  href="/estimates"
                  className="me-6 p-3 text-gray-600 dark:text-gray-400 hover:text-[#F97402] transition-all duration-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group"
                >
                  <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    {t('estimates.estimate_details')}
                  </h1>
                  <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                    {t('estimates.estimate_number', { number: estimate._id.toString().slice(-8) })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={generatePDF}
                  disabled={generatingPDF}
                  className="inline-flex items-center px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#F97402] hover:text-[#F97402] hover:bg-[#F97402]/5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                >
                  <Download className="me-2 h-5 w-5" />
                  {generatingPDF ? t('estimates.generating') : t('estimates.generate_pdf')}
                </button>
                <Link
                  href={`/estimates/${estimate._id}/edit`}
                  className="inline-flex items-center px-4 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#F97402] hover:text-[#F97402] hover:bg-[#F97402]/5 rounded-xl font-semibold text-sm transition-all duration-200"
                >
                  <Edit className="me-2 h-5 w-5" />
                  {t('estimates.edit')}
                </Link>
                <button
                  onClick={deleteEstimate}
                  disabled={deleting}
                  className="inline-flex items-center px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                >
                  <Trash2 className="me-2 h-5 w-5" />
                  {deleting ? t('estimates.deleting') : t('estimates.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status and Basic Info */}
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 sm:px-8 py-8">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center me-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                      {t('estimates.estimate_information')}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(estimate.status)}
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${getStatusColor(estimate.status)} dark:${getStatusColor(estimate.status)}`}>
                      {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      {t('estimates.valid_until')}
                    </label>
                    <div className="flex items-center space-x-3 text-gray-900 dark:text-white">
                      <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <p className="text-base font-semibold">
                        {new Date(estimate.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      {t('estimates.total_amount')}
                    </label>
                    <div className="flex items-center space-x-3 text-gray-900 dark:text-white">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <p className="text-base font-semibold">${estimate.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            {estimate.services.length > 0 && (
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-6 sm:px-8 py-8">
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#F97402] to-[#F13F33] rounded-2xl flex items-center justify-center me-4">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                      {t('estimates.services')}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {estimate.services.map((service, index) => (
                      <div key={index} className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{service.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {t('estimates.quantity')}: {service.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white text-lg">${service.totalCost.toFixed(2)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {t('estimates.labor')}: ${service.laborCost.toFixed(2)} | {t('estimates.parts')}: ${service.partsCost.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Parts */}
            {estimate.parts.length > 0 && (
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-6 sm:px-8 py-8">
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center me-4">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                      {t('estimates.parts')}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {estimate.parts.map((part, index) => (
                      <div key={index} className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{part.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {t('estimates.quantity')}: {part.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white text-lg">${part.totalCost.toFixed(2)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {t('estimates.unit_cost')}: ${part.unitCost.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {estimate.notes && (
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-6 sm:px-8 py-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center me-4">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                      {t('estimates.notes')}
                    </h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{estimate.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Customer & Vehicle */}
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 sm:px-8 py-8">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center me-4">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                    {t('estimates.customer_vehicle')}
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      {t('estimates.customer')}
                    </label>
                    <div className="flex items-center space-x-3 text-gray-900 dark:text-white">
                      <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <p className="text-base font-semibold">
                        {estimate.customerId.firstName} {estimate.customerId.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      {t('estimates.vehicle')}
                    </label>
                    <div className="flex items-center space-x-3">
                      <Car className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      <div>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {estimate.vehicleId.year} {estimate.vehicleId.make} {estimate.vehicleId.model}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{estimate.vehicleId.licensePlate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 sm:px-8 py-8">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center me-4">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                    {t('estimates.summary')}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{t('estimates.subtotal')}:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">${estimate.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{t('estimates.tax')} (15%):</span>
                    <span className="font-semibold text-gray-900 dark:text-white">${estimate.tax.toFixed(2)}</span>
                  </div>
                  <div className="pt-4">
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#F97402]/10 to-[#F13F33]/10 dark:from-[#F97402]/20 dark:to-[#F13F33]/20 rounded-2xl">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{t('estimates.total')}:</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-[#F97402] to-[#F13F33] bg-clip-text text-transparent">
                        ${estimate.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Modal */}
      {estimate && (
        <PrintEstimateModal
          isOpen={showPrintModal}
          onClose={() => {
            setShowPrintModal(false);
          }}
          estimate={estimate}
          language={'ar'}
        />
      )}
    </div>
  );
}
