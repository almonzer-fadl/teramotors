'use client'

import { useState, useEffect } from 'react'
import Pagination from '@/components/ui/Pagination'
import { useSession } from '@/lib/hooks/useSession'
import { hasPermission } from '@/lib/roles'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  FileText,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Calculator,
  Banknote
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ReportData {
  // Financial Summary
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  grossProfit: number
  profitMargin: number
  
  // Revenue Breakdown
  serviceRevenue: number
  partsRevenue: number
  laborRevenue: number
  otherRevenue: number
  
  // Payment Methods
  cashPayments: number
  cardPayments: number
  bankTransferPayments: number
  checkPayments: number
  
  // Monthly Data
  monthlyRevenue: Array<{ month: string; revenue: number; expenses: number; profit: number }>
  monthlyProfit: Array<{ month: string; profit: number; margin: number }>
  
  // Top Revenue Sources
  topServices: Array<{ name: string; revenue: number; count: number; avgPrice: number }>
  topCustomers: Array<{ name: string; revenue: number; jobs: number }>
  
  // Financial Health
  outstandingInvoices: number
  overdueInvoices: number
  averageInvoiceValue: number
  collectionRate: number
  
  // Growth Metrics
  revenueGrowth: number
  profitGrowth: number
  customerGrowth: number
}

export default function ReportsPage() {
  const { user } = useSession()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [reportType, setReportType] = useState('overview')
  const { t } = useTranslation()
  const [workLogs, setWorkLogs] = useState<any[]>([])
  const [logsPage, setLogsPage] = useState(1)
  const [logsLimit, setLogsLimit] = useState(30)
  const [logsTotal, setLogsTotal] = useState(0)
  const [filterRole, setFilterRole] = useState('')
  const [filterUserId, setFilterUserId] = useState('')
  const [filterJobCardIdEnds, setFilterJobCardIdEnds] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [filterMinDuration, setFilterMinDuration] = useState('')
  const [filterMaxDuration, setFilterMaxDuration] = useState('')
  // Check if user has admin permissions
  const userRole = (user as any)?.role || 'mechanic'
  const canAccessReports = hasPermission(userRole, 'canAccessReports')

  useEffect(() => {
    if (canAccessReports) {
      fetchReportData()
      fetchWorkLogs()
    }
  }, [canAccessReports, dateRange, logsPage, logsLimit])

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

  const fetchWorkLogs = async () => {
    try {
      const params = new URLSearchParams()
      params.set('page', String(logsPage))
      params.set('limit', String(logsLimit))
      if (filterRole) params.set('role', filterRole)
      if (filterUserId) params.set('userId', filterUserId)
      if (filterJobCardIdEnds) params.set('jobCardEndsWith', filterJobCardIdEnds)
      if (filterStartDate) params.set('startDate', filterStartDate)
      if (filterEndDate) params.set('endDate', filterEndDate)
      if (filterMinDuration) params.set('minDurationMs', String(Number(filterMinDuration) * 60000))
      if (filterMaxDuration) params.set('maxDurationMs', String(Number(filterMaxDuration) * 60000))
      const response = await fetch(`/api/reports/work-logs?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setWorkLogs(data.logs || [])
        if (data.pagination) setLogsTotal(data.pagination.totalCount || 0)
      }
    } catch (e) {
      // ignore
    }
  }

  const handleExportReport = async () => {
    try {
      const response = await fetch(`/api/reports/export?format=excel&range=${dateRange}`, {
        method: 'POST',
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `teramotors-report-${new Date().toISOString().split('T')[0]}.xlsx`
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
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t('reports.title')}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('reports.description')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="7">{t('reports.last_7_days')}</option>
              <option value="30">{t('reports.last_30_days')}</option>
              <option value="90">{t('reports.last_90_days')}</option>
              <option value="365">{t('reports.last_year')}</option>
            </select>
            <button
              onClick={handleExportReport}
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-colors"
            >
              <Download className="me-2 h-4 w-4" />
              {t('reports.export_excel')}
            </button>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('reports.total_revenue')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${(reportData?.totalRevenue || 0).toLocaleString()}
                    </dd>
                    <dd className="text-sm text-green-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 me-1" />
                      +{reportData?.revenueGrowth || 0}%
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
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('reports.net_profit')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${(reportData?.netProfit || 0).toLocaleString()}
                    </dd>
                    <dd className="text-sm text-blue-600 flex items-center">
                      <ArrowUpRight className="h-3 w-3 me-1" />
                      +{reportData?.profitGrowth || 0}%
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
                  <Calculator className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('reports.profit_margin')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {(reportData?.profitMargin || 0).toFixed(1)}%
                    </dd>
                    <dd className="text-sm text-gray-500">
                      {t('reports.margin')}
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
                  <Receipt className="h-6 w-6 text-orange-500" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('reports.outstanding_invoices')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${(reportData?.outstandingInvoices || 0).toLocaleString()}
                    </dd>
                    <dd className="text-sm text-red-600">
                      {reportData?.overdueInvoices || 0} {t('reports.overdue')}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Sources */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{t('reports.revenue_breakdown')}</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full me-3"></div>
                    <span className="text-sm font-medium text-gray-900">{t('reports.service_revenue')}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">${(reportData?.serviceRevenue || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full me-3"></div>
                    <span className="text-sm font-medium text-gray-900">{t('reports.parts_revenue')}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">${(reportData?.partsRevenue || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full me-3"></div>
                    <span className="text-sm font-medium text-gray-900">{t('reports.labor_revenue')}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">${(reportData?.laborRevenue || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full me-3"></div>
                    <span className="text-sm font-medium text-gray-900">{t('reports.other_revenue')}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">${(reportData?.otherRevenue || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{t('reports.payment_methods')}</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Banknote className="h-4 w-4 text-green-600 me-3" />
                    <span className="text-sm font-medium text-gray-900">{t('reports.cash_payments')}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">${(reportData?.cashPayments || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-blue-600 me-3" />
                    <span className="text-sm font-medium text-gray-900">{t('reports.card_payments')}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">${(reportData?.cardPayments || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Receipt className="h-4 w-4 text-purple-600 me-3" />
                    <span className="text-sm font-medium text-gray-900">{t('reports.bank_transfer')}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">${(reportData?.bankTransferPayments || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-orange-600 me-3" />
                    <span className="text-sm font-medium text-gray-900">{t('reports.check_payments')}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">${(reportData?.checkPayments || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Revenue Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Services by Revenue */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{t('reports.top_services')}</h3>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('reports.service')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('reports.revenue')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('reports.count')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('reports.avg_price')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData?.topServices?.slice(0, 5).map((service, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${service.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${(service.avgPrice || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          <div className="p-4">
            <Pagination
              currentPage={logsPage}
              totalPages={Math.max(1, Math.ceil((logsTotal || 0) / logsLimit))}
              totalItems={logsTotal}
              itemsPerPage={logsLimit}
              onPageChange={(p) => setLogsPage(p)}
              onItemsPerPageChange={(n) => { setLogsLimit(n); setLogsPage(1) }}
              itemsPerPageOptions={[10, 30, 50, 100]}
              className="mt-2"
            />
          </div>
            </div>
          </div>

          {/* Top Customers by Revenue */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{t('reports.top_customers')}</h3>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('reports.customer')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('reports.revenue')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('reports.jobs')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData?.topCustomers?.slice(0, 5).map((customer, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${customer.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.jobs}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Financial Health Summary */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{t('reports.financial_health')}</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${(reportData?.averageInvoiceValue || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">{t('reports.avg_invoice_value')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {(reportData?.collectionRate || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">{t('reports.collection_rate')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {typeof reportData?.customerGrowth === 'number' ? `${reportData.customerGrowth}%` : '0%'}
                </div>
                <div className="text-sm text-gray-500">{t('reports.customer_growth')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${(reportData?.grossProfit || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">{t('reports.gross_profit')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Work Logs */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{t('reports.work_logs')}</h3>
            <div className="text-sm text-gray-500">{t('reports.latest_n', { count: workLogs.length })}</div>
          </div>
          <div className="px-6 py-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <input
              value={filterJobCardIdEnds}
              onChange={(e) => { setFilterJobCardIdEnds(e.target.value.toUpperCase()); setLogsPage(1) }}
              placeholder={t('reports.jobcard_suffix') as string}
              className="px-3 py-2 border rounded-md text-sm"
            />
            <input
              value={filterUserId}
              onChange={(e) => { setFilterUserId(e.target.value); setLogsPage(1) }}
              placeholder={t('reports.user_id') as string}
              className="px-3 py-2 border rounded-md text-sm"
            />
            <select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setLogsPage(1) }}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="">{t('reports.any_role')}</option>
              <option value="mechanic">{t('roles.mechanic')}</option>
              <option value="inspector">{t('roles.inspector')}</option>
              <option value="admin">{t('roles.admin')}</option>
            </select>
            <input type="date" value={filterStartDate} onChange={(e)=>{ setFilterStartDate(e.target.value); setLogsPage(1) }} className="px-3 py-2 border rounded-md text-sm" />
            <input type="date" value={filterEndDate} onChange={(e)=>{ setFilterEndDate(e.target.value); setLogsPage(1) }} className="px-3 py-2 border rounded-md text-sm" />
            <div className="flex items-center gap-2">
              <input type="number" min="0" value={filterMinDuration} onChange={(e)=>{ setFilterMinDuration(e.target.value); setLogsPage(1) }} placeholder={t('reports.min_minutes') as string} className="w-1/2 px-3 py-2 border rounded-md text-sm" />
              <input type="number" min="0" value={filterMaxDuration} onChange={(e)=>{ setFilterMaxDuration(e.target.value); setLogsPage(1) }} placeholder={t('reports.max_minutes') as string} className="w-1/2 px-3 py-2 border rounded-md text-sm" />
            </div>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.user')}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.role')}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.job')}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.started')}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.ended')}</th>
                  <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.duration')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workLogs.map((log, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.userId?.displayName || `${log.userId?.firstName || ''} ${log.userId?.lastName || ''}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{(log.jobCardId?._id || '').slice(-6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.startedAt).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.endedAt ? new Date(log.endedAt).toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{typeof log.durationMs === 'number' ? `${Math.round(log.durationMs / 60000)} min` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}