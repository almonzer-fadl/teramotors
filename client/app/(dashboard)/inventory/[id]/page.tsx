'use client'

import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Package, DollarSign, Box, MapPin, Truck, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface Part {
  _id: string;
  name: string;
  description: string;
  category: string;
  manufacturer: string;
  cost: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  location: string;
  partNumber: string;
  uniqueCode?: string;
  compatibleVehicles: { make: string; model: string; year: number }[];
}

interface JobCard {
  _id: string;
  customerId: { firstName: string; lastName: string };
  vehicleId: { make: string; model: string; year: number };
  createdAt: string;
}

export default function PartDetailsPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [part, setPart] = useState<Part | null>(null);
  const [usage, setUsage] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      try {
        const [partRes, usageRes] = await Promise.all([
          fetch(`/api/parts/${id}`),
          fetch(`/api/parts/${id}/usage`),
        ]);

        if (partRes.ok) {
          const partData = await partRes.json();
          setPart(partData);
        }

        if (usageRes.ok) {
          const usageData = await usageRes.json();
          setUsage(usageData.data);
        }
      } catch (error) {
        console.error('Failed to fetch part data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97402] mx-auto"></div>
          <p className="mt-4 text-base text-gray-700 dark:text-gray-300">Loading part details...</p>
        </div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Part not found</h2>
          <Link href="/inventory" className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg hover:scale-[1.02] transition-all duration-200">
            <ArrowLeft className="me-2 h-5 w-5" />
            Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  const stockStatus = part.stockQuantity <= part.minStockLevel ? 'low' : 'healthy';
  const profitMargin = ((part.sellingPrice - part.cost) / part.cost * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="mr-6 p-3 text-gray-600 dark:text-gray-400 hover:text-[#F97402] transition-all duration-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group"
                >
                  <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    {part.name}
                  </h1>
                  <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                    {part.partNumber && `Part #${part.partNumber}`}
                    {part.uniqueCode && ` • Code: ${part.uniqueCode}`}
                  </p>
                </div>
              </div>
              <Link
                href={`/inventory/edit/${part._id}`}
                className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Edit className="me-2 h-5 w-5" />
                Edit Part
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Part Details */}
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 sm:px-8 py-8">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F97402] to-[#F13F33] rounded-2xl flex items-center justify-center mr-4">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                    Part Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {part.description && (
                    <div className="md:col-span-2 space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Description</p>
                      <p className="text-base text-gray-900 dark:text-white">{part.description}</p>
                    </div>
                  )}
                  {part.category && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Category</p>
                      <p className="text-base text-gray-900 dark:text-white">{part.category}</p>
                    </div>
                  )}
                  {part.manufacturer && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Manufacturer</p>
                      <p className="text-base text-gray-900 dark:text-white">{part.manufacturer}</p>
                    </div>
                  )}
                  {part.location && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Location</p>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 me-2" />
                        <p className="text-base text-gray-900 dark:text-white">{part.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Compatible Vehicles */}
            {part.compatibleVehicles && part.compatibleVehicles.length > 0 && (
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-6 sm:px-8 py-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                      Compatible Vehicles
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {part.compatibleVehicles.map((v, i) => (
                      <div key={i} className="px-4 py-3 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="text-base text-gray-900 dark:text-white font-medium">
                          {v.make} {v.model} <span className="text-gray-600 dark:text-gray-400">({v.year})</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Usage History */}
            {usage && usage.length > 0 && (
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-6 sm:px-8 py-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                      Usage History
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Job Card</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Vehicle</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {usage.map((job) => (
                          <tr key={job._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="py-3 px-4">
                              <Link href={`/job-cards/${job._id}`} className="text-[#F97402] hover:text-[#F13F33] font-medium transition-colors">
                                {job._id.slice(-8).toUpperCase()}
                              </Link>
                            </td>
                            <td className="py-3 px-4 text-gray-900 dark:text-white">{job.customerId.firstName} {job.customerId.lastName}</td>
                            <td className="py-3 px-4 text-gray-900 dark:text-white">{job.vehicleId.make} {job.vehicleId.model} ({job.vehicleId.year})</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{new Date(job.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Stock Status */}
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-6">
                <div className="flex items-center mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 ${
                    stockStatus === 'low'
                      ? 'bg-gradient-to-br from-red-500 to-red-600'
                      : 'bg-gradient-to-br from-green-500 to-green-600'
                  }`}>
                    <Box className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Stock Status
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Stock</p>
                    <p className={`text-4xl font-bold ${
                      stockStatus === 'low' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {part.stockQuantity}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Minimum Level</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{part.minStockLevel}</p>
                  </div>
                  {stockStatus === 'low' && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <p className="text-sm text-red-800 dark:text-red-400 font-medium text-center">
                        ⚠️ Low Stock Alert
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F97402] to-[#F13F33] rounded-2xl flex items-center justify-center mr-4">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Pricing
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Cost</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">${part.cost.toFixed(2)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Selling Price</p>
                    <p className="text-2xl font-bold text-[#F97402]">${part.sellingPrice.toFixed(2)}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Profit Margin</span>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-600 me-1" />
                        <span className="text-lg font-bold text-green-600">{profitMargin}%</span>
                      </div>
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
