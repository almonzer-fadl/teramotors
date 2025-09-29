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
  Package,
  BarChart3,
  FileText,
  CreditCard,
  Bell,
} from "lucide-react";
import JobCardGrid from "@/components/dashboard/JobCardGrid";
import ModernDashboardWidget from "@/components/dashboard/ModernDashboardWidget";
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

interface DashboardTile {
  title: string;
  titleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  count: number | string;
  route: string;
}

interface ModernWidgetData {
  tiles: DashboardTile[];
  activeJobCards: any[];
  stats: {
    created: number;
    wip: number;
    completed: number;
    dueAmount: string;
  };
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
  const [modernWidgetData, setModernWidgetData] = useState<ModernWidgetData>({
    tiles: [],
    activeJobCards: [],
    stats: {
      created: 0,
      wip: 0,
      completed: 0,
      dueAmount: '0'
    }
  });

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
          
          // Generate navigation tiles
          const tiles = [
            {
              title: t('dashboard_missing.modern_widget.clients'),
              titleEn: 'Clients',
              icon: Users,
              color: 'bg-blue-600',
              count: '',
              route: '/customers'
            },
            {
              title: t('dashboard_missing.modern_widget.vehicles'),
              titleEn: 'Vehicles',
              icon: Car,
              color: 'bg-pink-500',
              count: '',
              route: '/vehicles'
            },
            {
              title: t('dashboard_missing.modern_widget.inventory'),
              titleEn: 'Inventory',
              icon: Package,
              color: 'bg-green-600',
              count: '',
              route: '/inventory'
            },
            {
              title: t('dashboard_missing.modern_widget.accounting'),
              titleEn: 'Invoices',
              icon: BarChart3,
              color: 'bg-orange-500',
              count: '',
              route: '/invoices'
            },
            {
              title: t('dashboard_missing.modern_widget.job_cards'),
              titleEn: 'Job Cards',
              icon: ClipboardList,
              color: 'bg-purple-600',
              count: '',
              route: '/job-cards'
            },
            {
              title: t('dashboard_missing.modern_widget.invoices_estimates'),
              titleEn: 'Estimates',
              icon: FileText,
              color: 'bg-amber-600',
              count: '',
              route: '/estimates'
            },
            {
              title: t('dashboard_missing.modern_widget.payments'),
              titleEn: 'Payments',
              icon: CreditCard,
              color: 'bg-yellow-600',
              count: '',
              route: '/payments'
            },
            {
              title: t('dashboard_missing.modern_widget.inspections'),
              titleEn: 'Inspections',
              icon: Search,
              color: 'bg-indigo-600',
              count: '',
              route: '/inspections'
            },
            {
              title: t('dashboard_missing.modern_widget.appointments'),
              titleEn: 'Appointments',
              icon: Calendar,
              color: 'bg-cyan-600',
              count: '',
              route: '/appointments'
            },
            {
              title: t('dashboard_missing.modern_widget.time_tracking'),
              titleEn: 'Time Tracking',
              icon: Clock,
              color: 'bg-red-600',
              count: '',
              route: '/job-cards'
            },
            {
              title: t('dashboard_missing.modern_widget.service_reminders'),
              titleEn: 'Services',
              icon: Bell,
              color: 'bg-blue-700',
              count: '',
              route: '/services'
            },
            {
              title: t('dashboard_missing.modern_widget.reports'),
              titleEn: 'Reports',
              icon: TrendingUp,
              color: 'bg-blue-800',
              count: '',
              route: '/reports'
            }
          ];
          
          setModernWidgetData({
            tiles,
            activeJobCards: [],
            stats: {
              created: 0,
              wip: 0,
              completed: 0,
              dueAmount: '0'
            }
          });
        } else if (response.status === 401) {
          console.error(t('alerts.unauthorized_dashboard'));
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
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
      {/* Modern Dashboard Navigation */}
      <div className="mb-8">
        <ModernDashboardWidget 
          tiles={modernWidgetData.tiles}
        />
      </div>

      {/* Active Job Cards */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-[#063479] to-[#052a5f] rounded-xl flex items-center justify-center mr-3">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {t("dashboard.active_job_cards")}
              </h3>
            </div>
            <Link
              href="/job-cards/new"
              className="inline-flex items-center px-4 py-2 bg-[#F13F33] text-white text-sm font-medium rounded-lg hover:bg-[#d6352a] transition-colors duration-200"
            >
              <span className="text-lg mr-2">+</span>
              {t("dashboard.create_job_card")}
            </Link>
          </div>
        </div>
        <div className="p-6">
          <JobCardGrid />
        </div>
      </div>
    </div>
  );
}
