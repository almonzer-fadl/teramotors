"use client";

import LanguageSwitcher from "@/components/dashboard/LanguageSwitcher";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import StaticAdminLogo from "./StaticAdminLogo";
import StaticSidebarToggle from "./StaticSidebarToggle";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg px-4 sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex h-16 flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center">
        <StaticSidebarToggle />
        <div className="ml-4">
          <StaticAdminLogo />
        </div>
      </div>
      <div className="flex-1"></div>
      <div className="flex items-center gap-x-4 lg:gap-x-6">
        <LanguageSwitcher />
        <ThemeToggle />
        <NotificationBell />
      </div>
      </div>
    </header>
  );
}
