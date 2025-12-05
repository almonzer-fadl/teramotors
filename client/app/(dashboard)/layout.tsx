/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Breadcrumbs from "@/components/dashboard/Breadcrumbs";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/dashboard/LanguageSwitcher";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import DashboardThemeProvider from "./DashboardThemeProvider";
import Sidebar from "@/components/dashboard/Sidebar"; 
import TopBarLogo from "@/components/dashboard/TopBarLogo"; 
import DraggableSidebarToggle from "@/components/dashboard/DraggableSidebarToggle";
import Portal from "@/components/dashboard/Portal";
import { useSession } from "@/lib/hooks/useSession";
import Tour from "@/components/dashboard/Tour";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<{x: number, y: number} | null>(null);
  const [onboardingState, setOnboardingState] = useState<{completed: boolean, step: number} | null>(null);
  const { t } = useTranslation("common");
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSession();

  useEffect(() => {
    // Fetch initial state for button position and onboarding
    const savedPos = localStorage.getItem('sidebar-toggle-pos');
    let initialPos;
    if (savedPos) {
      try {
        initialPos = JSON.parse(savedPos);
      } catch (e) {
        initialPos = { x: window.innerWidth - 80, y: window.innerHeight - 80 };
      }
    } else {
      initialPos = { x: window.innerWidth - 80, y: window.innerHeight - 80 };
    }
    setButtonPosition(initialPos);

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

    if(user) {
        fetchOnboardingStatus();
    }
    
  }, [user]);

  useEffect(() => {
    // Redirect logic for onboarding
    if (onboardingState && !onboardingState.completed && pathname !== '/onboarding') {
        router.replace('/onboarding');
    }
    
    // One-time discovery animation logic
    if (onboardingState?.completed && !sessionStorage.getItem('hasSeenNavAnimation')) {
        const timer1 = setTimeout(() => {
            setSidebarOpen(true);
            const timer2 = setTimeout(() => {
                setSidebarOpen(false);
                sessionStorage.setItem('hasSeenNavAnimation', 'true');
            }, 1500);
            return () => clearTimeout(timer2);
        }, 1500);
      return () => clearTimeout(timer1);
    }
  }, [onboardingState, pathname, router]);

  const handleButtonDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: any) => {
    setButtonPosition({ x: info.point.x, y: info.point.y });
  };

  return (
    <DashboardThemeProvider>
      <div className="min-h-screen bg-gray-100/50 dark:bg-black">
        
        <Portal>
            {buttonPosition && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} position={buttonPosition} />}
            
            {!sidebarOpen && buttonPosition && <DraggableSidebarToggle 
                onOpen={() => setSidebarOpen(true)}
                onPositionChange={setButtonPosition}
            />}
        </Portal>

        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg px-4 sm:gap-x-6 sm:px-6 lg:px-8">
            <div className="flex h-16 flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
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

          <main className="py-10 flex-1">
            <div className="px-4 sm:px-6 lg:px-8">
              <Breadcrumbs />
              <div className="mt-4">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </DashboardThemeProvider>
  );
}
