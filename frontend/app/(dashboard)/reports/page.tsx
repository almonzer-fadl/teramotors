'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Users, Car, Calendar, Package, FileText, Download } from 'lucide-react'
import Chart from '@/components/dashboard/Chart'

interface ReportData {
  revenue: {
    monthly: Array<{ month: string, revenue: number }>
    daily: Array<{ date: string, revenue: number }>
  }
  customers: {
    total: number
    newThisMonth: number
    growth: number
  }
  vehicles: {
    total: number
    servicedThisMonth: number
  }
  appointments: {
    total: number
    completed: number
    cancelled: number
    thisMonth: number
  }
  inventory: {
    totalParts: number
    lowStock: number
    outOfStock: number
    totalValue: number
  }
  services: {
    popular: Array<{ name: string, count: number }>
    revenue: Array<{ name: string, revenue: number }>
  }
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/reports?range=${dateRange}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportData()
  }, [dateRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No report data available</h3>
        <p className="mt-1 text-sm text-gray-500">Unable to load report data at this time.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive business insights and performance metrics.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${reportData.revenue.monthly.reduce((sum, item) => sum + item.revenue, 0).toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                  <dd className="text-lg font-medium text-gray-900">{reportData.customers.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Car className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Vehicles Serviced</dt>
                  <dd className="text-lg font-medium text-gray-900">{reportData.vehicles.servicedThisMonth}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Appointments</dt>
                  <dd className="text-lg font-medium text-gray-900">{reportData.appointments.thisMonth}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
          <Chart type="line" data={reportData.revenue.daily} dataKey="revenue" category="date" />
        </div>

        {/* Popular Services */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Services</h3>
          <Chart type="bar" data={reportData.services.popular} dataKey="count" category="name" />
        </div>

        {/* Service Revenue */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Service Revenue</h3>
          <Chart type="pie" data={reportData.services.revenue} dataKey="revenue" category="name" />
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue</h3>
          <Chart type="bar" data={reportData.revenue.monthly} dataKey="revenue" category="month" colors={['#82ca9d']} />
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer Growth */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Growth</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">New This Month</span>
              <span className="text-sm font-medium text-gray-900">{reportData.customers.newThisMonth}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Growth Rate</span>
              <span className={`text-sm font-medium ${reportData.customers.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reportData.customers.growth > 0 ? '+' : ''}{reportData.customers.growth}%
              </span>
            </div>
          </div>
        </div>

        {/* Appointment Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Appointment Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Completed</span>
              <span className="text-sm font-medium text-gray-900">{reportData.appointments.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Cancelled</span>
              <span className="text-sm font-medium text-gray-900">{reportData.appointments.cancelled}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Completion Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {reportData.appointments.total > 0 
                  ? ((reportData.appointments.completed / reportData.appointments.total) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Parts</span>
              <span className="text-sm font-medium text-gray-900">{reportData.inventory.totalParts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Low Stock</span>
              <span className="text-sm font-medium text-yellow-600">{reportData.inventory.lowStock}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Out of Stock</span>
              <span className="text-sm font-medium text-red-600">{reportData.inventory.outOfStock}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Value</span>
              <span className="text-sm font-medium text-gray-900">${reportData.inventory.totalValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
