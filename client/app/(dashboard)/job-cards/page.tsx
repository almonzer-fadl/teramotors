'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import ResponsiveJobCardsGrid from "@/components/ui/ResponsiveJobCardsGrid";
import { socketService } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";

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
  createdAt: string;
}

export default function JobCardsPage() {
  const { t } = useTranslation('common');
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
        setJobCards(data);
      }
    } catch (error) {
      console.error("Failed to fetch job cards:", error);
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
      statusFilter === "all" || jobCard.status === statusFilter;

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
      console.error("Failed to update job card status:", error);
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
    <ResponsiveJobCardsGrid
      jobCards={filteredJobCards}
      onStatusChange={handleStatusChange}
      searchTerm={searchTerm}
      statusFilter={statusFilter}
      onSearchChange={setSearchTerm}
      onStatusFilterChange={setStatusFilter}
    />
  );
}