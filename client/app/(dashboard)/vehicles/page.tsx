'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Car, Plus, Loader2 } from 'lucide-react';
import { useSession } from '@/lib/hooks/useSession';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ResponsiveVehiclesTable from '@/components/ui/ResponsiveVehiclesTable';
import Pagination from "@/components/ui/Pagination";
import { useReferenceData } from "@/lib/stores/referenceDataStore";
import { socket } from "@/lib/services/socket";
import Link from 'next/link';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface Vehicle {
    _id: string;
    make: string;
    model: string;
    year: number;
    licensePlate?: string;
    vin?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

type SortKey = "make" | "model" | "year" | "licensePlate";
type SortDirection = "asc" | "desc";

export default function VehiclesPage() {
  const { user, isLoading: isSessionLoading } = useSession();
  const { t } = useTranslation('common');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("make");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
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
  const router = useRouter();
  const { invalidateVehicles } = useReferenceData();

  const fetchVehicles = useCallback(async (
    search: string,
    sort: SortKey,
    direction: SortDirection,
    page: number,
    limit: number
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        sortBy: sort,
        sortOrder: direction,
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
          const items = Array.isArray(data)
            ? data
            : (Array.isArray(data.data) ? data.data : (Array.isArray((data || {}).items) ? data.items : []));
          setVehicles(items);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalCount: items.length,
            limit: items.length,
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

  useEffect(() => {
    if (user) {
      fetchVehicles(searchTerm, sortKey, sortDirection, currentPage, itemsPerPage);
    }
  }, [user, searchTerm, sortKey, sortDirection, currentPage, itemsPerPage, fetchVehicles]);

  useEffect(() => {
    const handleUpdate = () => {
      fetchVehicles(searchTerm, sortKey, sortDirection, currentPage, itemsPerPage);
      invalidateVehicles();
    };

    socket.on("update-vehicles", handleUpdate);
    return () => {
      socket.off("update-vehicles", handleUpdate);
    };
  }, [searchTerm, sortKey, sortDirection, currentPage, itemsPerPage, fetchVehicles, invalidateVehicles]);

  const sortedVehicles = vehicles; // Sorting done server-side

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("vehicles.delete_confirm"))) { // Assuming delete_confirm translation exists
      try {
        const response = await fetch(`/api/vehicles/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setVehicles(vehicles.filter((v) => v._id !== id));
          invalidateVehicles();
          toast.success(t("vehicles.delete_success")); // Assuming delete_success translation exists
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || t("vehicles.delete_error")); // Assuming delete_error translation exists
        }
      } catch (error) {
        console.error("Failed to delete vehicle:", error);
        toast.error(t("vehicles.delete_error"));
      }
    }
  };


  if (isSessionLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-[#F97402]" />
      </div>
    );
  }

  return (
    <motion.div
      key="vehicles-page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="max-w-6xl mx-auto py-12 px-4"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {t('vehicles.title')}
        </h1>
        <Link 
          href="/vehicles/new"
          className="flex items-center justify-center px-5 py-3 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white rounded-lg shadow-lg"
        >
          <Plus className="me-2" />
          {t('vehicles.add_vehicle')}
        </Link>
      </div>

      <div className="mb-8">
        <input
          type="text"
          placeholder={t('vehicles.search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
        />
      </div>

      <ResponsiveVehiclesTable
        vehicles={sortedVehicles}
        onDelete={handleDelete}
        onSort={handleSort}
        sortKey={sortKey}
        sortDirection={sortDirection}
      />

        {pagination.totalPages > 1 && (
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-800/30 mt-8">
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

      {vehicles.length === 0 && (
        <motion.div variants={itemVariants}>
            <div className="p-12 text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50">
                <Car className="h-16 w-16 mx-auto text-gray-400" />
                <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">{t('vehicles.no_vehicles_found')}</h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">{t('vehicles.get_started')}</p>
            </div>
        </motion.div>
      )}
    </motion.div>
  );
}
