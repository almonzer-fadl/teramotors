/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Breadcrumbs from "@/components/dashboard/Breadcrumbs";
import { Loader2 } from 'lucide-react';
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/dashboard/LanguageSwitcher";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import DashboardThemeProvider from "./DashboardThemeProvider";
import Sidebar from "@/components/dashboard/Sidebar"; 
import TopBarLogo from "@/components/dashboard/TopBarLogo"; 
import StaticSidebarToggle from "@/components/dashboard/StaticSidebarToggle";
import { SidebarProvider, useSidebar } from "@/lib/contexts/SidebarContext";
import AdminHeader from "@/components/dashboard/AdminHeader";
import { useSession } from "@/lib/hooks/useSession";
import Tour from "@/components/dashboard/Tour";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const [onboardingState, setOnboardingState] = useState<{completed: boolean, step: number} | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useSession(); // Get isLoading state
  const { setSidebarOpen } = useSidebar();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (user && user.tenantId && !isSuperAdmin) {
      const fetchOnboardingStatus = async () => {
          try {
              const response = await fetch('/api/settings/company-profile');
              if (response.ok) {
                  const data = await response.json();
                  const onboarding = data.settings?.onboardingState;
                  if(onboarding) {
                      setOnboardingState(onboarding);
                  }
              }
          } catch (error) {
              console.error("Failed to fetch onboarding status", error);
          }
      };
      fetchOnboardingStatus();
    }
  }, [user, isSuperAdmin]);

  useEffect(() => {
    if (!isSuperAdmin && onboardingState && !onboardingState.completed && pathname !== '/onboarding') {
        router.replace('/onboarding');
    }

    if (pathname === '/dashboard' || pathname === '/admin') {
      const timer1 = setTimeout(() => {
          setSidebarOpen(true);
          const timer2 = setTimeout(() => {
              setSidebarOpen(false);
          }, 1000);
          return () => clearTimeout(timer2);
      }, 500);
      return () => clearTimeout(timer1);
    }
  }, [onboardingState, pathname, router, isSuperAdmin, setSidebarOpen]);

  // Render a loading screen while session is being fetched
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100/50 dark:bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-gray-100/50 dark:bg-black">
        <div className="flex flex-col min-h-screen">
          {isSuperAdmin ? (
            <AdminHeader />
          ) : (
            <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg px-4 sm:gap-x-6 sm:px-6 lg:px-8">
              <div className="flex h-16 flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
                  <StaticSidebarToggle />
                  <div id="tour-step-1-logo" className="pl-4">
                      <TopBarLogo />
                  </div>
                  <div className="flex-1"></div>
                  <div className="flex items-center gap-x-4 lg:gap-x-6">
                      <Tour />
                      <LanguageSwitcher />
                      <div id="tour-step-2-theme-toggle">
                          <ThemeToggle />
                      </div>
                      <NotificationBell />
                  </div>
              </div>
            </header>
          )}

          <main className="py-10 flex-1">
            <div className="px-4 sm:px-6 lg:px-8">
              <Breadcrumbs />
              <div className="mt-4">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardThemeProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </DashboardThemeProvider>
    </SidebarProvider>
  );
}
