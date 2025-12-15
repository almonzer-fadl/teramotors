"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ResponsiveEstimatesTable from "@/components/ui/ResponsiveEstimatesTable";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";
import { fadeInUp, staggerContainer } from "@/lib/dashboard-animations";

interface Estimate {
  _id: string;
  jobCardId: {
    _id: string;
  };
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  vehicleId: {
    _id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  mechanicId: {
    _id: string;
    fullName: string;
  };
  status: "pending" | "approved" | "rejected";
  services: Array<{
    name: string;
    serviceId: {
      _id: string;
      name: string;
    };
    quantity: number;
    laborCost: number;
    partsCost: number;
    totalCost: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  notes?: string;
  createdAt: string;
}

export default function EstimatesPage() {
  const { t } = useTranslation('common');
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchEstimates();

    socket.on("update-estimates", () => {
      fetchEstimates();
    });

    return () => {
      socket.off("update-estimates");
    };
  }, []);

  const fetchEstimates = async () => {
    try {
      const response = await fetch("/api/estimates");
      if (response.ok) {
        const data = await response.json();
        setEstimates(Array.isArray(data.estimates) ? data.estimates : []);
      } else {
        setEstimates([]);
      }
    } catch (error) {
      setEstimates([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEstimates = estimates.filter((estimate) => {
    const matchesSearch =
      `${estimate.customerId.firstName} ${estimate.customerId.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      `${estimate.vehicleId.year} ${estimate.vehicleId.make} ${estimate.vehicleId.model}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      estimate.vehicleId.licensePlate
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || estimate.status === statusFilter;

    return matchesSearch && matchesStatus;
  });


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97402]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-6">
      <motion.div
        className="space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4" variants={fadeInUp}>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">{t('estimates.title')}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('estimates.description')}
            </p>
          </div>
          <Link
            href="/estimates/new"
            className="inline-flex items-center justify-center rounded-lg bg-[#F97402] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#F13F33] transition-colors"
          >
            {t('estimates.create_estimate')}
          </Link>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <ResponsiveEstimatesTable
            estimates={filteredEstimates}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
