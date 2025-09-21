'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Eye, Clock, User, Car, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface JobCard {
  _id: string
  appointmentId: {
    _id: string
    appointmentDate: string
    startTime: string
    endTime: string
  }
  customerId: {
    _id: string
    firstName: string
    lastName: string
  }
  vehicleId: {
    _id: string
    make: string
    model: string
    year: number
    licensePlate: string
  }
  mechanicId: {
    _id: string
    fullName: string
  }
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedStartTime: string
  estimatedEndTime: string
  actualStartTime?: string
  actualEndTime?: string
  laborHours: number
  notes?: string
  createdAt: string
}

export default function JobCardsPage() {
  const [jobCards, setJobCards] = useState<JobCard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchJobCards()
  }, [])

  const fetchJobCards = async () => {
    try {
      const response = await fetch('/api/job-cards')
      if (response.ok) {
        const data = await response.json()
        setJobCards(data)
      }
    } catch (error) {
      console.error('Failed to fetch job cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobCards = jobCards.filter(jobCard => {
    const matchesSearch = 
      `${jobCard.customerId.firstName} ${jobCard.customerId.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${jobCard.vehicleId.year} ${jobCard.vehicleId.make} ${jobCard.vehicleId.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobCard.vehicleId.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jobCard.mechanicId.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || jobCard.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/job-cards/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const updatedJobCard = await response.json();
        setJobCards(jobCards.map(jc => jc._id === id ? { ...jc, status: updatedJobCard.jobCard.status } : jc));
      }
    } catch (error) {
      console.error('Failed to update job card status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Cards</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track work orders and job progress.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/job-cards/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Job Card
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search job cards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {filteredJobCards.length} job card{filteredJobCards.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredJobCards.map((jobCard) => (
          <div key={jobCard._id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getStatusIcon(jobCard.status)}
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(jobCard.status)}`}>
                    {jobCard.status.replace('-', ' ')}
                  </span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(jobCard.priority)}`}>
                  {jobCard.priority}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {jobCard.customerId.firstName} {jobCard.customerId.lastName}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Car className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {jobCard.vehicleId.year} {jobCard.vehicleId.make} {jobCard.vehicleId.model}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {new Date(jobCard.appointmentId.appointmentDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {jobCard.appointmentId.startTime} - {jobCard.appointmentId.endTime}
                  </span>
                </div>

                <div className="text-sm text-gray-500">
                  <strong>Mechanic:</strong> {jobCard.mechanicId.fullName}
                </div>

                <div className="text-sm text-gray-500">
                  <strong>Labor Hours:</strong> {jobCard.laborHours}h
                </div>

                {jobCard.notes && (
                  <div className="text-sm text-gray-500">
                    <strong>Notes:</strong> {jobCard.notes}
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <Link
                  href={`/job-cards/${jobCard._id}`}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Link>
                <Link
                  href={`/job-cards/${jobCard._id}/edit`}
                  className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Link>
                <select
                  value={jobCard.status}
                  onChange={(e) => handleStatusChange(jobCard._id, e.target.value)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobCards.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No job cards found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filter terms.' : 'Get started by creating your first job card.'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <div className="mt-6">
              <Link
                href="/job-cards/new"
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Job Card
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
