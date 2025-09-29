'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/lib/hooks/useSession'
import { RoleGuard } from '@/components/RoleGuard'
import { hasPermission, roleDisplayNames, roleDescriptions } from '@/lib/roles'
import { useTranslation } from 'react-i18next'
import ResponsiveUsersTable from '@/components/ui/ResponsiveUsersTable'
import { 
  Users, 
  User,
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
  XCircle,
  Key
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

export default function SettingsPage() {
  const { user } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editingNames, setEditingNames] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [migrating, setMigrating] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    displayName: ''
  })
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'mechanic',
    phone: ''
  })
  const [creatingUser, setCreatingUser] = useState(false)
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

  const migrateUsers = async () => {
    setMigrating(true)
    try {
      const response = await fetch('/api/migrate-users', {
        method: 'POST',
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(t('alerts.migration_completed', { count: result.migrated }))
        await fetchUsers() // Refresh the list
      } else {
        const error = await response.json()
        alert(t('alerts.migration_failed', { message: error.message }))
      }
    } catch (error) {
      console.error('Error migrating users:', error)
      alert(t('alerts.migration_failed_generic'))
    } finally {
      setMigrating(false)
    }
  }


  const handleEditNames = (user: User) => {
    setEditingNames(user)
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      displayName: user.displayName || user.fullName || ''
    })
  }

  const handleSaveNames = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        await fetchUsers() // Refresh the list
        setEditingNames(null)
        setEditForm({ firstName: '', lastName: '', displayName: '' })
        alert(t('alerts.user_names_updated'))
      } else {
        const error = await response.json()
        alert(t('alerts.failed_to_update_names', { message: error.message }))
      }
    } catch (error) {
      console.error('Error updating names:', error)
      alert(t('alerts.failed_to_update_names_generic'))
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
        alert(t('alerts.user_deleted_success'))
      } else {
        alert(t('alerts.failed_to_delete_user'))
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(t('alerts.error_deleting_user'))
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
        alert(t('alerts.failed_to_update_user_status'))
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert(t('alerts.error_updating_user'))
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
        alert(t('alerts.user_role_updated'));
      } else {
        alert(t('alerts.failed_to_update_user_role'));
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert(t('alerts.error_updating_user_role'));
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserForm.email || !newUserForm.firstName || !newUserForm.lastName) {
      alert(t('alerts.fill_required_fields'))
      return
    }

    setCreatingUser(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUserForm),
      })

      if (response.ok) {
        const result = await response.json()
        alert(t('alerts.user_created_success'))
        setNewUserForm({
          email: '',
          firstName: '',
          lastName: '',
          role: 'mechanic',
          phone: ''
        })
        setShowAddUser(false)
        await fetchUsers() // Refresh the list
      } else {
        const error = await response.json()
        alert(t('alerts.failed_to_create_user', { error: error.error }))
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert(t('alerts.failed_to_create_user_generic'))
    } finally {
      setCreatingUser(false)
    }
  }

  const handleResetPassword = async (userId: string) => {
    const newPassword = prompt('Enter new password for this user (min 8 characters):')
    if (!newPassword || newPassword.length < 8) {
      alert(t('alerts.password_min_length'))
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      })

      if (response.ok) {
        alert(t('alerts.password_reset_success'))
      } else {
        const error = await response.json()
        alert(t('alerts.failed_to_reset_password', { error: error.error }))
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert(t('alerts.failed_to_reset_password_generic'))
    }
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('settings.title')}
                </h1>
                <button
                  className="group relative inline-flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Role Permissions Information"
                >
                  <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                    i
                  </div>
                  {/* Tooltip */}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    <div className="space-y-1">
                      <div className="font-semibold">Role Permissions:</div>
                      <div><strong>Admin:</strong> Full system access</div>
                      <div><strong>Mechanic:</strong> Manage customers, vehicles, jobs</div>
                      <div><strong>Inspector:</strong> Perform inspections and estimates</div>
                    </div>
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                  </div>
                </button>
              </div>
              <button
                onClick={() => setShowAddUser(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {t('settings.add_user')}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">{t('settings.description')}</p>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">

        {/* User Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{t('settings.user_management')}</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={t('settings.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-sm text-gray-600">{t('settings.loading_users')}</p>
              </div>
            ) : (
              <ResponsiveUsersTable
                users={filteredUsers}
                onEditNames={handleEditNames}
                onResetPassword={handleResetPassword}
                onEditRole={setEditingUser}
                onToggleStatus={handleToggleUserStatus}
                onDeleteUser={handleDeleteUser}
                roleDisplayNames={roleDisplayNames}
              />
            )}
          </div>
        </div>

        {/* Add User Modal */}
        {showAddUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-full max-w-md">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('settings.add_user_title')}</h3>
              </div>
              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('settings.first_name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserForm.firstName}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    placeholder={t('ui.enter_first_name')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('settings.last_name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserForm.lastName}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    placeholder={t('ui.enter_last_name')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('settings.email')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    placeholder={t('ui.enter_email_address')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('settings.role')} *
                  </label>
                  <select 
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  >
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
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    placeholder={t('ui.enter_phone_number')}
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-sm text-blue-800">
                    <strong>{t('ui.note')}:</strong> {t('settings.temp_password_note')}
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    {t('settings.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={creatingUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingUser ? t('settings.creating') : t('settings.create_user')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Names Modal */}
        {editingNames && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-full max-w-md">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('settings.edit_user_names_title')}</h3>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSaveNames(editingNames._id);
              }}>
                <div className="space-y-2 mb-6">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('settings.user')}
                  </label>
                  <p className="text-lg font-bold text-gray-900">{editingNames.email}</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      {t('settings.first_name')}
                    </label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                      placeholder={t('ui.enter_first_name')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      {t('settings.last_name')}
                    </label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                      placeholder={t('ui.enter_last_name')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      {t('settings.display_name')}
                    </label>
                    <input
                      type="text"
                      value={editForm.displayName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                      placeholder={t('ui.enter_display_name')}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingNames(null)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    {t('settings.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    {t('settings.save_names')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Role Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-full max-w-md">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <Edit className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{t('settings.edit_user_role_title')}</h3>
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
                  <p className="text-lg font-bold text-gray-900">{editingUser.displayName || editingUser.fullName} ({editingUser.email})</p>
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
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    {t('settings.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
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