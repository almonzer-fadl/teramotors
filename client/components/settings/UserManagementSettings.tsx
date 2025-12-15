"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Loader2, Users, UserPlus, Edit, Trash2, ToggleLeft, ToggleRight, Key, X } from 'lucide-react';

const StatBadge = ({ status }: { status: string }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }`}>
        {status}
    </span>
);

const Modal = ({ isOpen, onClose, children, title }: { isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl max-w-md w-full"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {children}
            </motion.div>
        </div>
    );
};

const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200" />
);

const FormLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{children}</label>
);

export default function UserManagementSettings() {
    const { t, i18n } = useTranslation('common');
    const isRTL = i18n.language === 'ar';
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);

    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditRoleModal, setShowEditRoleModal] = useState(false);
    const [userToEditRole, setUserToEditRole] = useState<any>(null);
    const [newRole, setNewRole] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const roles = ['admin', 'mechanic', 'inspector', 'customer']; // Define available roles

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(Array.isArray(data) ? data : []);
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Failed to load users.");
            }
        } catch (error) {
            toast.error("Failed to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);
    
    const handleResetPassword = async (userId: string) => {
        if (confirm(t('settings.user_management.confirm_reset_password', 'Are you sure you want to reset the password for this user? They will receive "TempPass123!"'))) {
            try {
                const response = await fetch(`/api/users/${userId}/reset-password`, {
                    method: 'POST',
                });
                const data = await response.json();
                if (response.ok) {
                    toast.success(data.message);
                } else {
                    throw new Error(data.error || t('settings.user_management.reset_password_failed', 'Failed to reset password'));
                }
            } catch (error) {
                toast.error((error as Error).message);
            }
        }
    };

    const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const userData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(t('settings.user_management.user_added', 'User added successfully!'));
                setShowAddUserModal(false);
                fetchUsers();
            } else {
                throw new Error(data.error || t('settings.user_management.add_user_failed', 'Failed to add user'));
            }
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditRole = async () => {
        if (!userToEditRole || !newRole) return;
        setSubmitting(true);
        try {
            const response = await fetch(`/api/users/${userToEditRole._id}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(t('settings.user_management.role_updated', `Role updated for ${userToEditRole.firstName}.`));
                setShowEditRoleModal(false);
                fetchUsers();
            } else {
                throw new Error(data.error || t('settings.user_management.update_role_failed', 'Failed to update role'));
            }
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        if (confirm(t('settings.user_management.confirm_toggle_status', `Are you sure you want to ${newStatus} this user?`))) {
            try {
                const response = await fetch(`/api/users/${userId}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus }),
                });
                const data = await response.json();
                if (response.ok) {
                    toast.success(t('settings.user_management.status_updated', `User status updated to ${newStatus}.`));
                    fetchUsers();
                } else {
                    throw new Error(data.error || t('settings.user_management.update_status_failed', 'Failed to update status'));
                }
            } catch (error) {
                toast.error((error as Error).message);
            }
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (confirm(t('settings.user_management.confirm_delete', 'Are you sure you want to delete this user? This action cannot be undone.'))) {
            try {
                const response = await fetch(`/api/users/${userId}`, {
                    method: 'DELETE',
                });
                const data = await response.json();
                if (response.ok) {
                    toast.success(t('settings.user_management.user_deleted', 'User deleted successfully.'));
                    fetchUsers();
                } else {
                    throw new Error(data.error || t('settings.user_management.delete_failed', 'Failed to delete user'));
                }
            } catch (error) {
                toast.error((error as Error).message);
            }
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
         <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center"><Users className="w-6 h-6 me-3 text-[#F97402]" /> {t('settings.user_management.title', 'User Management')}</h2>
                 <button
                    onClick={() => setShowAddUserModal(true)}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200"
                >
                    <UserPlus className="w-5 h-5 me-2" />
                    {t('settings.user_management.add_user', 'Add User')}
                </button>
            </div>
            <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50/80 dark:bg-gray-800/80">
                        <tr>
                            <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>{t('settings.user_management.user', 'User')}</th>
                            <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>{t('settings.user_management.role', 'Role')}</th>
                            <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>{t('settings.user_management.status', 'Status')}</th>
                            <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>{t('settings.user_management.actions', 'Actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center">
                                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">{t('settings.user_management.no_users', 'No users found. Add a user to get started.')}</p>
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 capitalize">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatBadge status={user.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                        <button
                                            onClick={() => { setUserToEditRole(user); setNewRole(user.role); setShowEditRoleModal(true); }}
                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title={t('settings.user_management.edit_role', 'Edit Role')}><Edit className="w-5 h-5" /></button>
                                        <button onClick={() => handleResetPassword(user._id)} className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300" title={t('settings.user_management.reset_password', 'Reset Password')}><Key className="w-5 h-5" /></button>
                                        <button
                                            onClick={() => handleToggleStatus(user._id, user.status)}
                                            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200" title={user.status === 'active' ? t('settings.user_management.deactivate', 'Deactivate') : t('settings.user_management.activate', 'Activate')}>
                                            {user.status === 'active' ? <ToggleLeft className="w-5 h-5" /> : <ToggleRight className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title={t('settings.user_management.delete_user', 'Delete User')}><Trash2 className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            <Modal isOpen={showAddUserModal} onClose={() => setShowAddUserModal(false)} title={t('settings.user_management.add_new_user', 'Add New User')}>
                <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                        <FormLabel>{t('settings.user_management.first_name', 'First Name')}</FormLabel>
                        <FormInput name="firstName" required />
                    </div>
                    <div>
                        <FormLabel>{t('settings.user_management.last_name', 'Last Name')}</FormLabel>
                        <FormInput name="lastName" required />
                    </div>
                    <div>
                        <FormLabel>{t('settings.user_management.email', 'Email')}</FormLabel>
                        <FormInput name="email" type="email" required />
                    </div>
                    <div>
                        <FormLabel>{t('settings.user_management.role', 'Role')}</FormLabel>
                        <select
                            name="role"
                            defaultValue="mechanic"
                            className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                            required
                        >
                            {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                        </select>
                    </div>
                    <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200"
                        >
                            {submitting ? <Loader2 className="me-2 h-5 w-5 animate-spin" /> : <UserPlus className="w-5 h-5 me-2" />}
                            {t('settings.user_management.add_user', 'Add User')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Role Modal */}
            <Modal isOpen={showEditRoleModal} onClose={() => setShowEditRoleModal(false)} title={t('settings.user_management.edit_role_for', `Edit Role for ${userToEditRole?.firstName || ''} ${userToEditRole?.lastName || ''}`)}>
                <div className="space-y-4">
                    <div>
                        <FormLabel>{t('settings.user_management.new_role', 'New Role')}</FormLabel>
                        <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200"
                            required
                        >
                            {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                        </select>
                    </div>
                    <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                        <button
                            onClick={handleEditRole}
                            disabled={submitting}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200"
                        >
                            {submitting ? <Loader2 className="me-2 h-5 w-5 animate-spin" /> : <Edit className="w-5 h-5 me-2" />}
                            {t('settings.user_management.update_role', 'Update Role')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
