'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

interface UsageData {
  tenantId: string;
  name: string;
  users: {
    current: number;
    limit: number;
    percentage: number;
  };
  vehicles: {
    current: number;
    limit: number;
    percentage: number;
  };
}

const getProgressColor = (percentage: number) => {
  if (percentage > 90) return 'bg-red-500';
  if (percentage > 70) return 'bg-yellow-500';
  return 'bg-green-500';
};

export default function UsageMonitoringDashboard() {
  const [data, setData] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/usage');
        if (!response.ok) {
          throw new Error('Failed to fetch usage data');
        }
        const usageData = await response.json();
        setData(usageData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((tenant) =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Monitoring</CardTitle>
        <div className="mt-4">
          <Input
            placeholder="Search by tenant name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Vehicles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((tenant) => (
              <TableRow key={tenant.tenantId}>
                <TableCell className="font-medium">{tenant.name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-24">
                      <span>{tenant.users.current} / {tenant.users.limit}</span>
                    </div>
                    <Progress value={tenant.users.percentage} className={`w-48 h-2 ml-4 ${getProgressColor(tenant.users.percentage)}`} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-24">
                      <span>{tenant.vehicles.current} / {tenant.vehicles.limit}</span>
                    </div>
                    <Progress value={tenant.vehicles.percentage} className={`w-48 h-2 ml-4 ${getProgressColor(tenant.vehicles.percentage)}`} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
