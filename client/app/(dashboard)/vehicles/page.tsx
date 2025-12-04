'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye, Car, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Pagination from "@/components/ui/Pagination";
import ResponsiveVehicleTable from "@/components/ui/ResponsiveVehicleTable";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/dashboard-animations";

interface Vehicle {
  _id: string;
  customerId?: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  mileage: number;
  transmission: string;
  fuelType: string;
  isActive: boolean;
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function VehiclesPage() {
  const { t } = useTranslation('common');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    fetchVehicles(searchTerm, currentPage, itemsPerPage);

    socket.on("update-vehicles", () => {
      fetchVehicles(searchTerm, currentPage, itemsPerPage);
    });
    return () => {
      socket.off("update-vehicles");
    };
  }, [searchTerm, currentPage, itemsPerPage]);

  const fetchVehicles = async (search: string, page: number, limit: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await fetch(`/api/vehicles?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.vehicles && data.pagination) {
          setVehicles(data.vehicles);
          setPagination(data.pagination);
        } else {
          // Fallback for old API format
          setVehicles(data);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalCount: data.length,
            limit: data.length,
            hasNextPage: false,
            hasPrevPage: false
          });
        }
      } else {
        setVehicles([]);
        setPagination({
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      setVehicles([]);
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove client-side filtering since we're now doing it server-side
  const filteredVehicles = vehicles;
  

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('vehicles.delete_confirm'))) {
      try {
        const response = await fetch(`/api/vehicles/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setVehicles(vehicles.filter((v) => v._id !== id));
        }
      } catch (error) {
        console.error("Failed to delete vehicle:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97402] dark:border-[#F97402]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 sm:px-6 lg:px-8 py-6">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('vehicles.title')}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('vehicles.description')}
            </p>
          </div>
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/vehicles/new"
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-[#F97402] hover:bg-[#F13F33] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300"
            >
              <Plus className="me-2 h-4 w-4" />
              {t('vehicles.add_vehicle')}
            </Link>
          </motion.div>
        </motion.div>

        {/* Search and Stats */}
        <motion.div
          className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-800"
          variants={scaleIn}
        >
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder={t('vehicles.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#F97402] focus:border-[#F97402] transition-all"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-end">
                {t(pagination.totalCount === 1 ? 'vehicles.vehicle_count' : 'vehicles.vehicle_count_plural', { count: pagination.totalCount })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vehicles Table */}
        <motion.div variants={fadeInUp}>
          <ResponsiveVehicleTable
            vehicles={filteredVehicles}
            onDelete={handleDelete}
          />
        </motion.div>

        {/* Pagination */}
        <AnimatePresence>
          {pagination.totalPages > 1 && (
            <motion.div
              className="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-800 sm:px-6 rounded-lg shadow-sm dark:shadow-gray-800/50"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
            >
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalCount}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemsPerPageOptions={[10, 30, 50]}
                showItemsPerPage={true}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        <AnimatePresence>
          {filteredVehicles.length === 0 && (
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:shadow-gray-800/50 border border-gray-200 dark:border-gray-800 p-8 text-center"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Car className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {t('vehicles.no_vehicles_found')}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? t('vehicles.adjust_search')
                  : t('vehicles.get_started')}
              </p>
              {!searchTerm && (
                <motion.div
                  className="mt-6"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/vehicles/new"
                    className="inline-flex items-center rounded-lg bg-[#F97402] hover:bg-[#F13F33] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300"
                  >
                    <Plus className="me-2 h-4 w-4" />
                    {t('vehicles.add_vehicle')}
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}