"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building, Loader2, Users } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/dashboard-animations';
import { RoleGuard } from '@/components/RoleGuard';
import TenantDetailsForm from '@/components/admin/TenantDetailsForm';
import TenantUsersTable from '@/components/admin/TenantUsersTable';
import toast from 'react-hot-toast';

interface Tenant {
  _id: string;
  name: string;
  email: string;
  status: 'active' | 'disabled';
  createdAt: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

interface TenantDetailsApiResponse {
  tenant: Tenant;
  users: User[];
}

export default function TenantDetailsPage() {
  const params = useParams();
  const tenantId = params.id as string;
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenantDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/details`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch tenant details');
      }
      const data: TenantDetailsApiResponse = await response.json();
      setTenant(data.tenant);
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchTenantDetails();
    }
  }, [tenantId]);

  const handleTenantUpdate = (updatedTenant: Tenant) => {
    setTenant(updatedTenant);
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={['SUPER_ADMIN']} redirectToLogin={true}>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </RoleGuard>
    );
  }

  if (error) {
    return (
      <RoleGuard allowedRoles={['SUPER_ADMIN']} redirectToLogin={true}>
        <div className="text-center text-red-500 min-h-[60vh] flex flex-col justify-center items-center">
          <p className="text-xl font-semibold mb-2">Error loading tenant details</p>
          <p>{error}</p>
        </div>
      </RoleGuard>
    );
  }

  if (!tenant) {
    return (
      <RoleGuard allowedRoles={['SUPER_ADMIN']} redirectToLogin={true}>
        <div className="text-center text-gray-500 min-h-[60vh] flex flex-col justify-center items-center">
          <p className="text-xl font-semibold mb-2">Tenant not found</p>
        </div>
      </RoleGuard>
    );
  }

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
            Tenant Details: {tenant.name}
          </h1>
          <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
            Manage tenant information and associated users.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tenant Details Form */}
            <motion.div variants={fadeInUp}>
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6">
                    <TenantDetailsForm tenant={tenant} onUpdate={handleTenantUpdate} />
                </div>
            </motion.div>

            {/* Tenant Users Table */}
            <motion.div variants={fadeInUp}>
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6">
                    <TenantUsersTable users={users} tenantName={tenant.name} loading={loading} />
                </div>
            </motion.div>
        </div>
      </motion.div>
    </RoleGuard>
  );
}
