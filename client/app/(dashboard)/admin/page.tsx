'use client'

import { RoleGuard } from '@/components/RoleGuard'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Settings, BarChart3, Database, Shield, Activity } from 'lucide-react'
import { fadeInUp, scaleIn, staggerContainer } from '@/lib/dashboard-animations'

export default function AdminPage() {
  const quickActions = [
    {
      title: 'Manage Tenants',
      description: 'View and manage all tenants in the system',
      icon: Users,
      href: '/admin/tenants',
      gradient: 'from-blue-500 to-blue-600',
      available: false,
    },
    {
      title: 'Migration Tool',
      description: 'Run database migrations and data fixes',
      icon: Database,
      href: '/admin/migrate',
      gradient: 'from-purple-500 to-purple-600',
      available: true,
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: Settings,
      href: '/settings',
      gradient: 'from-orange-500 to-red-600',
      available: true,
    },
    {
      title: 'View Logs',
      description: 'Monitor system activity and errors',
      icon: Activity,
      href: '/admin/logs',
      gradient: 'from-green-500 to-green-600',
      available: false,
    },
  ]

  const stats = [
    { label: 'Total Tenants', value: '1', icon: Users, color: 'text-blue-500' },
    { label: 'Active Users', value: '-', icon: Shield, color: 'text-green-500' },
    { label: 'System Health', value: 'Healthy', icon: Activity, color: 'text-emerald-500' },
    { label: 'Recent Activity', value: 'Active', icon: BarChart3, color: 'text-purple-500' },
  ]

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']} redirectToLogin={true}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          className="space-y-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={fadeInUp}>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Super Admin Panel
            </h1>
            <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
              System-wide management panel - Super Admin access only
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden"
                variants={scaleIn}
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 bg-gradient-to-br ${
                      idx === 0 ? 'from-blue-500 to-blue-600' :
                      idx === 1 ? 'from-green-500 to-green-600' :
                      idx === 2 ? 'from-emerald-500 to-emerald-600' :
                      'from-purple-500 to-purple-600'
                    } rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          {stat.label}
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                          {stat.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeInUp}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickActions.map((action) => (
                <motion.div
                  key={action.title}
                  variants={scaleIn}
                  whileHover={{ scale: action.available ? 1.02 : 1 }}
                  whileTap={{ scale: action.available ? 0.98 : 1 }}
                >
                  {action.available ? (
                    <Link
                      href={action.href}
                      className="block bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6 hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="flex items-start">
                        <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl shadow-lg shadow-gray-200/30 dark:shadow-gray-800/20 border border-gray-200 dark:border-gray-800 p-6 opacity-60 cursor-not-allowed">
                      <div className="flex items-start">
                        <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} opacity-50 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {action.title}
                            <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">(Coming Soon)</span>
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </RoleGuard>
  )
}
