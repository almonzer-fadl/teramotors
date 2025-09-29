"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ResponsiveEstimatesTable from "@/components/ui/ResponsiveEstimatesTable";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";

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
      console.error("Failed to fetch estimates:", error);
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ResponsiveEstimatesTable
      estimates={filteredEstimates}
      searchTerm={searchTerm}
      statusFilter={statusFilter}
      onSearchChange={setSearchTerm}
      onStatusFilterChange={setStatusFilter}
    />
  );
}

