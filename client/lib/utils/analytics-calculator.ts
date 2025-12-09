import Tenant from '@/lib/models/Tenant';
import Invoice from '@/lib/models/Invoice';
import mongoose from 'mongoose';

// Define the structure for trend data
export interface TrendData {
  date: string;
  revenue: number;
  count: number;
}

// Helper function to get monthly value for a plan (placeholder values)
function getPlanMonthlyValue(plan: 'trial' | 'free' | 'basic' | 'professional' | 'enterprise'): number {
  switch (plan) {
    case 'basic':
      return 50;
    case 'professional':
      return 100;
    case 'enterprise':
      return 200;
    case 'trial':
    case 'free':
    default:
      return 0;
  }
}

export async function calculateMRR(): Promise<number> {
  await mongoose.connection.asPromise(); // Ensure connection is established
  const activeSubscriptions = await Tenant.find({
    'subscription.status': 'active'
  }).lean();

  return activeSubscriptions.reduce((mrr, tenant) => {
    const planValue = getPlanMonthlyValue(tenant.subscription.plan);
    return mrr + planValue;
  }, 0);
}

export async function calculateRevenueTrend(
  startDate: Date,
  endDate: Date,
  interval: 'day' | 'week' | 'month'
): Promise<TrendData[]> {
  await mongoose.connection.asPromise(); // Ensure connection is established

  let dateFormat: string;
  let groupBy: any;

  switch (interval) {
    case 'day':
      dateFormat = '%Y-%m-%d';
      groupBy = { $dateToString: { format: dateFormat, date: '$createdAt' } };
      break;
    case 'week':
      dateFormat = '%Y-%W'; // ISO Week
      groupBy = {
        year: { $year: '$createdAt' },
        week: { $isoWeek: '$createdAt' }
      };
      break;
    case 'month':
      dateFormat = '%Y-%m';
      groupBy = { $dateToString: { format: dateFormat, date: '$createdAt' } };
      break;
    default:
      dateFormat = '%Y-%m-%d';
      groupBy = { $dateToString: { format: dateFormat, date: '$createdAt' } };
  }

  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'paid'
      }
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ];

  const result = await Invoice.aggregate(pipeline).exec();

  // Format result to match TrendData interface
  return result.map(item => ({
    date: typeof item._id === 'object' ? `${item._id.year}-${item._id.week}` : item._id, // Handle week format
    revenue: item.revenue,
    count: item.count
  }));
}

export async function calculateTenantGrowth(
  startDate: Date,
  endDate: Date
): Promise<{ date: string; total: number; new: number; churned: number }[]> {
  await mongoose.connection.asPromise(); // Ensure connection is established

  // Get all tenants created up to endDate
  const allTenants = await Tenant.find({
    createdAt: { $lte: endDate }
  }).select('createdAt status subscription.endDate').lean();

  // Initialize data structure for each day in the range
  const dateMap: { [key: string]: { total: number; new: number; churned: number } } = {};
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    dateMap[dateStr] = { total: 0, new: 0, churned: 0 };
  }

  // Populate data
  for (const tenant of allTenants) {
    const creationDate = tenant.createdAt;
    const creationDateStr = creationDate.toISOString().split('T')[0];
    const churnDate = tenant.subscription?.endDate;
    const churnDateStr = churnDate ? churnDate.toISOString().split('T')[0] : null;

    // Calculate 'new' tenants for their creation day if within range
    if (creationDate >= startDate && creationDate <= endDate && dateMap[creationDateStr]) {
      dateMap[creationDateStr].new++;
    }

    // Calculate 'churned' tenants for their churn day if within the range
    if (churnDate && churnDate >= startDate && churnDate <= endDate && dateMap[churnDateStr] && tenant.status === 'cancelled') {
        dateMap[churnDateStr].churned++;
    }
  }

  // Calculate cumulative total
  const sortedDates = Object.keys(dateMap).sort();
  // Calculate initial cumulative total for tenants active before startDate
  let cumulativeTotal = allTenants.filter(t => t.createdAt < startDate && (t.status !== 'cancelled' || !t.subscription?.endDate || t.subscription.endDate >= startDate)).length;

  const growthData = sortedDates.map(dateStr => {
    // Add new tenants for this day
    cumulativeTotal += dateMap[dateStr].new;
    // Subtract churned tenants for this day
    cumulativeTotal -= dateMap[dateStr].churned;
    // Ensure cumulativeTotal doesn't go below 0
    cumulativeTotal = Math.max(0, cumulativeTotal);

    return {
      date: dateStr,
      total: cumulativeTotal,
      new: dateMap[dateStr].new,
      churned: dateMap[dateStr].churned,
    };
  });

  return growthData;
}

export async function calculateSubscriptionDistribution(): Promise<{ plan: string; count: number; percentage: number }[]> {
  await mongoose.connection.asPromise(); // Ensure connection is established

  const pipeline = [
    {
      $group: {
        _id: '$subscription.plan',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        plan: '$_id',
        count: 1
      }
    }
  ];

  const planCounts = await Tenant.aggregate(pipeline).exec();
  const totalTenants = planCounts.reduce((sum, item) => sum + item.count, 0);

  return planCounts.map(item => ({
    plan: item.plan,
    count: item.count,
    percentage: totalTenants > 0 ? (item.count / totalTenants) * 100 : 0
  }));
}

export async function calculateHistoricalMRR(date: Date): Promise<number> {
  await mongoose.connection.asPromise();

  // Find all tenants that were active on the given date
  const activeSubscriptions = await Tenant.find({
    'subscription.startDate': { $lte: date },
    $or: [
      { 'subscription.endDate': { $gte: date } },
      { 'subscription.endDate': null }
    ],
    'status': 'active' // Only active subscriptions count towards MRR
  }).lean();

  return activeSubscriptions.reduce((mrr, tenant) => {
    const planValue = getPlanMonthlyValue(tenant.subscription.plan);
    return mrr + planValue;
  }, 0);
}

