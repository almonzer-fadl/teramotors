"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Package, DollarSign, AlertTriangle, CheckCircle, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Pagination from "@/components/ui/Pagination";
import ResponsiveInventoryTable from "@/components/ui/ResponsiveInventoryTable";
import ExcelImportModal from "@/components/dashboard/ExcelImportModal";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/dashboard-animations";

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97402] dark:border-[#F97402]"></div>
      </div>
    );
  }

  const totalValue = sortedParts.reduce((sum, part) => sum + (part.stockQuantity * part.sellingPrice), 0);
  const lowStockCount = sortedParts.filter(part => part.stockQuantity <= part.minStockLevel && part.stockQuantity > 0).length;
  const outOfStockCount = sortedParts.filter(part => part.stockQuantity === 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-6">
      <motion.div
        className="space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          variants={fadeInUp}
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">{t('inventory.title')}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('inventory.description')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/inventory/new"
                className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-[#F97402] hover:bg-[#F13F33] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300"
              >
                <Plus className="me-2 h-4 w-4" />
                {t('inventory.add_part')}
              </Link>
            </motion.div>
            <motion.button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-purple-600 hover:bg-purple-500 dark:bg-purple-700 dark:hover:bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload className="me-2 h-4 w-4" />
              Import from Excel
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800"
            variants={scaleIn}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {t('inventory.total_parts')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {sortedParts.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800"
            variants={scaleIn}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {t('inventory.total_value')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      ${totalValue.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800"
            variants={scaleIn}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {t('inventory.low_stock')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {lowStockCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800"
            variants={scaleIn}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="ms-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {t('inventory.out_of_stock')}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {outOfStockCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search */}
        <motion.div
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800"
          variants={scaleIn}
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder={t('inventory.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full ps-10 pe-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#F97402] focus:border-[#F97402] transition-all"
                />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-end">
                {t(sortedParts.length === 1 ? 'inventory.part_count' : 'inventory.part_count_plural', { count: sortedParts.length })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Parts Table */}
        <motion.div variants={fadeInUp}>
          <ResponsiveInventoryTable
            parts={paginatedParts}
            onDelete={handleDelete}
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedParts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </motion.div>

        {/* Empty State */}
        <AnimatePresence>
          {sortedParts.length === 0 && (
            <motion.div
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-8 text-center"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {t('inventory.no_parts_found')}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? t('inventory.adjust_search')
                  : t('inventory.get_started_adding')}
              </p>
              {!searchTerm && (
                <motion.div
                  className="mt-6"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/inventory/new"
                    className="inline-flex items-center rounded-lg bg-[#F97402] hover:bg-[#F13F33] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300"
                  >
                    <Plus className="me-2 h-4 w-4" />
                    {t('inventory.add_part')}
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
      </motion.div>
    </div>
  );
}
