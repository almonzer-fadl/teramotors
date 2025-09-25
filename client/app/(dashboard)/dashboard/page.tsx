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
} from "lucide-react";
import JobCardGrid from "@/components/dashboard/JobCardGrid";
import { socketService } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";

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
  const { data: session, status } = useSession();
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
    if (status === 'unauthenticated') {
      window.location.href = '/login';
      return;
    }
  }, [status]);

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
  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("dashboard.title")}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{t("dashboard.welcome")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${card.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ms-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {card.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t("dashboard.quick_actions")}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/customers/new"
              className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Users className="me-2 h-4 w-4" />
              {t("dashboard.add_customer")}
            </Link>
            <Link
              href="/vehicles/new"
              className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Car className="me-2 h-4 w-4" />
              {t("dashboard.add_vehicle")}
            </Link>
            <Link
              href="/inspections/new"
              className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Search className="me-2 h-4 w-4" />
              {t("dashboard.create_inspection")}
            </Link>
            <Link
              href="/job-cards/new"
              className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ClipboardList className="me-2 h-4 w-4" />
              {t("dashboard.create_job_card")}
            </Link>
          </div>
        </div>
      </div>

      {/* Active Job Cards */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t("dashboard.active_job_cards")}
          </h3>
          <JobCardGrid />
        </div>
      </div>
    </div>
  );
}
