"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Car,
  Calendar,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  Search,
  Zap,
} from "lucide-react";
import JobCardGrid from "@/components/dashboard/JobCardGrid";
import { socketService } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/hooks/useSession";

interface DashboardStats {
  totalCustomers: number;
  totalVehicles: number;
  pendingAppointments: number;
  activeJobCards: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  avgJobTime: number;
  lowStockParts: number;
}

export default function DashboardPage() {
  const { t } = useTranslation("common");
  const { user, isLoading, isAuthenticated } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalVehicles: 0,
    pendingAppointments: 0,
    activeJobCards: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    avgJobTime: 0,
    lowStockParts: 0,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login';
      return;
    }
  }, [isLoading, isAuthenticated]);

  const eventNames = [
    "update-jobs",
    "update-inspections",
    "update-parts",
    "update-appointments",
    "update-customers",
    "update-estimates",
    "update-services",
    "update-vehicles",
  ];

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats regardless of authentication status
    // The API will handle authentication internally

    console.log("you entered dashboard");
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats", {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else if (response.status === 401) {
          console.error("Unauthorized access to dashboard stats");
          // Redirect to login or show error
        } else {
          console.error("Failed to fetch dashboard stats:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Real-time dashboard updates
    const handleDashboardStatsUpdated = (stats: any) => {
      setStats(stats);
    };

    // Generic update handlers for backward compatibility
    const updateHandlers = eventNames.map(ev => {
      const handler = () => {
        fetchStats();
        console.log(`[${ev}] was triggered, fetching stats`);
      };
      return { event: ev, handler };
    });

    // Register event listeners
    socketService.onDashboardStatsUpdated(handleDashboardStatsUpdated);
    updateHandlers.forEach(({ event, handler }) => {
      socketService.on(event, handler);
    });

    return () => {
      // Cleanup event listeners
      socketService.off('dashboard_stats_updated', handleDashboardStatsUpdated);
      updateHandlers.forEach(({ event, handler }) => {
        socketService.off(event, handler);
      });
    };
  }, []);

  const statCards = [
    {
      title: t("dashboard.total_customers"),
      value: stats.totalCustomers,
      icon: Users,
      color: "bg-blue-500",
      href: "/customers",
    },
    {
      title: t("dashboard.total_vehicles"),
      value: stats.totalVehicles,
      icon: Car,
      color: "bg-green-500",
      href: "/vehicles",
    },
    {
      title: t("dashboard.pending_appointments"),
      value: stats.pendingAppointments,
      icon: Calendar,
      color: "bg-yellow-500",
      href: "/appointments",
    },
    {
      title: t("dashboard.active_job_cards"),
      value: stats.activeJobCards,
      icon: ClipboardList,
      color: "bg-purple-500",
      href: "/job-cards",
    },
    {
      title: t("dashboard.monthly_revenue"),
      value: `${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-emerald-500",
      href: "/reports",
    },
    {
      title: t("dashboard.revenue_growth"),
      value: `${stats.revenueGrowth > 0 ? "+" : ""}${stats.revenueGrowth}%`,
      icon: TrendingUp,
      color: stats.revenueGrowth >= 0 ? "bg-green-500" : "bg-red-500",
      href: "/reports",
    },
    {
      title: t("dashboard.avg_job_time"),
      value: `${stats.avgJobTime}h`,
      icon: Clock,
      color: "bg-indigo-500",
      href: "/job-cards",
    },
    {
      title: t("dashboard.low_stock_parts"),
      value: stats.lowStockParts,
      icon: AlertTriangle,
      color: "bg-orange-500",
      href: "/inventory",
    },
  ];

  // Show loading while session is loading or data is loading
  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t("dashboard.title")}
                </h1>
                <p className="mt-2 text-lg text-gray-600">{t("dashboard.welcome")}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Welcome back</p>
                  <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
                </div>
                <div className="w-12 h-12 bg-[#F13F33] rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-xl p-3 bg-[#F13F33] group-hover:bg-[#d6352a] transition-colors">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {card.value}
                    </p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#063479]/10 to-transparent rounded-bl-3xl"></div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-white to-gray-50/80 rounded-3xl shadow-2xl mb-8 border border-gray-100/50">
          <div className="px-8 py-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center mr-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                {t("dashboard.quick_actions")}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/customers/new"
                className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 p-6 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {t("dashboard.add_customer")}
                  </h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    Add new customer to system
                  </p>
                </div>
              </Link>
              <Link
                href="/vehicles/new"
                className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 p-6 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Car className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    {t("dashboard.add_vehicle")}
                  </h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    Register new vehicle
                  </p>
                </div>
              </Link>
              <Link
                href="/inspections/new"
                className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 p-6 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#F13F33]/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Search className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#F13F33] transition-colors">
                    {t("dashboard.create_inspection")}
                  </h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    Start vehicle inspection
                  </p>
                </div>
              </Link>
              <Link
                href="/job-cards/new"
                className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 p-6 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#063479]/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#063479] to-[#052a5f] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <ClipboardList className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#063479] transition-colors">
                    {t("dashboard.create_job_card")}
                  </h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    Create new work order
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Active Job Cards */}
        <div className="bg-gradient-to-br from-white to-gray-50/80 rounded-3xl shadow-2xl border border-gray-100/50">
          <div className="px-8 py-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#063479] to-[#052a5f] rounded-2xl flex items-center justify-center mr-4">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                {t("dashboard.active_job_cards")}
              </h3>
            </div>
            <JobCardGrid />
          </div>
        </div>
      </div>
    </div>
  );
}
