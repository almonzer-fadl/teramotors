'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CogIcon, ShieldCheckIcon, CloudIcon, ServerIcon, LogOut, Icon } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/dashboard-animations';

import PlatformDefaultsSettings from '@/components/settings/admin/PlatformDefaultsSettings';
import LogoutButton from '@/components/ui/LogoutButton';

// Define the structure for each tab
interface AdminTab {
  name: string;
  icon: Icon;
  component: React.ReactNode;
}

const AuthenticationSettings = () => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Session Management</h3>
    <p className="mb-6 text-gray-600 dark:text-gray-400">
      Logging out will securely end your super admin session.
    </p>
    <LogoutButton />
  </div>
);

const tabs: AdminTab[] = [
  { name: 'Platform Defaults', icon: CogIcon, component: <PlatformDefaultsSettings /> },
  { name: 'System Maintenance', icon: ServerIcon, component: <div><h3 className="text-xl font-semibold mb-4">System Maintenance</h3><p>Manage system-wide maintenance tasks like data migration and health checks.</p></div> }, // Placeholder
  { name: 'Security & Roles', icon: ShieldCheckIcon, component: <div><h3 className="text-xl font-semibold mb-4">Security & Roles</h3><p>Configure super admin roles and platform security settings.</p></div> }, // Placeholder
  { name: 'API Integrations', icon: CloudIcon, component: <div><h3 className="text-xl font-semibold mb-4">Global API Integrations</h3><p>Manage platform-wide API keys for third-party services.</p></div> }, // Placeholder
  { name: 'Authentication', icon: LogOut, component: <AuthenticationSettings /> },
];

export default function AdminSettingsPage() {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState(tabs[0].name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="mb-8" variants={fadeInUp}>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Super Admin Settings
          </h1>
          <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
            Manage platform-wide configurations and system settings.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tabs Navigation */}
          <motion.div className="lg:col-span-1" variants={fadeInUp}>
            <div className="sticky top-24">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`w-full flex items-center p-4 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.name
                        ? 'bg-gradient-to-r from-[#F97402]/10 to-[#F13F33]/10 text-[#F97402] font-semibold border border-[#F97402]/20'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 me-3" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div className="lg:col-span-3" variants={fadeInUp}>
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6">
              {tabs.find(tab => tab.name === activeTab)?.component}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
