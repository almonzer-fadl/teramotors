'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ClipboardList, User, Car, Wrench, Clock } from 'lucide-react'

interface JobCard {
  _id: string;
  customer: {
    fullName: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
  };
  services: {
    service: {
      name: string;
    };
  }[];
  status: string;
  createdAt: string;
}

export default function JobCardGrid() {
  const [jobCards, setJobCards] = useState<JobCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobCards = async () => {
      try {
        const response = await fetch('/api/job-cards/recent')
        if (response.ok) {
          const data = await response.json()
          setJobCards(data)
        }
      } catch (error) {
        console.error('Failed to fetch recent job cards:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobCards()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="flex justify-between items-center mt-4">
              <div className="h-6 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (jobCards.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No Active Job Cards</h3>
        <p className="text-gray-500">There are no job cards with 'Created' or 'In Progress' status.</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Created':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobCards.map((jobCard) => (
        <Link href={`/job-cards/${jobCard._id}`} key={jobCard._id}>
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow h-full flex flex-col">
            <div className="flex-grow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-800 truncate">{jobCard.customer.fullName}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(jobCard.status)}`}>
                  {jobCard.status}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Car className="h-4 w-4 mr-2" />
                <span>{jobCard.vehicle.year} {jobCard.vehicle.make} {jobCard.vehicle.model}</span>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Services:</p>
                <ul className="list-disc list-inside">
                  {jobCard.services.slice(0, 2).map((service, index) => (
                    <li key={index} className="truncate">{service.service.name}</li>
                  ))}
                  {jobCard.services.length > 2 && (
                    <li className="text-xs text-gray-400">...and {jobCard.services.length - 2} more</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-end text-xs text-gray-400 mt-4">
              <Clock className="h-3 w-3 mr-1" />
              <span>{new Date(jobCard.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
