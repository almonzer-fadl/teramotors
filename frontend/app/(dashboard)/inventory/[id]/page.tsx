
'use client'

import { useState, useEffect } from 'react';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  compatibleVehicles: { make: string; model: string; year: number }[];
}

interface JobCard {
  _id: string;
  customerId: { firstName: string; lastName: string };
  vehicleId: { make: string; model: string; year: number };
  createdAt: string;
}

export default function PartDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [part, setPart] = useState<Part | null>(null);
  const [usage, setUsage] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [partRes, usageRes] = await Promise.all([
          fetch(`/api/parts/${params.id}`),
          fetch(`/api/parts/${params.id}/usage`),
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
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!part) {
    return <div>Part not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="mr-4 p-2 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{part.name}</h1>
            <p className="mt-1 text-sm text-gray-500">Part Number: {part.partNumber}</p>
          </div>
        </div>
        <Link href={`/inventory/edit/${part._id}`} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
          <Edit className="mr-2 h-4 w-4" />
          Edit Part
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Part Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><span className="font-medium">Description:</span> {part.description}</div>
          <div><span className="font-medium">Category:</span> {part.category}</div>
          <div><span className="font-medium">Manufacturer:</span> {part.manufacturer}</div>
          <div><span className="font-medium">Cost:</span> ${part.cost.toFixed(2)}</div>
          <div><span className="font-medium">Selling Price:</span> ${part.sellingPrice.toFixed(2)}</div>
          <div><span className="font-medium">Stock Quantity:</span> {part.stockQuantity}</div>
          <div><span className="font-medium">Min Stock Level:</span> {part.minStockLevel}</div>
          <div><span className="font-medium">Location:</span> {part.location}</div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Compatible Vehicles</h3>
        <ul>
          {part.compatibleVehicles.map((v, i) => (
            <li key={i}>{v.make} {v.model} ({v.year})</li>
          ))}
        </ul>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Usage History</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Card ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usage.map((job) => (
              <tr key={job._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <Link href={`/job-cards/${job._id}`} className="text-blue-600 hover:text-blue-900">
                    {job._id}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.customerId.firstName} {job.customerId.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.vehicleId.make} {job.vehicleId.model} ({job.vehicleId.year})</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
