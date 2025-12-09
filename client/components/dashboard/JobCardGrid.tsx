"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, User, Car, Wrench, Clock, ArrowRight } from "lucide-react";
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

// Shimmer skeleton component
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 overflow-hidden relative">
    {/* Shimmer overlay */}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 dark:via-gray-700/60 to-transparent" />

    {/* Header skeleton */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="ms-3">
          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-1.5" />
          <div className="h-3 w-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
    </div>

    {/* Vehicle skeleton */}
    <div className="flex items-center mb-4">
      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      <div className="ms-2">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
        <div className="h-3 w-20 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </div>

    {/* Services skeleton */}
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ms-2" />
      </div>
      <div className="space-y-2 ms-8">
        <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </div>

    {/* Footer skeleton */}
    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  </div>
);

// Empty state component
const EmptyState = ({ t }: { t: (key: string) => string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-10 text-center border border-gray-200/50 dark:border-gray-700"
  >
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      className="w-16 h-16 bg-gradient-to-br from-[#063479] to-[#052a5f] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
    >
      <ClipboardList className="h-8 w-8 text-white" />
    </motion.div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {t("job_cards.no_active_job_cards")}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
      {t("job_cards.no_active_job_cards_description")}
    </p>
  </motion.div>
);

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "created":
      case "draft":
        return "bg-gradient-to-r from-blue-500 to-blue-600";
      case "in_progress":
      case "in progress":
        return "bg-gradient-to-r from-[#F97402] to-[#F13F33]";
      case "completed":
        return "bg-gradient-to-r from-emerald-500 to-green-600";
      case "invoiced":
        return "bg-gradient-to-r from-purple-500 to-purple-600";
      case "pending":
        return "bg-gradient-to-r from-amber-500 to-yellow-600";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600";
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (jobCards.length === 0) {
    return <EmptyState t={t} />;
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {jobCards.map((jobCard) => (
          <motion.div
            key={jobCard._id}
            variants={cardVariants}
            layout
          >
            <Link href={`/job-cards/${jobCard._id}`}>
              <motion.div
                className="group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700
                           hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300
                           hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50"
                whileHover={{
                  y: -4,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#063479] to-[#052a5f] rounded-xl flex items-center justify-center shadow-md">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="ms-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {jobCard.customer.fullName}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t("job_cards.customer")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg text-white shadow-sm ${getStatusColor(
                      jobCard.status
                    )}`}
                  >
                    {getStatusLabel(jobCard.status)}
                  </span>
                </div>

                {/* Vehicle Info */}
                <div className="flex items-center mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Car className="w-4 h-4 text-white" />
                  </div>
                  <div className="ms-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {jobCard.vehicle.year} {jobCard.vehicle.make}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{jobCard.vehicle.model}</p>
                  </div>
                </div>

                {/* Services */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-[#F97402] to-[#F13F33] rounded-lg flex items-center justify-center shadow-sm">
                      <Wrench className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 ms-2">
                      {t("job_cards.services_label")}
                    </p>
                  </div>
                  <div className="space-y-1.5 ms-8">
                    {jobCard.services.slice(0, 3).map((service, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-[#F97402] to-[#F13F33] rounded-full" />
                        <span className="text-xs text-gray-600 dark:text-gray-400 ms-2 truncate">
                          {service.service.name}
                        </span>
                      </div>
                    ))}
                    {jobCard.services.length > 3 && (
                      <div className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        <span className="text-xs text-gray-500 dark:text-gray-500 ms-2">
                          {t("job_cards.and_more", {
                            count: jobCard.services.length - 3,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5 me-1.5" />
                    <span>{new Date(jobCard.createdAt).toLocaleDateString()}</span>
                  </div>
                  <motion.div
                    className="flex items-center text-xs font-semibold text-[#063479] dark:text-blue-400 group-hover:text-[#F97402] transition-colors"
                    whileHover={{ x: 3 }}
                  >
                    <span>{t("job_cards.view")}</span>
                    <ArrowRight className="w-3.5 h-3.5 ms-1 group-hover:translate-x-0.5 transition-transform" />
                  </motion.div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
