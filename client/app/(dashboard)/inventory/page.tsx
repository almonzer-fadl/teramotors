'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, ArrowUpDown } from 'lucide-react'
import StatusBadge from '@/components/dashboard/StatusBadge'

interface Part {
  _id: string
  name: string
  partNumber: string
  category: string
  manufacturer: string
  cost: number
  sellingPrice: number
  stockQuantity: number
  minStockLevel: number
  location: string
  isActive: boolean
  createdAt: string
}

type SortKey = 'name' | 'partNumber' | 'stockQuantity' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function InventoryPage() {
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  useEffect(() => {
    fetchParts(searchTerm, sortKey, sortDirection)
  }, [searchTerm, sortKey, sortDirection])

  const fetchParts = async (search: string, sort: SortKey, direction: SortDirection) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, sort, direction });
      const response = await fetch(`/api/parts?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setParts(data)
      }
    } catch (error) {
      console.error('Failed to fetch parts:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortedParts = useMemo(() => {
    return [...parts].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortKey === 'name' || sortKey === 'partNumber') {
        aVal = a[sortKey].toLowerCase();
        bVal = b[sortKey].toLowerCase();
      } else if (sortKey === 'stockQuantity') {
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
  }, [parts, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this part?')) {
      try {
        const response = await fetch(`/api/parts/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          setParts(parts.filter(p => p._id !== id))
        }
      } catch (error) {
        console.error('Failed to delete part:', error)
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
          <h1 className="text-2xl font-bold text-gray-900">Parts Inventory</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your parts inventory and stock levels.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/inventory/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Part
          </Link>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="text-sm text-gray-500">
              {sortedParts.length} part{sortedParts.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Parts Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                  Name <ArrowUpDown className="inline-block ml-1 h-4 w-4" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('partNumber')}>
                  Part Number <ArrowUpDown className="inline-block ml-1 h-4 w-4" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
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
              {sortedParts.map((part) => (
                <tr key={part._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {part.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {part.partNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {part.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {part.stockQuantity} / {part.minStockLevel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${part.sellingPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={part.isActive ? 'active' : 'inactive'} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(part.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/inventory/${part._id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(part._id)}
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

      {sortedParts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No parts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first part.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Link
                href="/inventory/new"
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Part
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}