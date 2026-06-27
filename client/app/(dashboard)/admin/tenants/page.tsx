"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Building2,
  Search,
  Plus,
  MoreVertical,
  Users,
  CreditCard,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Pause,
  Play,
  Trash2,
  Eye,
  Edit,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Star,
  Zap,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from "@/lib/subscription/tiers";

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

interface Tenant {
  _id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  subscription: {
    tier: SubscriptionTier;
    status: 'active' | 'suspended' | 'cancelled' | 'trialing';
    expiresAt?: Date;
  };
  stats: {
    users: number;
    customers: number;
    invoices: number;
  };
  isActive: boolean;
  createdAt: Date;
}

const tierIcons: Record<SubscriptionTier, typeof Star> = {
  free: Zap,
  basic: Star,
  pro: Crown,
  enterprise: Building2,
};

const tierColors: Record<SubscriptionTier, string> = {
  free: 'from-gray-500 to-gray-600',
  basic: 'from-blue-500 to-blue-600',
  pro: 'from-[#F97402] to-[#F13F33]',
  enterprise: 'from-purple-500 to-purple-600',
};

export default function AdminTenantsPage() {
  const { user } = useSession();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const tenantsPerPage = 10;

  useEffect(() => {
    // Simulate API call - replace with actual API
    const fetchTenants = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        // Mock data - replace with: const response = await fetch('/api/admin/tenants')
        setTenants([
          {
            _id: '1',
            name: 'Tera Motors',
            slug: 'tera-motors',
            email: 'info@teramotors.sa',
            phone: '+966553022102',
            subscription: { tier: 'enterprise', status: 'active' },
            stats: { users: 12, customers: 450, invoices: 1240 },
            isActive: true,
            createdAt: new Date('2024-01-15'),
          },
          {
            _id: '2',
            name: 'Quick Fix Auto',
            slug: 'quick-fix',
            email: 'contact@quickfix.sa',
            subscription: { tier: 'pro', status: 'active' },
            stats: { users: 5, customers: 230, invoices: 567 },
            isActive: true,
            createdAt: new Date('2024-03-20'),
          },
          {
            _id: '3',
            name: 'Auto Care Center',
            slug: 'auto-care',
            email: 'hello@autocare.sa',
            subscription: { tier: 'basic', status: 'active' },
            stats: { users: 3, customers: 87, invoices: 234 },
            isActive: true,
            createdAt: new Date('2024-05-10'),
          },
          {
            _id: '4',
            name: 'Speed Garage',
            slug: 'speed-garage',
            email: 'info@speedgarage.sa',
            subscription: { tier: 'free', status: 'trialing', expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
            stats: { users: 1, customers: 15, invoices: 23 },
            isActive: true,
            createdAt: new Date('2024-11-01'),
          },
          {
            _id: '5',
            name: 'Elite Motors',
            slug: 'elite-motors',
            email: 'admin@elitemotors.sa',
            subscription: { tier: 'pro', status: 'suspended' },
            stats: { users: 4, customers: 156, invoices: 432 },
            isActive: false,
            createdAt: new Date('2024-02-28'),
          },
        ]);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Inactive' };
    }
    switch (status) {
      case 'active':
        return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Active' };
      case 'trialing':
        return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Zap, label: 'Trial' };
      case 'suspended':
        return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Pause, label: 'Suspended' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Cancelled' };
      default:
        return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: AlertTriangle, label: status };
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || tenant.subscription.status === filterStatus;
    const matchesTier = filterTier === 'all' || tenant.subscription.tier === filterTier;

    return matchesSearch && matchesStatus && matchesTier;
  });

  const totalPages = Math.ceil(filteredTenants.length / tenantsPerPage);
  const paginatedTenants = filteredTenants.slice(
    (currentPage - 1) * tenantsPerPage,
    currentPage * tenantsPerPage
  );

  const handleSuspendTenant = async (tenantId: string) => {
    // API call to suspend tenant
    setTenants(tenants.map(t =>
      t._id === tenantId ? { ...t, subscription: { ...t.subscription, status: 'suspended' as const }, isActive: false } : t
    ));
    setShowActionMenu(null);
  };

  const handleActivateTenant = async (tenantId: string) => {
    // API call to activate tenant
    setTenants(tenants.map(t =>
      t._id === tenantId ? { ...t, subscription: { ...t.subscription, status: 'active' as const }, isActive: true } : t
    ));
    setShowActionMenu(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 className="w-8 h-8 text-[#F97402] animate-spin" />
          <p className="mt-4 text-gray-500">Loading tenants...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Tenant Management
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage all registered workshops and their subscriptions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                className="inline-flex items-center px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-4 h-4 me-2" />
                Export
              </motion.button>
              <Link href="/admin/tenants/new">
                <motion.button
                  className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white font-semibold rounded-xl shadow-lg shadow-[#F97402]/25"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4 me-2" />
                  Add Tenant
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { label: 'Total Tenants', value: tenants.length, icon: Building2, color: 'from-blue-500 to-blue-600' },
            { label: 'Active', value: tenants.filter(t => t.isActive && t.subscription.status === 'active').length, icon: CheckCircle2, color: 'from-emerald-500 to-green-600' },
            { label: 'On Trial', value: tenants.filter(t => t.subscription.status === 'trialing').length, icon: Zap, color: 'from-amber-500 to-orange-600' },
            { label: 'Suspended', value: tenants.filter(t => t.subscription.status === 'suspended').length, icon: Pause, color: 'from-red-500 to-red-600' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="trialing">Trial</option>
                <option value="suspended">Suspended</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              >
                <option value="all">All Tiers</option>
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Tenants Table */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="text-start px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Workshop
                  </th>
                  <th className="text-start px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="text-start px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-start px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="text-start px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-end px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {paginatedTenants.map((tenant) => {
                    const status = getStatusBadge(tenant.subscription.status, tenant.isActive);
                    const StatusIcon = status.icon;
                    const TierIcon = tierIcons[tenant.subscription.tier];

                    return (
                      <motion.tr
                        key={tenant._id}
                        variants={itemVariants}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#063479] to-[#052a5f] flex items-center justify-center shadow-md">
                              <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div className="ms-4">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {tenant.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {tenant.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tierColors[tenant.subscription.tier]} flex items-center justify-center shadow-sm`}>
                              <TierIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className="ms-2 font-medium text-gray-900 dark:text-white capitalize">
                              {tenant.subscription.tier}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                            <StatusIcon className="w-3.5 h-3.5 me-1.5" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-gray-900 dark:text-white">
                            <Users className="w-4 h-4 me-2 text-gray-400" />
                            {tenant.stats.users}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(tenant.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end relative">
                            <motion.button
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowActionMenu(showActionMenu === tenant._id ? null : tenant._id)}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </motion.button>

                            {/* Action Menu */}
                            <AnimatePresence>
                              {showActionMenu === tenant._id && (
                                <motion.div
                                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-10"
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                >
                                  <Link href={`/admin/tenants/${tenant._id}`}>
                                    <button className="w-full px-4 py-2.5 text-start text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                                      <Eye className="w-4 h-4 me-3" />
                                      View Details
                                    </button>
                                  </Link>
                                  <Link href={`/admin/tenants/${tenant._id}/edit`}>
                                    <button className="w-full px-4 py-2.5 text-start text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                                      <Edit className="w-4 h-4 me-3" />
                                      Edit Tenant
                                    </button>
                                  </Link>
                                  <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                                  {tenant.isActive ? (
                                    <button
                                      className="w-full px-4 py-2.5 text-start text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center"
                                      onClick={() => handleSuspendTenant(tenant._id)}
                                    >
                                      <Pause className="w-4 h-4 me-3" />
                                      Suspend
                                    </button>
                                  ) : (
                                    <button
                                      className="w-full px-4 py-2.5 text-start text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center"
                                      onClick={() => handleActivateTenant(tenant._id)}
                                    >
                                      <Play className="w-4 h-4 me-3" />
                                      Activate
                                    </button>
                                  )}
                                  <button className="w-full px-4 py-2.5 text-start text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center">
                                    <Trash2 className="w-4 h-4 me-3" />
                                    Delete
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(currentPage - 1) * tenantsPerPage + 1} to {Math.min(currentPage * tenantsPerPage, filteredTenants.length)} of {filteredTenants.length} tenants
              </p>
              <div className="flex items-center gap-2">
                <motion.button
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <motion.button
                    key={page}
                    className={`w-10 h-10 rounded-lg font-medium text-sm ${
                      page === currentPage
                        ? 'bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </motion.button>
                ))}
                <motion.button
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
