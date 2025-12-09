'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TenantGrowthData {
  date: string;
  total: number;
  new: number;
  churned: number;
}

interface TenantGrowthChartProps {
  data: TenantGrowthData[];
}

export default function TenantGrowthChart({ data }: TenantGrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="total"
          stackId="1"
          stroke="#8884d8"
          fill="#8884d8"
          name="Total Tenants"
        />
        <Area
          type="monotone"
          dataKey="new"
          stackId="1"
          stroke="#82ca9d"
          fill="#82ca9d"
          name="New Tenants"
        />
        <Area
          type="monotone"
          dataKey="churned"
          stackId="1"
          stroke="#ffc658"
          fill="#ffc658"
          name="Churned Tenants"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
