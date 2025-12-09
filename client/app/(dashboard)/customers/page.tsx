"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import Pagination from "@/components/ui/Pagination";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";
import { fadeInUp } from "@/lib/dashboard-animations";
import { useReferenceData } from "@/lib/stores/referenceDataStore";

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  vehicles: number;
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

type SortKey = "name" | "createdAt";
type SortDirection = "asc" | "desc";

export default function CustomersPage() {
  const { t } = useTranslation("common");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
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

  // Use global cache invalidation
  const { invalidateCustomers } = useReferenceData();

  // Debounced fetch
  const fetchCustomers = useCallback(async (
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
        sortBy: sort === "name" ? "firstName" : sort,
        sortOrder: direction,
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await fetch(`/api/customers?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.customers && data.pagination) {
          setCustomers(data.customers);
          setPagination(data.pagination);
        } else {
          // Fallback for old API format
          const items = Array.isArray(data)
            ? data
            : (Array.isArray(data.data) ? data.data : (Array.isArray((data || {}).items) ? data.items : []));
          setCustomers(items);
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
        setCustomers([]);
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
      console.error("Failed to fetch customers:", error);
      setCustomers([]);
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

  // Fetch customers on initial load and when sort/pagination changes (NOT on search - handled locally)
  useEffect(() => {
    fetchCustomers("", sortKey, sortDirection, currentPage, itemsPerPage);
  }, [sortKey, sortDirection, currentPage, itemsPerPage, fetchCustomers]);

  useEffect(() => {
    const handleUpdate = () => {
      fetchCustomers("", sortKey, sortDirection, currentPage, itemsPerPage);
      invalidateCustomers(); // Invalidate cache when customers are updated
    };

    socket.on("update-customers", handleUpdate);
    return () => {
      socket.off("update-customers", handleUpdate);
    };
  }, [sortKey, sortDirection, currentPage, itemsPerPage, fetchCustomers, invalidateCustomers]);

  const fetchCustomerSuggestions = async (
    query: string
  ): Promise<Customer[]> => {
    try {
      const params = new URLSearchParams({
        search: query,
        sortBy: "firstName",
        sortOrder: "asc",
        page: "1",
        limit: "10"
      });
      const response = await fetch(`/api/customers?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.customers) {
          return data.customers as Customer[];
        }
        // Fallback for old API format
        const items = Array.isArray(data)
          ? data
          : (Array.isArray(data.data) ? data.data : (Array.isArray((data || {}).items) ? data.items : []));
        return items as Customer[];
      }
    } catch (error) {
      console.error("Failed to fetch customer suggestions:", error);
    }
    return [];
  };

  // Remove client-side sorting since we're now doing it server-side
  // Filter customers based on search term (name, email, phone)
  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      customer.firstName?.toLowerCase().includes(search) ||
      customer.lastName?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search) ||
      customer.phone?.toLowerCase().includes(search)
    );
  });

  const sortedCustomers = filteredCustomers;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("customers.delete_confirm"))) {
      try {
        const response = await fetch(`/api/customers/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setCustomers(customers.filter((c) => c._id !== id));
          invalidateCustomers(); // Invalidate cache after deletion
          alert(t("customers.delete_success"));
        } else {
          const errorData = await response.json();
          alert(errorData.error || t("customers.delete_error"));
        }
      } catch (error) {
        console.error("Failed to delete customer:", error);
        alert(t("customers.delete_error"));
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
              {t("customers.title")}
            </h1>
            <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
              {t("customers.description")}
            </p>
          </div>
          <Link
            id="tour-step-4-add-customer"
            href="/customers/new"
            className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="me-2 h-5 w-5" />
            {t("customers.add_customer")}
          </Link>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Customers</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{pagination.totalCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
            </div>
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Customers</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{customers.filter(c => c.isActive).length}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
            </div>
        </div>

        {/* Search and Stats */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="w-full sm:w-1/2">
                <input
                  type="text"
                  placeholder={t('customers.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                />
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 text-center sm:text-end uppercase tracking-wider">
                {t(
                  filteredCustomers.length === 1
                    ? "customers.customer_count"
                    : "customers.customer_count_plural",
                  { count: filteredCustomers.length }
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customers Table - No animation */}
        <div>
          <ResponsiveTable
            customers={sortedCustomers}
            onDelete={handleDelete}
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
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
        {sortedCustomers.length === 0 && (
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center">
              <Users className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t("customers.no_customers_found")}
            </h3>
            <p className="mt-3 text-base text-gray-700 dark:text-gray-300">
              {searchTerm
                ? t("customers.adjust_search")
                : t("customers.get_started")}
            </p>
            {!searchTerm && (
              <div className="mt-8">
                <Link
                  href="/customers/new"
                  className="inline-flex items-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <Plus className="me-2 h-5 w-5" />
                  {t("customers.add_customer")}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
