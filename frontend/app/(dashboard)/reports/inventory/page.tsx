
'use client'

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
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
        console.error('Failed to fetch inventory report:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!report) {
    return <div>Failed to load report.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button onClick={() => router.back()} className="mr-4 p-2 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Report</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Parts</h3>
          <p className="text-3xl font-bold">{report.totalParts}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Stock Quantity</h3>
          <p className="text-3xl font-bold">{report.totalStockQuantity}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Stock Value</h3>
          <p className="text-3xl font-bold">${report.totalStockValue.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Low Stock Parts</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stock Level</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {report.lowStockParts.map((part) => (
              <tr key={part._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{part.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.partNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">{part.stockQuantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.minStockLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">All Parts</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Value</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {report.parts.map((part) => (
              <tr key={part._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{part.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.partNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.stockQuantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${part.stockValue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
