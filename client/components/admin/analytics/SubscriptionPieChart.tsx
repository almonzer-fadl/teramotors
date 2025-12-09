'use client';

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface SubscriptionPieChartProps {
  data: { plan: string; count: number; percentage: number }[];
}

export default function SubscriptionPieChart({ data }: SubscriptionPieChartProps) {
  const COLORS = ['#4ADE80', '#F97402', '#3B82F6', '#8B5CF6', '#FACC15', '#EF4444'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="plan"
          cx="50%"
          cy="50%"
          outerRadius={80}
          labelLine={false}
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `${value} tenants`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
