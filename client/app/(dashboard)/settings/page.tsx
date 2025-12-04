'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSession } from '@/lib/hooks/useSession'
import { hasPermission, roleDisplayNames } from '@/lib/roles'
import ResponsiveUsersTable from '@/components/ui/ResponsiveUsersTable'
import {
  Users,
  User as UserIcon,
  UserPlus,
  Edit,
  Shield,
  Search,
  RefreshCcw,
  CheckCircle,
} from 'lucide-react'
import { fadeInUp, staggerContainer } from '@/lib/dashboard-animations'

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
  const { t } = useTranslation()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [showAddUser, setShowAddUser] = useState(false)
  const [editingNames, setEditingNames] = useState<User | null>(null)
  const [editingRole, setEditingRole] = useState<User | null>(null)

  const [newUserForm, setNewUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'mechanic',
    phone: '',
  })
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
  })

  const [creatingUser, setCreatingUser] = useState(false)
  const [updatingNames, setUpdatingNames] = useState(false)
  const [updatingRole, setUpdatingRole] = useState(false)
  const [migrating, setMigrating] = useState(false)

  const userRole = (user as any)?.role || 'mechanic'
  const canManageUsers = hasPermission(userRole, 'canManageUsers')

  useEffect(() => {
    if (canManageUsers) {
      fetchUsers()
    }
  }, [canManageUsers])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching users', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreatingUser(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm),
      })
      if (res.ok) {
        setShowAddUser(false)
        setNewUserForm({ email: '', firstName: '', lastName: '', role: 'mechanic', phone: '' })
        await fetchUsers()
      } else {
        const error = await res.json()
        alert(error?.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Create user error', error)
      alert('Failed to create user')
    } finally {
      setCreatingUser(false)
    }
  }

  const handleEditNames = (selected: User) => {
    setEditingNames(selected)
    setEditForm({
      firstName: selected.firstName || '',
      lastName: selected.lastName || '',
      displayName: selected.displayName || selected.fullName || '',
    })
  }

  const handleSaveNames = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingNames) return
    setUpdatingNames(true)
    try {
      const res = await fetch(`/api/users/${editingNames._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        await fetchUsers()
        setEditingNames(null)
      } else {
        const error = await res.json()
        alert(error?.message || 'Failed to update names')
      }
    } catch (error) {
      console.error('Update names error', error)
      alert('Failed to update names')
    } finally {
      setUpdatingNames(false)
    }
  }

  const handleUpdateUserRole = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingRole) return
    const form = e.target as HTMLFormElement
    const role = (form.elements.namedItem('role') as HTMLSelectElement).value
    setUpdatingRole(true)
    try {
      const res = await fetch(`/api/users/${editingRole._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (res.ok) {
        await fetchUsers()
        setEditingRole(null)
      } else {
        const error = await res.json()
        alert(error?.message || 'Failed to update role')
      }
    } catch (error) {
      console.error('Update role error', error)
      alert('Failed to update role')
    } finally {
      setUpdatingRole(false)
    }
  }

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (res.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Toggle status error', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t('settings.confirm_delete') || 'Delete user?')) return
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== userId))
      }
    } catch (error) {
      console.error('Delete user error', error)
    }
  }

  const migrateUsers = async () => {
    setMigrating(true)
    try {
      const res = await fetch('/api/migrate-users', { method: 'POST' })
      if (res.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Migration error', error)
    } finally {
      setMigrating(false)
    }
  }

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const target = `${u.fullName || ''} ${u.email || ''}`.toLowerCase()
        return target.includes(searchTerm.toLowerCase())
      }),
    [users, searchTerm]
  )

  const totalActive = users.filter((u) => u.isActive).length
  const totalAdmins = users.filter((u) => u.role === 'admin').length

  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('settings.access_denied')}</h3>
          <p className="text-gray-500 dark:text-gray-400">{t('settings.access_denied_description')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 sm:px-6 lg:px-8 py-6">
      <motion.div
        className="space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
          variants={fadeInUp}
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('settings.description')}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={migrateUsers}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
              disabled={migrating}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              {migrating ? t('settings.syncing') : t('settings.sync_directory')}
            </button>
            <button
              onClick={() => setShowAddUser(true)}
              className="inline-flex items-center justify-center rounded-lg bg-[#F97402] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#F13F33]"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {t('settings.add_user')}
            </button>
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={fadeInUp}>
          {[{
            label: t('settings.total_users'),
            value: users.length,
            icon: <Users className="h-4 w-4 text-blue-500" />,
          }, {
            label: t('settings.active_users'),
            value: totalActive,
            icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          }, {
            label: t('settings.admins'),
            value: totalAdmins,
            icon: <Shield className="h-4 w-4 text-indigo-500" />,
          }].map((stat) => (
            <motion.div
              key={stat.label as string}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4"
              variants={fadeInUp}
            >
              <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800"
          variants={fadeInUp}
        >
          <div className="px-6 py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('settings.user_management')}
                </h2>
              </div>
              <div className="relative w-full lg:w-64">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('settings.search_placeholder') || ''}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#F97402] focus:border-[#F97402] transition-colors text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97402] mx-auto" />
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{t('settings.loading_users')}</p>
              </div>
            ) : (
              <ResponsiveUsersTable
                users={filteredUsers}
                onEditNames={handleEditNames}
                onResetPassword={(id) => {
                  const pwd = prompt(t('settings.prompt_new_password') || 'New password (min 8 chars)')
                  if (!pwd || pwd.length < 8) return
                  fetch(`/api/users/${id}/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newPassword: pwd }),
                  }).then(() => alert(t('settings.password_reset_success')))
                }}
                onEditRole={setEditingRole}
                onToggleStatus={handleToggleUserStatus}
                onDeleteUser={handleDeleteUser}
                roleDisplayNames={roleDisplayNames}
              />
            )}
          </div>
        </motion.div>
      </motion.div>

      {showAddUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-md">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.add_user_title')}</h3>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-6">
              {(['firstName', 'lastName', 'email'] as const).map((field) => (
                <div className="space-y-2" key={field}>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    {t(`settings.${field}`)} *
                  </label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    required
                    value={(newUserForm as any)[field]}
                    onChange={(e) => setNewUserForm((prev) => ({ ...prev, [field]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#F97402] focus:border-[#F97402] transition-colors text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              ))}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  {t('settings.role')} *
                </label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 dark:text-white bg-white dark:bg-gray-900"
                >
                  <option value="mechanic">{t('settings.mechanic')}</option>
                  <option value="inspector">{t('settings.inspector')}</option>
                  <option value="admin">{t('settings.administrator')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  {t('settings.phone_optional')}
                </label>
                <input
                  type="tel"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#F97402] focus:border-[#F97402] transition-colors text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  placeholder={t('ui.enter_phone_number') || ''}
                />
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>{t('ui.note')}:</strong> {t('settings.temp_password_note')}
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  {t('settings.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-4 py-2 bg-[#F97402] text-white rounded-lg hover:bg-[#F13F33] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingUser ? t('settings.creating') : t('settings.create_user')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingNames && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-md">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                <UserIcon className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.edit_user_names_title')}</h3>
            </div>
            <form onSubmit={handleSaveNames} className="space-y-4">
              {(['firstName', 'lastName', 'displayName'] as const).map((field) => (
                <div className="space-y-2" key={field}>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    {t(`settings.${field}`)}
                  </label>
                  <input
                    type="text"
                    value={(editForm as any)[field]}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, [field]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#F97402] focus:border-[#F97402] transition-colors text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingNames(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  {t('settings.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={updatingNames}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  {updatingNames ? t('settings.saving') : t('settings.save_names')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingRole && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-md">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-3">
                <Edit className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.edit_user_role_title')}</h3>
            </div>
            <form onSubmit={handleUpdateUserRole}>
              <div className="space-y-2 mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  {t('settings.user')}
                </label>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingRole.displayName || editingRole.fullName} ({editingRole.email})
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  {t('settings.role')}
                </label>
                <select
                  name="role"
                  defaultValue={editingRole.role}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 dark:text-white bg-white dark:bg-gray-900"
                >
                  <option value="mechanic">{t('settings.mechanic')}</option>
                  <option value="inspector">{t('settings.inspector')}</option>
                  <option value="admin">{t('settings.administrator')}</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  {t('settings.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={updatingRole}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  {updatingRole ? t('settings.saving') : t('settings.save_changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
