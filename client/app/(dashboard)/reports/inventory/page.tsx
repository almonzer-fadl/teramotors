'use client'

import { useState, useEffect } from 'react';
import { ArrowLeft, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InventoryReport {
  totalParts: number;
  totalStockQuantity: number;
  totalStockValue: number;
  lowStockParts: any[];
  parts: any[];
}

export default function InventoryReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await fetch('/api/reports/inventory');
        if (response.ok) {
          const data = await response.json();
          setReport(data.data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F13F33] mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load report</h2>
          <p className="text-gray-600">There was an error loading the inventory report.</p>
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
              <button 
                onClick={() => router.back()} 
                className="me-6 p-3 text-gray-400 hover:text-[#F13F33] transition-all duration-300 rounded-2xl hover:bg-gray-100 group"
              >
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Inventory Report
                </h1>
                <p className="mt-3 text-xl text-gray-600">
                  Comprehensive inventory analysis and stock management
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div className="ms-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Parts</h3>
                <p className="text-3xl font-bold text-gray-900">{report.totalParts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div className="ms-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Stock Quantity</h3>
                <p className="text-3xl font-bold text-gray-900">{report.totalStockQuantity}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div className="ms-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Stock Value</h3>
                <p className="text-3xl font-bold text-gray-900">${report.totalStockValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Parts Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden mt-12">
          <div className="px-8 py-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center me-4">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Low Stock Parts</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Part Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Part Number</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Min Stock Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {report.lowStockParts.map((part) => (
                    <tr key={part._id} className="bg-white/50 hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{part.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{part.partNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-500">{part.stockQuantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{part.minStockLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* All Parts Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden mt-12">
          <div className="px-8 py-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#063479] to-[#052a5f] rounded-2xl flex items-center justify-center me-4">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">All Parts</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Part Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Part Number</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {report.parts.map((part) => (
                    <tr key={part._id} className="bg-white/50 hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{part.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{part.partNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{part.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{part.stockQuantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${part.stockValue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
