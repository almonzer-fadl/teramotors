'use client';

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
  const { t } = useTranslation('common');
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
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
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
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          {t('job_cards.no_active_job_cards')}
        </h3>
        <p className="text-gray-500">
          {t('job_cards.no_active_job_cards_description')}
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case t('status.created'):
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
      case t('status.in_progress'):
        return "bg-gradient-to-r from-[#F13F33] to-[#d6352a] text-white";
      case t('status.completed'):
        return "bg-gradient-to-r from-green-500 to-green-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobCards.map((jobCard) => (
        <Link href={`/job-cards/${jobCard._id}`} key={jobCard._id}>
          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-500 hover:-translate-y-2">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 to-purple-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative p-6 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#063479] to-[#052a5f] rounded-2xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-[#063479] transition-colors">
                      {jobCard.customer.fullName}
                    </h3>
                    <p className="text-sm text-gray-500">Customer</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-2 text-xs font-bold rounded-2xl shadow-lg ${getStatusColor(
                    jobCard.status
                  )}`}
                >
                  {jobCard.status}
                </span>
              </div>

              {/* Vehicle Info */}
              <div className="flex items-center bg-gray-50 rounded-2xl p-4 mb-4 group-hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {jobCard.vehicle.year} {jobCard.vehicle.make}
                  </p>
                  <p className="text-sm text-gray-600">{jobCard.vehicle.model}</p>
                </div>
              </div>

              {/* Services */}
              <div className="flex-grow">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-xl flex items-center justify-center mr-2">
                    <Wrench className="w-4 h-4 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900">{t('job_cards.services_label')}</p>
                </div>
                <div className="space-y-2">
                  {jobCard.services.slice(0, 2).map((service, index) => (
                    <div key={index} className="flex items-center bg-white rounded-xl p-3 border border-gray-200 group-hover:border-gray-300 transition-colors">
                      <div className="w-2 h-2 bg-[#F13F33] rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {service.service.name}
                      </span>
                    </div>
                  ))}
                  {jobCard.services.length > 2 && (
                    <div className="flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                      <span className="text-xs font-medium text-gray-500">
                        {t('job_cards.and_more', { count: jobCard.services.length - 2 })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{new Date(jobCard.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm font-medium text-[#063479] group-hover:text-[#F13F33] transition-colors">
                  <span>View Details</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}