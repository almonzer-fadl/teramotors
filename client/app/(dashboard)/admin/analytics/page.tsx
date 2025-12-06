'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import MetricCard from '@/components/admin/analytics/MetricCard';
import RevenueChart from '@/components/admin/analytics/RevenueChart';
import SubscriptionPieChart from '@/components/admin/analytics/SubscriptionPieChart';
import TenantGrowthChart from '@/components/admin/analytics/TenantGrowthChart';
import { TrendData } from '@/lib/utils/analytics-calculator';
import { RoleGuard } from '@/components/RoleGuard';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/dashboard-animations';

interface MrrData {
  current: number;
  previous: number;
  growth: number;
  trend: { date: string; mrr: number }[];
}

interface RevenueAnalytics {
  data: TrendData[];
  summary: {
    total: number;
    average: number;
    growth: number;
  };
}

interface TenantGrowthAnalytics {
  growth: { date: string; total: number; new: number; churned: number }[];
  summary: {
    initialTotal: number;
    finalTotal: number;
    newTenants: number;
    churnedTenants: number;
    growthPercentage: number;
  };
}

interface SubscriptionAnalytics {
  distribution: { plan: string; count: number; percentage: number }[];
}

export default function AnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState('30'); // Default to 30 days
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mrrData, setMrrData] = useState<MrrData | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [tenantGrowthAnalytics, setTenantGrowthAnalytics] = useState<TenantGrowthAnalytics | null>(null);
  const [subscriptionAnalytics, setSubscriptionAnalytics] = useState<SubscriptionAnalytics | null>(null);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      // MRR
      const mrrRes = await fetch('/api/admin/analytics/mrr');
      if (!mrrRes.ok) throw new Error('Failed to fetch MRR data');
      setMrrData(await mrrRes.json());

      // Revenue
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - parseInt(timeRange));
      const revenueRes = await fetch(
        `/api/admin/analytics/revenue?startDate=${startDate.toISOString()}&endDate=${today.toISOString()}&interval=day`
      );
      if (!revenueRes.ok) throw new Error('Failed to fetch revenue data');
      setRevenueAnalytics(await revenueRes.json());

      // Tenant Growth
      const tenantGrowthRes = await fetch(`/api/admin/analytics/tenants?days=${timeRange}`);
      if (!tenantGrowthRes.ok) throw new Error('Failed to fetch tenant growth data');
      setTenantGrowthAnalytics(await tenantGrowthRes.json());

      // Subscriptions
      const subscriptionRes = await fetch('/api/admin/analytics/subscriptions');
      if (!subscriptionRes.ok) throw new Error('Failed to fetch subscription data');
      setSubscriptionAnalytics(await subscriptionRes.json());

    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']} redirectToLogin={true}>
      <motion.div
        className="space-y-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUp}>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Advanced Analytics
          </h1>
          <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
            Comprehensive insights into platform performance and growth.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="space-y-8">
            <motion.div variants={fadeInUp}>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="365">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Metric Cards */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" variants={fadeInUp}>
              <MetricCard
                title="Monthly Recurring Revenue"
                value={`$${mrrData?.current.toFixed(2) || '0.00'}`}
                trend={mrrData?.growth}
                description="Compared to last month"
              />
              <MetricCard
                title="Total Revenue"
                value={`$${revenueAnalytics?.summary.total.toFixed(2) || '0.00'}`}
                trend={revenueAnalytics?.summary.growth}
                description={`Over the last ${timeRange} days`}
              />
              <MetricCard
                title="Active Tenants"
                value={tenantGrowthAnalytics?.summary.finalTotal || 0}
                trend={tenantGrowthAnalytics?.summary.growthPercentage}
                description={`Growth over ${timeRange} days`}
              />
              {/* Add Conversion Rate or other relevant KPIs later if needed */}
              <MetricCard
                title="New Tenants"
                value={tenantGrowthAnalytics?.summary.newTenants || 0}
                description={`New sign-ups in last ${timeRange} days`}
              />
            </motion.div>

            {/* Charts */}
            <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-4" variants={fadeInUp}>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  {revenueAnalytics?.data && <RevenueChart data={revenueAnalytics.data} />}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {subscriptionAnalytics?.distribution && (
                    <SubscriptionPieChart data={subscriptionAnalytics.distribution} />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div className="grid grid-cols-1" variants={fadeInUp}>
                <Card>
                    <CardHeader>
                        <CardTitle>Tenant Growth Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tenantGrowthAnalytics?.growth && <TenantGrowthChart data={tenantGrowthAnalytics.growth} />}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Top Tenants Table (Placeholder for now) */}
            {/* <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Top Tenants by Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Coming Soon...</p>
                </CardContent>
              </Card>
            </motion.div> */}
          </div>
        )}
      </motion.div>
    </RoleGuard>
  );
}
