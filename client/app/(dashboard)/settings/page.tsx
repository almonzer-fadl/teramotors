'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/lib/hooks/useSession'
import { RoleGuard } from '@/components/RoleGuard'
import { hasPermission, roleDisplayNames, roleDescriptions } from '@/lib/roles'
import { useTranslation } from 'react-i18next'
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  Wrench, 
  Search,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface User {
  _id: string
  email: string
  fullName: string
  role: 'admin' | 'mechanic' | 'inspector'
  phone?: string
  isActive: boolean
  emailVerified: boolean
  lastLogin?: string
  createdAt: string
}

export default function SettingsPage() {
  const { user } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { t } = useTranslation()
  // Check if user has admin permissions
  const userRole = (user as any)?.role || 'mechanic'
  const canManageUsers = hasPermission(userRole, 'canManageUsers')

  useEffect(() => {
    if (canManageUsers) {
      fetchUsers()
    }
  }, [canManageUsers])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUsers(users.filter(u => u._id !== userId))
        alert('User deleted successfully')
      } else {
        alert('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    }
  }

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        setUsers(users.map(u => 
          u._id === userId ? { ...u, isActive: !isActive } : u
        ))
      } else {
        alert('Failed to update user status')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user')
    }
  }

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        setUsers(users.map(u =>
          u._id === userId ? { ...u, role: role as any } : u
        ));
        setEditingUser(null);
        alert('User role updated successfully');
      } else {
        alert('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role');
    }
  };

  const filteredUsers = users.filter(user =>
    (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">{t('settings.access_denied')}</h3>
          <p className="text-gray-500">{t('settings.access_denied_description')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {t('settings.title')}
                </h1>
                <p className="mt-3 text-xl text-gray-600">{t('settings.description')}</p>
              </div>
              <button
                onClick={() => setShowAddUser(true)}
                className="group inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-xl hover:shadow-blue-600/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                <UserPlus className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                {t('settings.add_user')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        {/* Role Information */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="px-8 py-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center mr-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{t('settings.role_permissions')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.entries(roleDisplayNames).map(([role, displayName]) => (
                <div key={role} className="bg-gray-50/80 rounded-2xl p-6 hover:bg-gray-100/80 transition-all duration-300 hover:shadow-lg group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                      role === 'admin' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                      role === 'mechanic' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                      'bg-gradient-to-br from-green-500 to-green-600'
                    }`}>
                      {role === 'admin' && <Shield className="h-6 w-6 text-white" />}
                      {role === 'mechanic' && <Wrench className="h-6 w-6 text-white" />}
                      {role === 'inspector' && <Search className="h-6 w-6 text-white" />}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{displayName}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{roleDescriptions[role as keyof typeof roleDescriptions]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden mt-12">
          <div className="px-8 py-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#063479] to-[#052a5f] rounded-2xl flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t('settings.user_management')}</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={t('settings.search_users')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F13F33] mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">{t('settings.loading_users')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                    {filteredUsers.map((user) => (
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
                                {user.fullName}
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'mechanic' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
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
                            <span className={`text-sm ${
                              user.isActive ? 'text-green-600' : 'text-red-600'
                            }`}>
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
                              onClick={() => setEditingUser(user)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                              className={`${
                                user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {user.isActive ? t('settings.deactivate') : t('settings.activate')}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-900"
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
            )}
          </div>
        </div>

        {/* Add User Modal */}
        {showAddUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 w-full max-w-md">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t('settings.add_user_title')}</h3>
              </div>
              <form className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('settings.full_name')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('settings.full_name_placeholder')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('settings.email')}
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('settings.email_placeholder')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('settings.role')}
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300">
                    <option value="mechanic">{t('settings.mechanic')}</option>
                    <option value="inspector">{t('settings.inspector')}</option>
                    <option value="admin">{t('settings.administrator')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('settings.phone_optional')}
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                    placeholder={t('settings.phone_placeholder')}
                  />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-2xl hover:border-[#F13F33] hover:text-[#F13F33] hover:bg-[#F13F33]/5 transition-all duration-300 font-bold"
                  >
                    {t('settings.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:shadow-xl hover:shadow-blue-600/25 transition-all duration-300 hover:-translate-y-0.5 font-bold"
                  >
                    {t('settings.add_user_button')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 w-full max-w-md">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center mr-4">
                  <Edit className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t('settings.edit_user_role_title')}</h3>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const role = (form.elements.namedItem('role') as HTMLSelectElement).value;
                handleUpdateUserRole(editingUser._id, role);
              }}>
                <div className="space-y-2 mb-6">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('settings.user')}
                  </label>
                  <p className="text-lg font-bold text-gray-900">{editingUser.fullName} ({editingUser.email})</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('settings.role')}
                  </label>
                  <select name="role" defaultValue={editingUser.role} className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300">
                    <option value="mechanic">{t('settings.mechanic')}</option>
                    <option value="inspector">{t('settings.inspector')}</option>
                    <option value="admin">{t('settings.administrator')}</option>
                  </select>
                </div>
                <div className="flex justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-2xl hover:border-[#F13F33] hover:text-[#F13F33] hover:bg-[#F13F33]/5 transition-all duration-300 font-bold"
                  >
                    {t('forms.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-[#F13F33] to-[#d6352a] text-white rounded-2xl hover:shadow-xl hover:shadow-[#F13F33]/25 transition-all duration-300 hover:-translate-y-0.5 font-bold"
                  >
                    {t('settings.save_changes')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}