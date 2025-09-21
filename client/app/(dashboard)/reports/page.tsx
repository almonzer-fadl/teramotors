'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/lib/hooks/useSession'
import { hasPermission } from '@/lib/roles'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Car, 
  Calendar, 
  Package,
  DollarSign,
  FileText,
  Download,
  Filter,
  Calendar as CalendarIcon
} from 'lucide-react'

interface ReportData {
  totalCustomers: number
  totalVehicles: number
  totalAppointments: number
  totalJobs: number
  totalRevenue: number
  totalParts: number
  monthlyRevenue: Array<{ month: string; revenue: number }>
  topServices: Array<{ name: string; count: number; revenue: number }>
  customerGrowth: Array<{ month: string; customers: number }>
}

export default function ReportsPage() {
  const { user } = useSession()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [reportType, setReportType] = useState('overview')

  // Check if user has admin permissions
  const userRole = (user as any)?.role || 'mechanic'
  const canAccessReports = hasPermission(userRole, 'canAccessReports')

  useEffect(() => {
    if (canAccessReports) {
      fetchReportData()
    }
  }, [canAccessReports, dateRange])

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/reports?range=${dateRange}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await fetch(`/api/reports/export?format=${format}&range=${dateRange}`, {
        method: 'POST',
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `report-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  if (!canAccessReports) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to access reports.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2 text-gray-500">Loading reports...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={() => handleExportReport('pdf')}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
          <button
            onClick={() => handleExportReport('excel')}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{reportData?.totalCustomers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Car className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{reportData?.totalVehicles || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{reportData?.totalAppointments || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${reportData?.totalRevenue?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Monthly Revenue</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {reportData?.monthlyRevenue?.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="bg-blue-500 rounded-t w-8 mb-2"
                  style={{ height: `${(item.revenue / Math.max(...(reportData?.monthlyRevenue?.map(r => r.revenue) || [1])) * 200)}px` }}
                ></div>
                <span className="text-xs text-gray-500">{item.month}</span>
                <span className="text-xs font-medium">${item.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Services</h3>
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            {reportData?.topServices?.slice(0, 5).map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">{service.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${service.revenue.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{service.count} jobs</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Detailed Reports</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <h4 className="font-medium">Customer Report</h4>
                  <p className="text-sm text-gray-500">Customer demographics and activity</p>
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <Car className="h-8 w-8 text-green-500" />
                <div>
                  <h4 className="font-medium">Vehicle Report</h4>
                  <p className="text-sm text-gray-500">Vehicle service history and trends</p>
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-purple-500" />
                <div>
                  <h4 className="font-medium">Inventory Report</h4>
                  <p className="text-sm text-gray-500">Parts usage and stock levels</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}