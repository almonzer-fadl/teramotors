"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Users,
  ArrowUpDown,
} from "lucide-react";
import Search from "@/components/dashboard/Search";
import Pagination from "@/components/ui/Pagination";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";

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

  useEffect(() => {
    fetchCustomers(searchTerm, sortKey, sortDirection, currentPage, itemsPerPage);
  }, [searchTerm, sortKey, sortDirection, currentPage, itemsPerPage]);

  useEffect(() => {
    socket.on("update-customers", () => {
      fetchCustomers(searchTerm, sortKey, sortDirection, currentPage, itemsPerPage);
    });
    return () => {
      socket.off("update-customers");
    };
  });

  const fetchCustomers = async (
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
  };

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
  const sortedCustomers = customers;

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
        }
      } catch (error) {
        console.error("Failed to delete customer:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t("customers.title")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t("customers.description")}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              href="/customers/new"
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              <Plus className="me-2 h-4 w-4" />
              {t("customers.add_customer")}
            </Link>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="w-full sm:w-1/2">
                <Search
                  placeholder={t("customers.search_placeholder")}
                  fetchSuggestions={fetchCustomerSuggestions}
                  onSearch={(customer: Customer) =>
                    router.push(`/customers/${customer._id}`)
                  }
                  renderSuggestion={(customer: Customer) => (
                    <div>
                      <p className="font-medium">
                        {customer.firstName} {customer.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                  )}
                />
              </div>
              <div className="text-sm text-gray-500 text-center sm:text-end">
                {t(
                  pagination.totalCount === 1
                    ? "customers.customer_count"
                    : "customers.customer_count_plural",
                  { count: pagination.totalCount }
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <ResponsiveTable
          customers={sortedCustomers}
          onDelete={handleDelete}
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-lg shadow">
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
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {t("customers.no_customers_found")}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm
                ? t("customers.adjust_search")
                : t("customers.get_started")}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link
                  href="/customers/new"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
                >
                  <Plus className="me-2 h-4 w-4" />
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
