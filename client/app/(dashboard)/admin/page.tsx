'use client'

import { RoleGuard } from '@/components/RoleGuard'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Settings, Database, Building, Activity, Server, TrendingUp, UsersRound } from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/dashboard-animations'
import SystemStatusBoard from '@/components/admin/SystemStatusBoard'
import PlatformMetricsBoard from '@/components/admin/PlatformMetricsBoard'

const GlassyCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800 p-6 sm:p-8 ${className}`}>
    {children}
  </div>
);

export default function AdminPage() {
  const quickActions = [
    {
      title: 'Platform Settings',
      description: 'Configure system-wide default settings',
      icon: Settings,
      href: '/admin/settings',
      available: true,
    },
    {
      title: 'Tenant Management',
      description: 'View and manage all tenants in the system',
      icon: Building,
      href: '/admin/system?tab=Tenant+Management',
      available: true,
    },
    {
      title: 'Global User Management',
      description: 'Manage users across all tenants',
      icon: Users,
      href: '/admin/system?tab=Global+User+Management',
      available: true,
    },
    {
      title: 'System Administration',
      description: 'Manage tenants, view logs, and oversee the platform',
      icon: Server,
      href: '/admin/system',
      available: true,
    },
    {
      title: 'Migration Tool',
      description: 'Run database migrations and data fixes',
      icon: Database,
      href: '/admin/migrate',
      available: true,
    },
  ];

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
            Super Admin Dashboard
          </h1>
          <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
            Platform-wide overview and management for Super Administrators.
          </p>
        </motion.div>

        {/* System Status */}
        <motion.div variants={fadeInUp}>
          <GlassyCard>
            <SystemStatusBoard />
          </GlassyCard>
        </motion.div>

        {/* Platform Metrics */}
        <motion.div variants={fadeInUp}>
          <GlassyCard>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Platform Metrics</h2>
            <PlatformMetricsBoard />
          </GlassyCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeInUp}>
          <GlassyCard>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action) => (
                  <motion.div
                    key={action.title}
                    whileHover={{ scale: action.available ? 1.05 : 1 }}
                    whileTap={{ scale: action.available ? 0.98 : 1 }}
                    className="h-full"
                  >
                  {action.available ? (
                    <Link
                      href={action.href}
                      className="h-full flex flex-col p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm"
                    >
                      <action.icon className="w-8 h-8 mb-3 text-primary" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex-grow">
                        {action.description}
                      </p>
                    </Link>
                  ) : (
                    <div className="h-full flex flex-col p-6 rounded-2xl bg-gray-50/50 dark:bg-gray-800/20 opacity-60 cursor-not-allowed">
                      <action.icon className="w-8 h-8 mb-3 text-gray-400 dark:text-gray-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {action.title}
                        <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">(Coming Soon)</span>
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex-grow">
                        {action.description}
                      </p>
                    </div>
                  )}
                  </motion.div>
              ))}
            </div>
          </GlassyCard>
        </motion.div>
      </motion.div>
    </RoleGuard>
  )
}
