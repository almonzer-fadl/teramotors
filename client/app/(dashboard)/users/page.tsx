'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit, Save, X, User, Mail, Shield } from 'lucide-react';
import Link from 'next/link';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { t } = useTranslation('common');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
    role: '',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user._id);
    setEditForm({
      displayName: user.displayName || `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive
    });
  };

  const handleSave = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        await fetchUsers(); // Refresh the list
        setEditingUser(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditForm({
      displayName: '',
      firstName: '',
      lastName: '',
      role: '',
      isActive: true
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'mechanic':
        return 'bg-blue-100 text-blue-800';
      case 'inspector':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F13F33] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Link
              href="/dashboard"
              className="me-4 p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-white/50 hover:bg-white transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </Link>
            <div className="w-12 h-12 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center me-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage user accounts and display names</p>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="px-8 py-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === user._id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editForm.displayName}
                              onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F13F33] focus:border-[#F13F33]"
                              placeholder={t('ui.enter_display_name')}
                            />
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={editForm.firstName}
                                onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                                className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F13F33] focus:border-[#F13F33]"
                                placeholder={t('ui.enter_first_name')}
                              />
                              <input
                                type="text"
                                value={editForm.lastName}
                                onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                                className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F13F33] focus:border-[#F13F33]"
                                placeholder={t('ui.enter_last_name')}
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.displayName || `${user.firstName} ${user.lastName}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 me-2" />
                          <span className="text-sm text-gray-900">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === user._id ? (
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F13F33] focus:border-[#F13F33]"
                          >
                            <option value="admin">Admin</option>
                            <option value="mechanic">Mechanic</option>
                            <option value="inspector">Inspector</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            <Shield className="w-3 h-3 me-1" />
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === user._id ? (
                          <select
                            value={editForm.isActive ? 'active' : 'inactive'}
                            onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F13F33] focus:border-[#F13F33]"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingUser === user._id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSave(user._id)}
                              className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-all duration-300"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-all duration-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-all duration-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
