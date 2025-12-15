"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ResponsiveServicesTable from "@/components/ui/ResponsiveServicesTable";
import Pagination from "@/components/ui/Pagination";
import ExcelImportModal from "@/components/dashboard/ExcelImportModal";
import { socket } from "@/lib/services/socket";
import { useSession } from "@/lib/hooks/useSession";
import { hasPermission } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import { fadeInUp, scaleIn, staggerContainer } from "@/lib/dashboard-animations";

interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  laborRate: number;
  laborHours: number;
  isActive: boolean;
  createdAt: string;
}

type SortKey = "name" | "category" | "laborRate" | "laborHours" | "createdAt";
type SortDirection = "asc" | "desc";

export default function ServicesPage() {
  const { t } = useTranslation('common');
  const { user } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Check if user has admin permissions
  const userRole = (user as any)?.role || 'inspector';
  const canDeleteServices = hasPermission(userRole, 'canDelete');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchServices(debouncedSearchTerm, sortKey, sortDirection, selectedCategory);
  }, [debouncedSearchTerm, sortKey, sortDirection, selectedCategory]);
  useEffect(() => {
    socket.on("update-services", () => {
      fetchServices(debouncedSearchTerm, sortKey, sortDirection, selectedCategory);
    });
    return () => {
      socket.off("update-services");
    };
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/services/categories");
      if (response.ok) {
        setCategories(await response.json());
      }
    } catch (error) {
    }
  };

  const fetchServices = async (
    search: string,
    sort: SortKey,
    direction: SortDirection,
    category: string
  ) => {
    try {
      const params = new URLSearchParams({ search, sort, direction, category });
      const response = await fetch(`/api/services?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
    } finally {
      setInitialLoading(false);
    }
  };

  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortKey === "name" || sortKey === "category") {
        aVal = a[sortKey].toLowerCase();
        bVal = b[sortKey].toLowerCase();
      } else if (sortKey === "laborRate" || sortKey === "laborHours") {
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
  }, [services, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('services.delete_confirmation'))) {
      try {
        const response = await fetch(`/api/services/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setServices(services.filter((s) => s._id !== id));
        }
      } catch (error) {
      }
    }
  };

  // Pagination hooks must be declared before any conditional returns
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedServices.slice(start, start + itemsPerPage);
  }, [sortedServices, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(sortedServices.length / itemsPerPage));

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97402]"></div>
      </div>
    );
  }

  const totalServices = sortedServices.length;
  const activeServices = sortedServices.filter(s => s.isActive).length;
  const inactiveServices = sortedServices.filter(s => !s.isActive).length;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (perPage: number) => {
    setItemsPerPage(perPage);
    setCurrentPage(1);
  };

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/services/import', {
        method: 'POST',
        body: formData,
      });


      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, message: `Server error: ${response.status}` };
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh the services list
        fetchServices(debouncedSearchTerm, sortKey, sortDirection, selectedCategory);
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.error?.message || 'Import failed' };
      }
    } catch (error) {
      return { success: false, message: `Failed to import services: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-6">
      <motion.div
        className="space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" variants={fadeInUp}>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              {t('services.title')}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('services.description')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/services/new"
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-[#F97402] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#F13F33] transition-colors"
            >
              <Plus className="me-2 h-4 w-4" />
              {t('services.add_service')}
            </Link>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-gray-900 dark:bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              <Upload className="me-2 h-4 w-4" />
              Import from Excel
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" variants={staggerContainer}>
          {[
            {
              label: t('services.total_services'),
              value: totalServices,
              icon: <Plus className="h-6 w-6 text-blue-500 dark:text-blue-400" />,
            },
            {
              label: t('services.active'),
              value: activeServices,
              icon: <Plus className="h-6 w-6 text-green-500 dark:text-green-400" />,
            },
            {
              label: t('services.inactive'),
              value: inactiveServices,
              icon: <Plus className="h-6 w-6 text-red-500 dark:text-red-400" />,
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30"
              variants={scaleIn}
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">{stat.icon}</div>
                  <div className="ms-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {stat.label}
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30" variants={fadeInUp}>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                <div className="relative flex-1">
                  <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('services.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full ps-10 pe-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-[#F97402] focus:border-[#F97402]"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-[#F97402]"
                >
                  <option value="">{t('services.all_categories')}</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-end">
                {t(sortedServices.length === 1 ? 'services.service_count' : 'services.service_count_plural', { count: sortedServices.length })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Services Table */}
        <motion.div variants={fadeInUp}>
          <ResponsiveServicesTable
            services={paginatedServices}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
            onDelete={handleDelete}
            canDelete={canDeleteServices}
          />
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedServices.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </motion.div>

        {/* Empty State */}
        <AnimatePresence>
          {sortedServices.length === 0 && (
            <motion.div
              className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 p-8 text-center"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Plus className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {t('services.no_services_found')}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? t('services.adjust_search_terms')
                  : t('services.get_started_adding')}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Link
                    href="/services/new"
                    className="inline-flex items-center rounded-lg bg-[#F97402] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#F13F33] transition-colors"
                  >
                    <Plus className="me-2 h-4 w-4" />
                    {t('services.add_service')}
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Excel Import Modal */}
        <ExcelImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImport}
          title="Import Services from Excel"
          description="Upload an Excel file to import multiple services at once"
          acceptedFileTypes=".xlsx,.xls"
          maxFileSize="5MB"
          exampleHeaders={['name', 'price', 'description', 'category', 'laborHours']}
        />
      </motion.div>
    </div>
  );
}
