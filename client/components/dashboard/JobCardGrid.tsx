"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ClipboardList, User, Car, Wrench, Clock } from "lucide-react";
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";

interface JobCard {
  _id: string;
  customer: {
    fullName: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
  };
  services: {
    service: {
      name: string;
    };
  }[];
  status: string;
  createdAt: string;
}

export default function JobCardGrid() {
  const { t } = useTranslation("common");
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobCards = async () => {
      try {
        const response = await fetch("/api/job-cards/recent");
        if (response.ok) {
          const data = await response.json();
          setJobCards(data);
        }
      } catch (error) {
        console.error("Failed to fetch recent job cards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobCards();

    socket.on("update-jobs", () => {
      fetchJobCards();
    });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="flex justify-between items-center mt-4">
              <div className="h-6 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (jobCards.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t("job_cards.no_active_job_cards")}
        </h3>
        <p className="text-gray-500">
          {t("job_cards.no_active_job_cards_description")}
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "created":
      case "draft":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      case "in_progress":
      case "in progress":
        return "bg-gradient-to-r from-[#F13F33] to-[#d6352a] text-white";
      case "completed":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white";
      case "invoiced":
        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white";
      case "pending":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "created":
      case "draft":
        return t("status.created");
      case "in_progress":
      case "in progress":
        return t("status.in_progress");
      case "completed":
        return t("status.completed");
      case "invoiced":
        return t("status.invoiced");
      case "pending":
        return t("status.pending");
      default:
        return status;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {jobCards.map((jobCard) => (
        <Link href={`/job-cards/${jobCard._id}`} key={jobCard._id}>
          <div className="group bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-200 hover:border-gray-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#063479] rounded-lg flex items-center justify-center me-3">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {jobCard.customer.fullName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {t("job_cards.customer")}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(
                  jobCard.status
                )}`}
              >
                {getStatusLabel(jobCard.status)}
              </span>
            </div>

            {/* Vehicle Info */}
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center mr-2">
                <Car className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {jobCard.vehicle.year} {jobCard.vehicle.make}
                </p>
                <p className="text-xs text-gray-600">{jobCard.vehicle.model}</p>
              </div>
            </div>

            {/* Services */}
            <div className="mb-3">
              <div className="flex items-center mb-2">
                <div className="w-5 h-5 bg-[#F13F33] rounded-md flex items-center justify-center mr-2">
                  <Wrench className="w-3 h-3 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-700">
                  {t("job_cards.services_label")}
                </p>
              </div>
              <div className="space-y-1">
                {jobCard.services.slice(0, 3).map((service, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-[#F13F33] rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600 truncate">
                      {service.service.name}
                    </span>
                  </div>
                ))}
                {jobCard.services.length > 3 && (
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-500">
                      {t("job_cards.and_more", {
                        count: jobCard.services.length - 3,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                <span>{new Date(jobCard.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-xs font-medium text-[#063479] group-hover:text-[#F13F33] transition-colors">
                <span>{t("job_cards.view")}</span>
                <svg
                  className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
