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
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
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
          <h3 className="text-lg font-medium text-gray-900">{t('reports.access_denied')}</h3>
          <p className="text-gray-500">{t('reports.access_denied_description')}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2 text-gray-500">{t('reports.loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {t('reports.title')}
                </h1>
                <p className="mt-3 text-xl text-gray-600">{t('reports.description')}</p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-6 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                >
                  <option value="7">{t('reports.last_7_days')}</option>
                  <option value="30">{t('reports.last_30_days')}</option>
                  <option value="90">{t('reports.last_90_days')}</option>
                  <option value="365">{t('reports.last_year')}</option>
                </select>
                <button
                  onClick={() => handleExportReport('pdf')}
                  className="group inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:shadow-xl hover:shadow-red-600/25 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Download className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  {t('reports.export_pdf')}
                </button>
                <button
                  onClick={() => handleExportReport('excel')}
                  className="group inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-green-600 to-green-700 hover:shadow-xl hover:shadow-green-600/25 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Download className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  {t('reports.export_excel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12">

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('reports.total_customers')}</p>
                <p className="text-3xl font-bold text-gray-900">{reportData?.totalCustomers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('reports.total_vehicles')}</p>
                <p className="text-3xl font-bold text-gray-900">{reportData?.totalVehicles || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('reports.total_appointments')}</p>
                <p className="text-3xl font-bold text-gray-900">{reportData?.totalAppointments || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('reports.total_revenue')}</p>
                <p className="text-3xl font-bold text-gray-900">${reportData?.totalRevenue?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {/* Revenue Chart */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mr-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t('reports.monthly_revenue')}</h3>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {reportData?.monthlyRevenue?.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="bg-gradient-to-t from-[#F13F33] to-[#d6352a] rounded-t-2xl w-8 mb-2 shadow-lg"
                    style={{ height: `${(item.revenue / Math.max(...(reportData?.monthlyRevenue?.map(r => r.revenue) || [1])) * 200)}px` }}
                  ></div>
                  <span className="text-xs font-bold text-gray-500">{item.month}</span>
                  <span className="text-xs font-bold text-gray-900">${item.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Services */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t('reports.top_services')}</h3>
              </div>
            </div>
            <div className="space-y-4">
              {reportData?.topServices?.slice(0, 5).map((service, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl hover:bg-gray-100/80 transition-colors">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gradient-to-r from-[#F13F33] to-[#d6352a] rounded-full mr-4"></div>
                    <span className="text-sm font-bold text-gray-900">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">${service.revenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{t('reports.jobs')}: {service.count}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Reports */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden mt-12">
          <div className="px-8 py-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#063479] to-[#052a5f] rounded-2xl flex items-center justify-center mr-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{t('reports.detailed_reports')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50/80 rounded-2xl p-6 hover:bg-gray-100/80 cursor-pointer transition-all duration-300 hover:shadow-lg group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{t('reports.customer_report')}</h4>
                    <p className="text-sm text-gray-600">{t('reports.customer_report_desc')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50/80 rounded-2xl p-6 hover:bg-gray-100/80 cursor-pointer transition-all duration-300 hover:shadow-lg group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Car className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{t('reports.vehicle_report')}</h4>
                    <p className="text-sm text-gray-600">{t('reports.vehicle_report_desc')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50/80 rounded-2xl p-6 hover:bg-gray-100/80 cursor-pointer transition-all duration-300 hover:shadow-lg group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{t('reports.inventory_report')}</h4>
                    <p className="text-sm text-gray-600">{t('reports.inventory_report_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}