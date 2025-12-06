"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, Users, TrendingUp, UserPlus, AlertTriangle } from 'lucide-react';
import { scaleIn, staggerContainer } from '@/lib/dashboard-animations';

interface PlatformStats {
  totalTenants: number;
  totalUsers: number;
  totalRevenue: number;
  newUsersToday: number;
}

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: React.ElementType, color: string }) => (
  <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl shadow-sm">
    <div className={`mr-4 p-3 rounded-full ${color} bg-opacity-10 dark:bg-opacity-20`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export default function PlatformMetricsBoard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch platform statistics');
        }
        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' }).format(amount);
  };

  const statItems = stats ? [
    { label: 'Total Tenants', value: stats.totalTenants, icon: Building, color: 'text-blue-500' },
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-purple-500' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'text-green-500' },
    { label: 'New Users (24h)', value: stats.newUsersToday, icon: UserPlus, color: 'text-orange-500' },
  ] : [];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-red-500">
        <AlertTriangle className="w-8 h-8 mb-2" />
        <p>Could not load platform metrics.</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {statItems.map((stat) => (
        <motion.div key={stat.label} variants={scaleIn}>
          <StatCard {...stat} />
        </motion.div>
      ))}
    </motion.div>
  );
}
