'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Eye, ArrowUpDown } from 'lucide-react'
import StatusBadge from '@/components/dashboard/StatusBadge'

interface Service {
  _id: string
  name: string
  description: string
  category: string
  laborRate: number
  laborHours: number
  isActive: boolean
  createdAt: string
}

type SortKey = 'name' | 'category' | 'laborRate' | 'laborHours' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchServices(searchTerm, sortKey, sortDirection, selectedCategory)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, sortKey, sortDirection, selectedCategory])

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/services/categories');
      if (response.ok) {
        setCategories(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchServices = async (search: string, sort: SortKey, direction: SortDirection, category: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, sort, direction, category });
      const response = await fetch(`/api/services?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortKey === 'name' || sortKey === 'category') {
        aVal = a[sortKey].toLowerCase();
        bVal = b[sortKey].toLowerCase();
      } else if (sortKey === 'laborRate' || sortKey === 'laborHours') {
        aVal = a[sortKey];
        bVal = b[sortKey];
      } else {
        aVal = a.createdAt;
        bVal = b.createdAt;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [services, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        const response = await fetch(`/api/services/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setServices(services.filter(s => s._id !== id))
        }
      } catch (error) {
        console.error('Failed to delete service:', error)
      }
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your service catalog.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/services/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Link>
          <Link
            href="/services/new?fromTemplate=true"
            className="ml-2 inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            New from Template
          </Link>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {sortedServices.length} service{sortedServices.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                  Name <ArrowUpDown className="inline-block ml-1 h-4 w-4" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('category')}>
                  Category <ArrowUpDown className="inline-block ml-1 h-4 w-4" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('laborRate')}>
                  Labor Rate <ArrowUpDown className="inline-block ml-1 h-4 w-4" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('laborHours')}>
                  Labor Hours <ArrowUpDown className="inline-block ml-1 h-4 w-4" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>
                  Created <ArrowUpDown className="inline-block ml-1 h-4 w-4" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedServices.map((service) => (
                <tr key={service._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {service.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${service.laborRate.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.laborHours} hrs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={service.isActive ? 'active' : 'inactive'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(service.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/services/${service._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(service._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sortedServices.length === 0 && (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first service.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Link
                href="/services/new"
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}