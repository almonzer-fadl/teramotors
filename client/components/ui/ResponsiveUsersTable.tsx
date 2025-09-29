'use client'

import { useState } from 'react'
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
  MoreVertical
} from 'lucide-react'

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
  roleDisplayNames: Record<string, string>
}

export default function ResponsiveUsersTable({
  users,
  onEditNames,
  onResetPassword,
  onEditRole,
  onToggleStatus,
  onDeleteUser,
  roleDisplayNames
}: ResponsiveUsersTableProps) {
  const { t } = useTranslation()
  const [expandedUser, setExpandedUser] = useState<string | null>(null)

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />
      case 'mechanic':
        return <Wrench className="h-4 w-4" />
      case 'inspector':
        return <Search className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'mechanic':
        return 'bg-blue-100 text-blue-800'
      case 'inspector':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80">
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t('settings.user')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t('settings.role')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t('settings.status')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t('settings.last_login')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                {t('settings.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {users.map((user) => (
              <tr key={user._id} className="bg-white/50 hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.displayName || user.fullName || `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Names not set'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {roleDisplayNames[user.role]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {user.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLogin ? (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  ) : (
                    t('settings.never')
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditNames(user)}
                      className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors"
                      title={t('ui.edit_names')}
                    >
                      <User className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onResetPassword(user._id)}
                      className="text-orange-600 hover:text-orange-900 p-1 rounded-md hover:bg-orange-50 transition-colors"
                      title={t('ui.reset_password')}
                    >
                      <Key className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditRole(user)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                      title={t('ui.edit_role')}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(user._id, user.isActive)}
                      className={`p-1 rounded-md transition-colors ${
                        user.isActive 
                          ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                          : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                      }`}
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {user.isActive ? t('settings.deactivate') : t('settings.activate')}
                    </button>
                    <button
                      onClick={() => onDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                      title={t('ui.delete_user')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {users.map((user) => (
          <div key={user._id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.displayName || user.fullName || `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Names not set'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              
              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {getRoleIcon(user.role)}
                  {roleDisplayNames[user.role]}
                </span>
                <div className="flex items-center gap-1">
                  {user.isActive ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
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

            {/* Expanded Actions */}
            {expandedUser === user._id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onEditNames(user)
                      setExpandedUser(null)
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('ui.edit_names')}</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      onResetPassword(user._id)
                      setExpandedUser(null)
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <Key className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('ui.reset_password')}</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      onEditRole(user)
                      setExpandedUser(null)
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
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
                        ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                        : 'text-green-600 bg-green-50 hover:bg-green-100'
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
                    className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('ui.delete_user')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
