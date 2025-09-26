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
  Calendar,
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
  User,
  Wrench,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/dashboard/LanguageSwitcher";
import { NotificationBell } from "@/components/dashboard/NotificationBell";

// Icon mapping for dynamic navigation
const iconMap = {
  LayoutDashboard,
  Users,
  Car,
  Calendar,
  ClipboardList,
  FileText,
  Package,
  Search,
  CreditCard,
  BarChart3,
  Settings,
  Wrench,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useSession();
  const { t } = useTranslation("common");

  // Get role-based navigation items
  const userRole = (user as any)?.role || "mechanic";
  const navigation = getNavigationItems(userRole);

  useEffect(() => {
    socket.connect();
    console.log("Connecting to socket...");

    return () => {
      socket.disconnect();
      console.log("Disconnecting from socket...");
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 start-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">TeraMotors</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                return (
                  <li key={item.tKey}>
                    <Link
                      href={item.href}
                      className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                        pathname === item.href
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
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
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto bg-white shadow-lg">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">TeraMotors</h1>
          </div>
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                return (
                  <li key={item.tKey}>
                    <Link
                      href={item.href}
                      className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                        pathname === item.href
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {t(item.tKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ps-64">
        <ToastProvider />
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <LanguageSwitcher />
              <NotificationBell />

              <div className="flex items-center gap-x-2">
                <div className="flex items-center gap-x-2">
                  <User className="h-6 w-6 text-gray-400" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {t(`roles.${userRole}.name`)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-x-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                  {t("header.sign_out")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}