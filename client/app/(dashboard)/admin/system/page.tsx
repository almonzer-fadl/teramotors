"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Building, ScrollText, Users, BarChart, DatabaseBackup } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/dashboard-animations';
import TenantManagementTable from '@/components/admin/TenantManagementTable';
import SystemLogsViewer from '@/components/admin/SystemLogsViewer';
import GlobalUsersTable from '@/components/admin/GlobalUsersTable';
import UsageMonitoringDashboard from '@/components/admin/UsageMonitoringDashboard';
import BackupManager from '@/components/admin/BackupManager';
import { RoleGuard } from '@/components/RoleGuard';

// Define the structure for each tab
interface AdminSystemTab {
  name: string;
  icon: React.ElementType;
  component: React.ReactNode;
}

const tabs: AdminSystemTab[] = [
  { name: 'Tenant Management', icon: Building, component: <TenantManagementTable /> },
  { name: 'System Logs', icon: ScrollText, component: <SystemLogsViewer /> },
  { name: 'Global User Management', icon: Users, component: <GlobalUsersTable /> },
  { name: 'Usage Monitoring', icon: BarChart, component: <UsageMonitoringDashboard /> },
  { name: 'Backup & Recovery', icon: DatabaseBackup, component: <BackupManager /> },
];

export default function AdminSystemPage() {
  const { t } = useTranslation('common');
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(tabs[0].name);

  useEffect(() => {
    const tabQuery = searchParams.get('tab');
    if (tabQuery && tabs.some(tab => tab.name === tabQuery)) {
      setActiveTab(tabQuery);
    }
  }, [searchParams]);

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']} redirectToLogin={true}>
      <motion.div
        className="space-y-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            System Administration
          </h1>
          <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
            Platform-wide administrative tasks and oversight.
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
    </RoleGuard>
  );
}
