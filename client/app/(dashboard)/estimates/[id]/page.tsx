'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Download, Trash2, Calendar, User, Car, FileText, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

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
      // Get current language from i18n
      const currentLanguage = localStorage.getItem('i18nextLng') || 'en';
      // Open PDF in new tab for viewing with language parameter
      window.open(`/api/estimates/${estimate._id}/pdf?lang=${currentLanguage}`, '_blank');
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-lg text-gray-700">{t('estimates.loading_estimate')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Estimate Not Found</h1>
          <p className="text-gray-600 mb-6">The estimate you're looking for doesn't exist.</p>
          <Link
            href="/estimates"
            className="inline-flex items-center px-4 py-2 bg-[#F13F33] text-white font-bold rounded-xl hover:bg-[#E03A2F] transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
{t('estimates.back_to_estimates')}
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
                href="/estimates"
                className="p-2 text-gray-400 hover:text-[#F13F33] hover:bg-[#F13F33]/10 rounded-xl transition-all duration-300"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('estimates.estimate_details')}</h1>
                <p className="text-sm text-gray-500">{t('estimates.estimate_number', { number: estimate._id.toString().slice(-8) })}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={generatePDF}
                disabled={generatingPDF}
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300 font-medium disabled:opacity-50"
              >
                <Download className="mr-2 h-4 w-4" />
                {generatingPDF ? t('estimates.generating') : t('estimates.generate_pdf')}
              </button>
              <Link
                href={`/estimates/${estimate._id}/edit`}
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300 font-medium"
              >
                <Edit className="mr-2 h-4 w-4" />
                {t('estimates.edit')}
              </Link>
              <button
                onClick={deleteEstimate}
                disabled={deleting}
                className="inline-flex items-center px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-300 font-medium disabled:opacity-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting ? t('estimates.deleting') : t('estimates.delete')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status and Basic Info */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">{t('estimates.estimate_information')}</h2>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(estimate.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(estimate.status)}`}>
                      {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">{t('estimates.valid_until')}</p>
                      <p className="font-medium text-gray-900">
                        {new Date(estimate.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">{t('estimates.total_amount')}</p>
                      <p className="font-medium text-gray-900">${estimate.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            {estimate.services.length > 0 && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="px-6 py-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">{t('estimates.services')}</h2>
                  <div className="space-y-4">
                    {estimate.services.map((service, index) => (
                      <div key={index} className="bg-gray-50/80 rounded-xl p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{service.name}</h3>
                            <p className="text-sm text-gray-500">{t('estimates.quantity')}: {service.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">${service.totalCost.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">
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
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="px-6 py-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">{t('estimates.parts')}</h2>
                  <div className="space-y-4">
                    {estimate.parts.map((part, index) => (
                      <div key={index} className="bg-gray-50/80 rounded-xl p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{part.name}</h3>
                            <p className="text-sm text-gray-500">{t('estimates.quantity')}: {part.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">${part.totalCost.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">{t('estimates.unit_cost')}: ${part.unitCost.toFixed(2)}</p>
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
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                <div className="px-6 py-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{t('estimates.notes')}</h2>
                  <p className="text-gray-700">{estimate.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer & Vehicle */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="px-6 py-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('estimates.customer_vehicle')}</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">{t('estimates.customer')}</p>
                      <p className="font-medium text-gray-900">
                        {estimate.customerId.firstName} {estimate.customerId.lastName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Car className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">{t('estimates.vehicle')}</p>
                      <p className="font-medium text-gray-900">
                        {estimate.vehicleId.year} {estimate.vehicleId.make} {estimate.vehicleId.model}
                      </p>
                      <p className="text-sm text-gray-500">{estimate.vehicleId.licensePlate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="px-6 py-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('estimates.summary')}</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('estimates.subtotal')}:</span>
                    <span className="font-medium">${estimate.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('estimates.tax')} (15%):</span>
                    <span className="font-medium">${estimate.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">{t('estimates.total')}:</span>
                      <span className="text-lg font-bold text-[#F13F33]">${estimate.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}