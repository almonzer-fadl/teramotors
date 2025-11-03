"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Package, DollarSign, AlertTriangle, CheckCircle, Upload } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import ResponsiveInventoryTable from "@/components/ui/ResponsiveInventoryTable";
import ExcelImportModal from "@/components/dashboard/ExcelImportModal";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";

interface Part {
  _id: string;
  name: string;
  partNumber: string;
  category: string;
  manufacturer: string;
  cost: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  location: string;
  isActive: boolean;
  createdAt: string;
}

type SortKey = "name" | "partNumber" | "stockQuantity" | "createdAt";
type SortDirection = "asc" | "desc";

export default function InventoryPage() {
  const { t } = useTranslation('common');
  const [parts, setParts] = useState<Part[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchParts(debouncedSearchTerm, sortKey, sortDirection);
  }, [debouncedSearchTerm, sortKey, sortDirection]);

  useEffect(() => {
    socket.on("update-parts", () => {
      fetchParts(debouncedSearchTerm, sortKey, sortDirection);
    });
  });

  const fetchParts = async (
    search: string,
    sort: SortKey,
    direction: SortDirection
  ) => {
    try {
      const params = new URLSearchParams({ search, sort, direction });
      const response = await fetch(`/api/parts?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setParts(Array.isArray(data.parts) ? data.parts : []);
      } else {
        setParts([]);
      }
    } catch (error) {
      console.error("Failed to fetch parts:", error);
      setParts([]);
    } finally {
      setInitialLoading(false);
    }
  };

  const sortedParts = useMemo(() => {
    return [...parts].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortKey === "name" || sortKey === "partNumber") {
        aVal = a[sortKey].toLowerCase();
        bVal = b[sortKey].toLowerCase();
      } else if (sortKey === "stockQuantity") {
        aVal = a[sortKey];
        bVal = b[sortKey];
      } else {
        aVal = a.createdAt;
        bVal = b.createdAt;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [parts, sortKey, sortDirection]);

  const paginatedParts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedParts.slice(start, start + itemsPerPage);
  }, [sortedParts, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(sortedParts.length / itemsPerPage));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (perPage: number) => {
    setItemsPerPage(perPage);
    setCurrentPage(1);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/parts/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the parts list
        fetchParts(debouncedSearchTerm, sortKey, sortDirection);
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.error?.message || 'Import failed' };
      }
    } catch (error) {
      console.error('Import error:', error);
      return { success: false, message: 'Failed to import parts' };
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('inventory.delete_confirm'))) {
      try {
        const response = await fetch(`/api/parts/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setParts(parts.filter((p) => p._id !== id));
        }
      } catch (error) {
        console.error("Failed to delete part:", error);
      }
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalValue = sortedParts.reduce((sum, part) => sum + (part.stockQuantity * part.sellingPrice), 0);
  const lowStockCount = sortedParts.filter(part => part.stockQuantity <= part.minStockLevel && part.stockQuantity > 0).length;
  const outOfStockCount = sortedParts.filter(part => part.stockQuantity === 0).length;

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('inventory.title')}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('inventory.description')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/inventory/new"
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              <Plus className="me-2 h-4 w-4" />
              {t('inventory.add_part')}
            </Link>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 transition-colors"
            >
              <Upload className="me-2 h-4 w-4" />
              Import from Excel
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('inventory.total_parts')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {sortedParts.length}
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
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('inventory.total_value')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${totalValue.toFixed(2)}
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
                  <AlertTriangle className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('inventory.low_stock')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {lowStockCount}
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
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {t('inventory.out_of_stock')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {outOfStockCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('inventory.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="text-sm text-gray-500 text-center sm:text-end">
                {t(sortedParts.length === 1 ? 'inventory.part_count' : 'inventory.part_count_plural', { count: sortedParts.length })}
              </div>
            </div>
          </div>
        </div>

        {/* Parts Table */}
        <ResponsiveInventoryTable
          parts={paginatedParts}
          onDelete={handleDelete}
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedParts.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />

        {/* Empty State */}
        {sortedParts.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {t('inventory.no_parts_found')}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm
                ? t('inventory.adjust_search')
                : t('inventory.get_started_adding')}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link
                  href="/inventory/new"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
                >
                  <Plus className="me-2 h-4 w-4" />
                  {t('inventory.add_part')}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Excel Import Modal */}
        <ExcelImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImport}
          title="Import Parts from Excel"
          description="Upload an Excel file to import multiple parts at once"
          acceptedFileTypes=".xlsx,.xls"
          maxFileSize="5MB"
          exampleHeaders={['name', 'price', 'description', 'category', 'manufacturer', 'cost', 'stockQuantity', 'minStockLevel', 'location', 'partNumber']}
        />
      </div>
    </div>
  );
}
