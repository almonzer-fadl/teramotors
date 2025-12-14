'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Users,
  User,
  Edit,
  Trash2,
  Shield,
  Wrench,
  Search,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Key,
  MoreVertical,
} from 'lucide-react'
import { tableRowHover } from '@/lib/dashboard-animations'

interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  fullName: string
  role: 'admin' | 'mechanic' | 'inspector'
  phone?: string
  isActive: boolean
  emailVerified: boolean
  lastLogin?: string
  createdAt: string
}

interface ResponsiveUsersTableProps {
  users: User[]
  onEditNames: (user: User) => void
  onResetPassword: (userId: string) => void
  onEditRole: (user: User) => void
  onToggleStatus: (userId: string, isActive: boolean) => void
  onDeleteUser: (userId: string) => void
}

export default function ResponsiveUsersTable({
  users,
  onEditNames,
  onResetPassword,
  onEditRole,
  onToggleStatus,
  onDeleteUser
}: ResponsiveUsersTableProps) {
  const { t } = useTranslation()
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  const roleMeta: Record<User['role'], { icon: JSX.Element; badge: string }> = {
    admin: { icon: <Shield className="h-4 w-4" />, badge: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' },
    mechanic: { icon: <Wrench className="h-4 w-4" />, badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' },
    inspector: { icon: <Search className="h-4 w-4" />, badge: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' },
  }

  const statusMeta = {
    active: { color: 'text-green-600 dark:text-green-400', icon: <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />, label: t('settings.active') || 'Active' },
    inactive: { color: 'text-red-600 dark:text-red-400', icon: <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />, label: t('settings.inactive') || 'Inactive' },
  }

  return (
    <div className="space-y-4">
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('settings.user')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('settings.role')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('settings.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('settings.last_login')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('settings.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {users.map((user) => (
              <motion.tr
                key={user._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                variants={tableRowHover}
                initial="rest"
                whileHover="hover"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="ms-4 space-y-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user.displayName || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : t('settings.names_not_set', { defaultValue: 'Names not set' })}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-[240px]">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleMeta[user.role].badge}`}>
                    {roleMeta[user.role].icon}
                    {t(`roles.${user.role}.name`, user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm">
                    {user.isActive ? statusMeta.active.icon : statusMeta.inactive.icon}
                    <span className={user.isActive ? statusMeta.active.color : statusMeta.inactive.color}>
                      {user.isActive ? statusMeta.active.label : statusMeta.inactive.label}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.lastLogin ? (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  ) : (
                    t('settings.never') ?? 'Never'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditNames(user)}
                      className="text-[#F97402] hover:text-[#F13F33] dark:text-[#F97402] dark:hover:text-[#F13F33] p-1 rounded-md hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
                      title={t('ui.edit_names')}
                    >
                      <User className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onResetPassword(user._id)}
                      className="text-[#F97402] hover:text-[#F13F33] dark:text-[#F97402] dark:hover:text-[#F13F33] p-1 rounded-md hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
                      title={t('ui.reset_password')}
                    >
                      <Key className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditRole(user)}
                      className="text-[#F97402] hover:text-[#F13F33] dark:text-[#F97402] dark:hover:text-[#F13F33] p-1 rounded-md hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
                      title={t('ui.edit_role')}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(user._id, user.isActive)}
                      className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
                        user.isActive
                          ? 'text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                          : 'text-green-600 dark:text-green-400 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                    >
                      {user.isActive ? t('settings.deactivate') : t('settings.activate')}
                    </button>
                    <button
                      onClick={() => onDeleteUser(user._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded-md"
                      title={t('ui.delete_user')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden space-y-4">
        {users.map((user) => (
          <motion.div
            key={user._id}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5"
            variants={tableRowHover}
            initial="rest"
            whileHover="hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user.displayName || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : t('settings.names_not_set', { defaultValue: 'Names not set' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <MoreVertical className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              
              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone}</span>
                </div>
              )}

              <div className="flex items-center flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${roleMeta[user.role].badge}`}>
                  {roleMeta[user.role].icon}
                  {t(`roles.${user.role}.name`, user.role)}
                </span>
                <div className="flex items-center gap-2">
                  {user.isActive ? statusMeta.active.icon : statusMeta.inactive.icon}
                  <span className={user.isActive ? statusMeta.active.color : statusMeta.inactive.color}>
                    {user.isActive ? statusMeta.active.label : statusMeta.inactive.label}
                  </span>
                </div>
              </div>

              {user.lastLogin && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <AnimatePresence>
              {expandedUser === user._id && (
                <motion.div
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onEditNames(user)
                        setExpandedUser(null)
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-[#F97402] hover:text-[#F13F33] dark:text-[#F97402] dark:hover:text-[#F13F33] bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">{t('ui.edit_names')}</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        onResetPassword(user._id)
                        setExpandedUser(null)
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-[#F97402] hover:text-[#F13F33] dark:text-[#F97402] dark:hover:text-[#F13F33] bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                    >
                      <Key className="h-4 w-4" />
                      <span className="text-sm font-medium">{t('ui.reset_password')}</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        onEditRole(user)
                        setExpandedUser(null)
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-[#F97402] hover:text-[#F13F33] dark:text-[#F97402] dark:hover:text-[#F13F33] bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="text-sm font-medium">{t('ui.edit_role')}</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        onToggleStatus(user._id, user.isActive)
                        setExpandedUser(null)
                      }}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        user.isActive
                          ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40'
                          : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40'
                      }`}
                    >
                      {user.isActive ? (
                        <>
                          <XCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">{t('settings.deactivate')}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">{t('settings.activate')}</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        onDeleteUser(user._id)
                        setExpandedUser(null)
                      }}
                      className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-sm font-medium">{t('ui.delete_user')}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
