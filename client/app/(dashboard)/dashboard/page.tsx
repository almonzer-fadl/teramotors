"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
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
  Wrench,
  Settings,
  MessageCircle,
  Plus,
  ArrowRight,
} from "lucide-react";
import JobCardGrid from "@/components/dashboard/JobCardGrid";
import ModernDashboardWidget from "@/components/dashboard/ModernDashboardWidget";
import { socketService } from "@/lib/services/socket";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/hooks/useSession";
import { launchDashboardTour } from "@/components/dashboard/Tour";

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

// Page transition variants
const pageVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const sectionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

// Loading spinner component
const LoadingSpinner = () => (
  <motion.div
    className="flex flex-col items-center justify-center h-64"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-[#F97402] rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
    <motion.p
      className="mt-4 text-sm text-gray-500 dark:text-gray-400"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      Loading dashboard...
    </motion.p>
  </motion.div>
);

export default function DashboardPage() {
  const { t } = useTranslation("common");
  const { user, isLoading, isAuthenticated } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAdmin = user?.role === 'admin';
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
  const [showWelcomeCard, setShowWelcomeCard] = useState(false);
  const [taskCompletion, setTaskCompletion] = useState<Record<string, boolean>>({});
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
  const welcomeTasks = useMemo(() => [
    {
      id: 'profile',
      icon: Settings,
      title: t('dashboard_welcome.tasks.profile.title'),
      description: t('dashboard_welcome.tasks.profile.description'),
      actionLabel: t('dashboard_welcome.tasks.profile.action'),
      href: '/settings/organization'
    },
    {
      id: 'customer',
      icon: Users,
      title: t('dashboard_welcome.tasks.customer.title'),
      description: t('dashboard_welcome.tasks.customer.description'),
      actionLabel: t('dashboard_welcome.tasks.customer.action'),
      href: '/customers/new'
    },
    {
      id: 'jobcard',
      icon: ClipboardList,
      title: t('dashboard_welcome.tasks.jobcard.title'),
      description: t('dashboard_welcome.tasks.jobcard.description'),
      actionLabel: t('dashboard_welcome.tasks.jobcard.action'),
      href: '/job-cards/new'
    }
  ], [t]);
  const allTasksComplete = welcomeTasks.every(task => taskCompletion[task.id]);

  const handleToggleTask = (id: string) => {
    setTaskCompletion(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSkipWelcome = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard-welcome-dismissed', 'true');
    }
    setShowWelcomeCard(false);
  };

  useEffect(() => {
    if (isLoading) return;
    if (typeof window === 'undefined') return;
    const storedTasks = localStorage.getItem('dashboard-welcome-tasks');
    if (storedTasks) {
      try {
        setTaskCompletion(JSON.parse(storedTasks));
      } catch (err) {
        console.error("Failed to parse welcome tasks", err);
      }
    }
  }, [isLoading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('dashboard-welcome-tasks', JSON.stringify(taskCompletion));
  }, [taskCompletion]);

  useEffect(() => {
    if (allTasksComplete && showWelcomeCard) {
      handleSkipWelcome();
    }
  }, [allTasksComplete]);

  useEffect(() => {
    if (isLoading) return;
    if (typeof window === 'undefined') return;
    const welcomeFlag = searchParams?.get('welcome');
    const dismissed = localStorage.getItem('dashboard-welcome-dismissed') === 'true';

    if (welcomeFlag === '1') {
      if (!dismissed) {
        setShowWelcomeCard(true);
        launchDashboardTour();
      }
      const params = new URLSearchParams(searchParams.toString());
      params.delete('welcome');
      const query = params.toString();
      router.replace(`/dashboard${query ? `?${query}` : ''}`);
    }
  }, [searchParams, router, isLoading]);

  useEffect(() => {
    // Only fetch stats and generate tiles when user session is loaded
    if (isLoading) return;

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
          const baseTiles = [
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
              title: t('dashboard_missing.modern_widget.job_cards'),
              titleEn: 'Job Cards',
              icon: ClipboardList,
              color: 'bg-purple-600',
              count: '',
              route: '/job-cards'
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
              title: t('dashboard_missing.modern_widget.service_reminders'),
              titleEn: 'Services',
              icon: Wrench,
              color: 'bg-blue-700',
              count: '',
              route: '/services'
            }
          ];

          const adminOnlyTiles = [
            {
              title: t('dashboard_missing.modern_widget.accounting'),
              titleEn: 'Invoices',
              icon: BarChart3,
              color: 'bg-orange-500',
              count: '',
              route: '/invoices'
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
              title: t('dashboard_missing.modern_widget.reports'),
              titleEn: 'Reports',
              icon: TrendingUp,
              color: 'bg-blue-800',
              count: '',
              route: '/reports'
            },
            {
              title: t('dashboard_missing.modern_widget.whatsapp'),
              titleEn: 'WhatsApp',
              icon: MessageCircle,
              color: 'bg-green-500',
              count: '',
              route: '/whatsapp'
            },
            {
              title: t('dashboard_missing.modern_widget.settings'),
              titleEn: 'Settings',
              icon: Settings,
              color: 'bg-gray-600',
              count: '',
              route: '/settings'
            }
          ];

          const tiles = isAdmin ? [...baseTiles, ...adminOnlyTiles] : baseTiles;

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
  }, [isLoading, isAdmin]);

  // Show loading while session is loading or data is loading
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Modern Dashboard Navigation */}
      <motion.div className="mb-10" variants={sectionVariants}>
        <ModernDashboardWidget
          tiles={modernWidgetData.tiles}
        />
      </motion.div>

      {showWelcomeCard && !allTasksComplete && (
        <motion.div
          className="mb-10 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-xl shadow-gray-200/40 dark:shadow-none"
          variants={sectionVariants}
          initial="initial"
          animate="animate"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">{t('dashboard_welcome.badge')}</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{t('dashboard_welcome.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300">{t('dashboard_welcome.subtitle')}</p>
            </div>
            <button
              onClick={handleSkipWelcome}
              className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              {t('dashboard_welcome.skip')}
            </button>
          </div>
          <div className="grid gap-4">
            {welcomeTasks.map(task => {
              const Icon = task.icon;
              const done = !!taskCompletion[task.id];
              return (
                <div key={task.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${done ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{task.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                            done
                              ? 'border-emerald-500/40 text-emerald-600 bg-emerald-500/10'
                              : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary'
                          }`}
                        >
                          {done ? t('dashboard_welcome.completed') : t('dashboard_welcome.mark_done')}
                        </button>
                        <Link
                          href={task.href}
                          className="text-xs font-semibold text-primary hover:text-[#F13F33] inline-flex items-center gap-1"
                        >
                          {task.actionLabel}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Active Job Cards Section */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden"
        variants={sectionVariants}
      >
        {/* Section Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-[#063479] to-[#052a5f] rounded-2xl flex items-center justify-center shadow-lg shadow-[#063479]/25"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <ClipboardList className="w-6 h-6 text-white" />
              </motion.div>
              <div className="ms-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("dashboard.active_job_cards")}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your workshop tasks
                </p>
              </div>
            </div>
            <Link href="/job-cards/new">
              <motion.button
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white text-sm font-semibold rounded-xl shadow-lg shadow-[#F97402]/25
                           hover:shadow-xl hover:shadow-[#F97402]/30 transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4 me-2" />
                {t("dashboard.create_job_card")}
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Job Cards Content */}
        <div className="p-6">
          <JobCardGrid />
        </div>

        {/* View All Link */}
        <motion.div
          className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/job-cards">
            <motion.div
              className="flex items-center justify-center text-sm font-semibold text-[#063479] dark:text-blue-400 hover:text-[#F97402] transition-colors"
              whileHover={{ x: 5 }}
            >
              <span>View all job cards</span>
              <ArrowRight className="w-4 h-4 ms-2" />
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
