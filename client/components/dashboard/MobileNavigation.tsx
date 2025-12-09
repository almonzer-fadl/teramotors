"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/lib/hooks/useSession';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Car, 
  Calendar, 
  Wrench, 
  FileText, 
  Receipt, 
  Package, 
  Settings,
  Bell,
  Search,
  Plus,
  CreditCard,
  Shield, // Added for admin icon
  Database, // Added for migration icon
  LayoutDashboard, // Added for dashboard icon
  ClipboardList, // Added for job cards icon
  MessageSquare, // Added for WhatsApp icon
  BarChart3, // Added for reports icon
  Icon // Import the Icon type
} from 'lucide-react';

import { getNavigationItems } from '@/lib/roles';

// Map string icon names to Lucide React components
const iconMap: { [key: string]: Icon } = {
  Home: Home,
  Users: Users,
  Car: Car,
  Calendar: Calendar,
  Wrench: Wrench,
  FileText: FileText,
  Receipt: Receipt,
  Package: Package,
  Settings: Settings,
  Bell: Bell,
  Search: Search,
  Plus: Plus,
  CreditCard: CreditCard,
  Shield: Shield,
  Database: Database,
  LayoutDashboard: LayoutDashboard,
  ClipboardList: ClipboardList,
  MessageSquare: MessageSquare,
  BarChart3: BarChart3,
};

interface MobileNavigationProps {
  className?: string;
}

export default function MobileNavigation({ className = "" }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user } = useSession();

  const navigationItems = getNavigationItems(user?.role || '');

  const quickActions = [
    { href: '/customers/new', icon: Plus, label: t('nav.new_customer') },
    { href: '/appointments/new', icon: Plus, label: t('nav.new_appointment') },
    { href: '/job-cards/new', icon: Plus, label: t('nav.new_job_card') },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'; // Also consider root as dashboard
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg ${className}`}
        aria-label={t('ui.open_menu')}
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">TeraMotors</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
                aria-label={t('ui.close_menu')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="space-y-1">
                  {navigationItems.map((item) => {
                    const IconComponent = iconMap[item.icon as keyof typeof iconMap];
                    if (!IconComponent) return null; // Handle case where icon name is not found
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive(item.href)
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <IconComponent className="mr-3 h-5 w-5" />
                        {t(item.tKey)}
                      </Link>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('nav.quick_actions')}
                  </h3>
                  <div className="mt-2 space-y-1">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Link
                          key={action.href}
                          href={action.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Icon className="mr-3 h-5 w-5" />
                          {action.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-500">{t('nav.notifications')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
