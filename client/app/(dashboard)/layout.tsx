/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import { signOut } from "@/lib/simple-auth-client";
import Breadcrumbs from "@/components/dashboard/Breadcrumbs";
import ToastProvider from "@/components/dashboard/ToastProvider";
import { getNavigationItems } from "@/lib/roles";
import { socket } from "@/lib/services/socket";
import {
  LayoutDashboard,
  Users,
  Car,
  ClipboardList,
  FileText,
  Package,
  Search,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Wrench,
  MessageSquare,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/dashboard/LanguageSwitcher";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useReferenceData } from "@/lib/stores/referenceDataStore";

// Icon mapping for dynamic navigation
const iconMap = {
  LayoutDashboard,
  Users,
  Car,
  ClipboardList,
  FileText,
  Package,
  Search,
  CreditCard,
  BarChart3,
  Settings,
  Wrench,
  MessageSquare,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(pathname === '/dashboard');
  const { user } = useSession();
  const { t } = useTranslation("common");

  // Get role-based navigation items
  const userRole = (user as any)?.role || "mechanic";
  const navigation = getNavigationItems(userRole);

  // Initialize global reference data cache
  const {
    fetchCustomers,
    fetchVehicles,
    fetchServices,
    fetchParts,
  } = useReferenceData();

  // Auto-collapse sidebar on dashboard
  useEffect(() => {
    setSidebarCollapsed(pathname === '/dashboard');
  }, [pathname]);

  useEffect(() => {
    socket.connect();
    console.log("Connecting to socket...");

    return () => {
      socket.disconnect();
      console.log("Disconnecting from socket...");
    };
  }, []);

  // Pre-load reference data on mount (cache will prevent duplicate requests)
  useEffect(() => {
    if (user) {
      // Fetch all reference data in parallel on dashboard load
      Promise.all([
        fetchCustomers(),
        fetchVehicles(),
        fetchServices(),
        fetchParts(),
      ]).catch((error) => {
        console.error("Error pre-loading reference data:", error);
      });
    }
  }, [user, fetchCustomers, fetchVehicles, fetchServices, fetchParts]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900/90"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 start-0 flex w-72 flex-col bg-white dark:bg-gray-900 shadow-2xl">
          <div className="flex h-20 items-center justify-between px-6 bg-gradient-to-r from-[#063479] to-[#052a5f]">
            <div className="flex items-center">
              <img 
                src="/icon.png" 
                alt={t('ui.teramotors_logo')} 
                className="w-12 h-12 rounded-xl mr-3 object-contain bg-white p-1"
              />
              <div className="flex flex-col">
                  <span className="flex items-center space-x-2">
                    <span className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm font-logo" style={{ letterSpacing: '0.04em' }}>
                      Tera
                      <span className="text-[#F13F33]">Motors</span>
                    </span>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-white bg-blue-900/40 rounded px-2 py-0.5 mt-1 self-start shadow-sm" style={{ letterSpacing: '0.15em' }}>
                    Auto Repair
                  </span>
                </div>
              
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-6 py-6">
            <ul className="space-y-3">
              {navigation.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                return (
                  <li key={item.tKey}>
                    <Link
                      href={item.href}
                      className={`flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                        pathname === item.href
                          ? "bg-[#F13F33] text-white shadow-lg dark:bg-[#F97402]"
                          : "text-gray-700 hover:bg-gray-100 hover:text-[#F13F33] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[#F97402]"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {t(item.tKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* User profile and sign out at bottom */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-x-3 mb-4">
              <div className="w-10 h-10 bg-[#F13F33] rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t(`roles.${userRole}.name`)}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                signOut();
                setSidebarOpen(false);
              }}
              className="flex items-center gap-x-2 text-sm text-gray-500 hover:text-[#F13F33] transition-colors font-medium w-full dark:text-gray-400 dark:hover:text-[#F97402]"
            >
              <LogOut className="h-4 w-4" />
              {t("header.sign_out")}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'lg:w-0 lg:opacity-0 lg:pointer-events-none' : 'lg:w-72'
      }`}>
        <div className="flex flex-grow flex-col overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl">
          <div className="flex h-20 items-center px-6 bg-gradient-to-r from-[#063479] to-[#052a5f]">
            <div className="flex items-center">
              <img 
                src="/icon.png" 
                alt={t('ui.teramotors_logo')} 
                className="w-12 h-12 rounded-xl mr-3 object-contain bg-white p-1"
              />
              {!sidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="flex items-center space-x-2">
                    <span className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm font-logo" style={{ letterSpacing: '0.04em' }}>
                      Tera
                      <span className="text-[#F13F33]">Motors</span>
                    </span>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-white bg-blue-900/40 rounded px-2 py-0.5 mt-1 self-start shadow-sm" style={{ letterSpacing: '0.15em' }}>
                    Auto Repair
                  </span>
                </div>
              )}
            </div>
          </div>
          <nav className="flex-1 px-6 py-6">
            <ul className="space-y-3">
              {navigation.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                return (
                  <li key={item.tKey}>
                    <Link
                      href={item.href}
                      className={`flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                        pathname === item.href
                          ? "bg-[#F13F33] text-white shadow-lg dark:bg-[#F97402]"
                          : "text-gray-700 hover:bg-gray-100 hover:text-[#F13F33] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[#F97402]"
                      } ${sidebarCollapsed ? 'justify-center' : ''}`}
                      title={sidebarCollapsed ? t(item.tKey) : undefined}
                    >
                      <Icon className={`h-5 w-5 ${sidebarCollapsed ? '' : 'me-3'}`} />
                      {!sidebarCollapsed && t(item.tKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Desktop user profile at bottom of sidebar - only show when sidebar is expanded */}
          {!sidebarCollapsed && (
            <div className="hidden lg:block mt-auto p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#F13F33] rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t(`roles.${userRole}.name`)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#F13F33] transition-colors font-medium w-full dark:text-gray-400 dark:hover:text-[#F97402]"
              >
                <LogOut className="h-4 w-4" />
                {t("header.sign_out")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ps-0' : 'lg:ps-72'}`}>
        <ToastProvider />
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            type="button"
            className="hidden lg:block -m-2.5 p-2.5 text-gray-700 hover:text-[#F13F33] transition-colors dark:text-gray-300 dark:hover:text-[#F97402]"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <LanguageSwitcher />
              <ThemeToggle />
              <NotificationBell />

              {/* Desktop user profile - only show when sidebar is collapsed */}
              {sidebarCollapsed && (
                <div className="hidden lg:flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F13F33] rounded-xl flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user?.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t(`roles.${userRole}.name`)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#F13F33] transition-colors font-medium dark:text-gray-400 dark:hover:text-[#F97402]"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("header.sign_out")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="dark:bg-gray-950">
          <div className="mx-auto max-w-7xl">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}