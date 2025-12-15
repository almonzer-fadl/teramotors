'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ResponsiveJobCardsGrid from "@/components/ui/ResponsiveJobCardsGrid";
import { socketService } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";
import { fadeInUp } from "@/lib/dashboard-animations";

interface JobCard {
  _id: string;
  appointmentId: {
    _id: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
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
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  estimatedStartTime: string;
  estimatedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  services: Array<{
    serviceId: {
      _id: string;
      name: string;
      laborHours: number;
      laborRate: number;
    };
    quantity: number;
    laborHours: number;
    laborRate: number;
  }>;
  notes?: string;
  discount?: number;
  createdAt: string;
}

export default function JobCardsPage() {
  const { t } = useTranslation('common');
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  useEffect(() => {
    fetchJobCards();

    // Real-time job card updates
    const handleJobCardCreated = (jobCard: any) => {
      setJobCards(prev => [jobCard, ...prev]);
    };

    const handleJobCardStatusUpdated = (updatedJobCard: any) => {
      setJobCards(prev => 
        prev.map(jobCard => 
          jobCard._id === updatedJobCard._id ? updatedJobCard : jobCard
        )
      );
    };

    const handleJobCardProgressUpdated = (updatedJobCard: any) => {
      setJobCards(prev => 
        prev.map(jobCard => 
          jobCard._id === updatedJobCard._id ? updatedJobCard : jobCard
        )
      );
    };

    // Generic update handler for backward compatibility
    const handleUpdateJobs = () => {
      fetchJobCards();
    };

    // Register event listeners
    socketService.onJobCardCreated(handleJobCardCreated);
    socketService.onJobCardStatusUpdated(handleJobCardStatusUpdated);
    socketService.onJobCardProgressUpdated(handleJobCardProgressUpdated);
    socketService.onUpdateJobs(handleUpdateJobs);

    return () => {
      // Cleanup event listeners
      socketService.off('jobcard_created', handleJobCardCreated);
      socketService.off('jobcard_status_updated', handleJobCardStatusUpdated);
      socketService.off('jobcard_progress_updated', handleJobCardProgressUpdated);
      socketService.off('update-jobs', handleUpdateJobs);
    };
  }, []);

  const fetchJobCards = async () => {
    try {
      const response = await fetch("/api/job-cards");
      if (response.ok) {
        const data = await response.json();
        // API returns { jobCards: [], pagination: {} } format
        setJobCards(Array.isArray(data) ? data : (data.jobCards || []));
      }
    } catch (error) {
      setJobCards([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredJobCards = jobCards.filter((jobCard) => {
    const matchesSearch =
      `${jobCard.customerId.firstName} ${jobCard.customerId.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      `${jobCard.vehicleId.year} ${jobCard.vehicleId.make} ${jobCard.vehicleId.model}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      jobCard.vehicleId.licensePlate
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      jobCard.services.some(service => 
        service.serviceId.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? jobCard.status === "pending" || jobCard.status === "in-progress"
        : jobCard.status === statusFilter;

    return matchesSearch && matchesStatus;
  });


  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/job-cards/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedJobCard = await response.json();
        setJobCards(
          jobCards.map((jc) =>
            jc._id === id
              ? { ...jc, status: updatedJobCard.jobCard.status }
              : jc
          )
        );
      }
    } catch (error) {
    }
  };

  const handleDeleteJobCard = async (id: string) => {
    if (!confirm(t("job_cards.delete_confirmation"))) {
      return;
    }

    try {
      const response = await fetch(`/api/job-cards/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setJobCards(jobCards.filter((jc) => jc._id !== id));
        alert(t("job_cards.delete_success"));
      } else {
        const error = await response.json();
        alert(error.error || t("job_cards.failed_to_delete"));
      }
    } catch (error) {
      alert(t("job_cards.failed_to_delete"));
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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      <ResponsiveJobCardsGrid
        jobCards={filteredJobCards}
        onStatusChange={handleStatusChange}
        onDeleteJobCard={handleDeleteJobCard}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
      />
    </motion.div>
  );
}