'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Eye, CreditCard, DollarSign, CheckCircle, XCircle, Clock, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Invoice {
  _id: string
  jobCardId: {
    _id: string
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
  status: 'pending' | 'paid' | 'cancelled'
  notes?: string
  totalAmount: number
  paidAmount?: number
  dueDate: string
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'other'
  paymentStatus: 'pending' | 'paid' | 'failed'
  paymentDate?: string
  createdAt: string
}

export default function InvoicesPage() {
  const { t } = useTranslation('common');
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      `${invoice.customerId.firstName} ${invoice.customerId.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${invoice.vehicleId.year} ${invoice.vehicleId.make} ${invoice.vehicleId.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.vehicleId.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    const matchesPayment = paymentFilter === 'all' || invoice.paymentStatus === paymentFilter
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const isOverdue = (dueDate: string) => {
    const invoice = invoices.find(i => i.dueDate === dueDate)
    const isPaid = invoice?.paymentStatus === 'paid'
    return new Date(dueDate) < new Date() && !isPaid
  }

  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

  const pendingAmount = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.totalAmount, 0)

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
          <h1 className="text-2xl font-bold text-gray-900">{t('invoices.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('invoices.description')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/invoices/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('invoices.create_invoice')}
          </Link>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('invoices.total_revenue')}</dt>
                  <dd className="text-lg font-medium text-gray-900">${totalRevenue.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('invoices.pending_amount')}</dt>
                  <dd className="text-lg font-medium text-gray-900">${pendingAmount.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('invoices.total_invoices')}</dt>
                  <dd className="text-lg font-medium text-gray-900">{invoices.length}</dd>
                </dl>
              </div>
            </div>
          </div>
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
                  placeholder={t('invoices.search_placeholder')}
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
                <option value="all">{t('invoices.all_status')}</option>
                <option value="pending">{t('estimates.pending')}</option>
                <option value="paid">{t('invoices.paid')}</option>
                <option value="cancelled">{t('appointments.cancelled')}</option>
              </select>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">{t('invoices.all_payments')}</option>
                <option value="pending">{t('invoices.payment_pending')}</option>
                <option value="paid">{t('invoices.payment_received')}</option>
                <option value="failed">{t('invoices.payment_failed')}</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {t(filteredInvoices.length === 1 ? 'invoices.invoice_count' : 'invoices.invoice_count_plural', { count: filteredInvoices.length })}
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('invoices.invoice')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('appointments.customer')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('appointments.vehicle')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('invoices.amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('invoices.due_date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('invoices.payment_status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customers.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('customers.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          INV-{invoice._id.slice(-6)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {invoice.customerId.firstName} {invoice.customerId.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {invoice.vehicleId.year} {invoice.vehicleId.make} {invoice.vehicleId.model}
                    </div>
                    <div className="text-sm text-gray-500">
                      {invoice.vehicleId.licensePlate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${invoice.totalAmount.toFixed(2)}
                    </div>
                    {invoice.paidAmount && (
                      <div className="text-sm text-gray-500">
                        {t('invoices.paid_amount', { amount: invoice.paidAmount.toFixed(2) })}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isOverdue(invoice.dueDate) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </div>
                    {isOverdue(invoice.dueDate) && (
                      <div className="text-xs text-red-500">{t('invoices.overdue')}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(invoice.paymentStatus)}`}>
                      {invoice.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(invoice.status)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/invoices/${invoice._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/invoices/${invoice._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/invoices/${invoice._id}/pdf`}
                        className="text-green-600 hover:text-green-900"
                      >
                        <FileText className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('invoices.no_invoices_found')}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' ? t('invoices.adjust_search') : t('invoices.get_started')}
          </p>
          {!searchTerm && statusFilter === 'all' && paymentFilter === 'all' && (
            <div className="mt-6">
              <Link
                href="/invoices/new"
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t('invoices.create_invoice')}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}