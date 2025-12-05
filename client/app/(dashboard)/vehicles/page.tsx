'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Car } from "lucide-react";
import { motion } from "framer-motion";
import Pagination from "@/components/ui/Pagination";
import ResponsiveVehicleTable from "@/components/ui/ResponsiveVehicleTable";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";
import { fadeInUp } from "@/lib/dashboard-animations";
import { useReferenceData } from "@/lib/stores/referenceDataStore";

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

  // Use global cache invalidation
  const { invalidateVehicles } = useReferenceData();

  // Debounced fetch
  const fetchVehicles = useCallback(async (search: string, page: number, limit: number) => {
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
          setVehicles(Array.isArray(data) ? data : []);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalCount: Array.isArray(data) ? data.length : 0,
            limit: Array.isArray(data) ? data.length : 10,
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
  }, []);

  // Fetch vehicles on initial load and when pagination changes (NOT on search - handled locally)
  useEffect(() => {
    fetchVehicles("", currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, fetchVehicles]);

  useEffect(() => {
    const handleUpdate = () => {
      fetchVehicles("", currentPage, itemsPerPage);
      invalidateVehicles(); // Invalidate cache when vehicles are updated
    };

    socket.on("update-vehicles", handleUpdate);
    return () => {
      socket.off("update-vehicles", handleUpdate);
    };
  }, [currentPage, itemsPerPage, fetchVehicles, invalidateVehicles]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Filter vehicles based on search term (make, model, license plate, customer name, etc.)
  const filteredVehicles = vehicles.filter(vehicle => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const customerName = vehicle.customerId
      ? `${vehicle.customerId.firstName} ${vehicle.customerId.lastName}`.toLowerCase()
      : '';
    return (
      vehicle.make?.toLowerCase().includes(search) ||
      vehicle.model?.toLowerCase().includes(search) ||
      vehicle.licensePlate?.toLowerCase().includes(search) ||
      vehicle.vin?.toLowerCase().includes(search) ||
      vehicle.year?.toString().includes(search) ||
      customerName.includes(search)
    );
  });

  const handleDelete = async (id: string) => {
    if (confirm(t('vehicles.delete_confirm'))) {
      try {
        const response = await fetch(`/api/vehicles/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setVehicles(vehicles.filter((v) => v._id !== id));
          invalidateVehicles(); // Invalidate cache after deletion
          alert(t('vehicles.delete_success'));
        } else {
          const errorData = await response.json();
          alert(errorData.error || t('vehicles.delete_error'));
        }
      } catch (error) {
        console.error("Failed to delete vehicle:", error);
        alert(t('vehicles.delete_error'));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97402]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Header - Only animate this section */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              {t('vehicles.title')}
            </h1>
            <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
              {t('vehicles.description')}
            </p>
          </div>
          <Link
            href="/vehicles/new"
            className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="me-2 h-5 w-5" />
            {t('vehicles.add_vehicle')}
          </Link>
        </motion.div>
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Vehicles</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{pagination.totalCount}</p>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Vehicles</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{vehicles.filter(v => v.isActive).length}</p>
            </div>
        </div>

        {/* Search and Stats */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="w-full sm:w-1/2">
                <input
                  type="text"
                  placeholder={t('vehicles.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                />
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center sm:text-end uppercase tracking-wider">
                {t(
                  filteredVehicles.length === 1
                    ? 'vehicles.vehicle_count'
                    : 'vehicles.vehicle_count_plural',
                  { count: filteredVehicles.length }
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Vehicles Table - No animation */}
        <div>
          <ResponsiveVehicleTable
            vehicles={filteredVehicles}
            onDelete={handleDelete}
          />
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-800/30">
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
          </div>
        )}

        {/* Empty State */}
        {filteredVehicles.length === 0 && (
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center">
              <Car className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('vehicles.no_vehicles_found')}
            </h3>
            <p className="mt-3 text-base text-gray-700 dark:text-gray-300">
              {searchTerm
                ? t('vehicles.adjust_search')
                : t('vehicles.get_started')}
            </p>
            {!searchTerm && (
              <div className="mt-8">
                <Link
                  href="/vehicles/new"
                  className="inline-flex items-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <Plus className="me-2 h-5 w-5" />
                  {t('vehicles.add_vehicle')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
