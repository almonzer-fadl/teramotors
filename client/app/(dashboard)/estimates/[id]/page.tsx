'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import EstimateDocument from '@/components/pdf/EstimateDocument'

interface Estimate {
  _id: string
  customerId: { firstName: string; lastName: string; email: string; phone: string }
  vehicleId: { make: string; model: string; year: number; licensePlate: string }
  services: { serviceId: { name: string }; quantity: number; laborCost: number; partsCost: number; totalCost: number }[]
  subtotal: number
  tax: number
  total: number
  notes: string
  createdAt: string
  validUntil: string
}

export default function EstimateDetailsPage() {
  const params = useParams()
  const { id } = params
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchEstimate()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchEstimate = async () => {
    try {
      const response = await fetch(`/api/estimates/${id}`)
      if (response.ok) {
        setEstimate(await response.json())
      }
    } catch (error) {
      console.error('Failed to fetch estimate:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
  }

  if (!estimate) {
    return <div className="flex justify-center items-center h-64"><div className="text-gray-500">Estimate not found</div></div>
  }

  const handleStatusChange = async (status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/estimates/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        const updatedEstimate = await response.json();
        setEstimate(updatedEstimate.estimate);
      }
    } catch (error) {
      console.error('Failed to update estimate status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/estimates" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Estimates
      </Link>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Estimate Details</h1>
          <div className="flex space-x-2">
            <button onClick={() => handleStatusChange('approved')} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
              Approve

            </button>
            <button onClick={() => handleStatusChange('rejected')} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
              Reject
            </button>
            <PDFDownloadLink document={<EstimateDocument estimate={estimate} />} fileName={`estimate-${estimate._id}.pdf`}>
              {({ blob, url, loading, error }) => 
                loading ? 'Loading document...' : <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"><FileText className="h-4 w-4 mr-2" />Download PDF</button>
              }
            </PDFDownloadLink>
          </div>
        </div>
        <div className="mt-6 border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Customer</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{estimate.customerId.firstName} {estimate.customerId.lastName}</dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Vehicle</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{estimate.vehicleId.year} {estimate.vehicleId.make} {estimate.vehicleId.model}</dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-gray-900">Total</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">${estimate.total.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}