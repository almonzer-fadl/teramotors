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
import { socket } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";

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
    // Fetch dashboard stats

    console.log("you entered dashboard");
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    for (let ev in eventNames) {
      socket.on(ev, () => {
        console.log(`[${ev}] was triggered, fetching stats`);
        fetchStats();
      });
    }
    return () => {
      for (let ev in eventNames) {
        socket.off(ev);
      }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
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
                <div className="ml-4 w-0 flex-1">
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
              <Users className="mr-2 h-4 w-4" />
              {t("dashboard.add_customer")}
            </Link>
            <Link
              href="/vehicles/new"
              className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Car className="mr-2 h-4 w-4" />
              {t("dashboard.add_vehicle")}
            </Link>
            <Link
              href="/inspections/new"
              className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Search className="mr-2 h-4 w-4" />
              {t("dashboard.create_inspection")}
            </Link>
            <Link
              href="/job-cards/new"
              className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
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
