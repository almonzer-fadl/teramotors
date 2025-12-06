"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/dashboard-animations';
import toast from 'react-hot-toast';

interface Log {
  _id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'audit';
  message: string;
  tenantId?: { _id: string; name: string };
  userId?: { _id: string; name: string; email: string };
  resource: { type: string; id?: string };
  action: string;
}

interface LogsApiResponse {
  logs: Log[];
  total: number;
  page: number;
  limit: number;
}

export default function SystemLogsViewer() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [filters, setFilters] = useState({
    level: '',
    tenantId: '',
    userId: '',
    search: '',
  });
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      // Append filters only if they have a value
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/admin/logs?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch logs');
      
      const data: LogsApiResponse = await response.json();
      setLogs(data.logs);
      setTotalLogs(data.total);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, itemsPerPage, filters]);

  const totalPages = useMemo(() => Math.ceil(totalLogs / itemsPerPage), [totalLogs, itemsPerPage]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'warn': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'audit': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.h3 variants={fadeInUp} className="text-xl font-bold text-gray-900 dark:text-white">
        System Activity Logs
      </motion.h3>

      {/* Filters */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <Input
          placeholder="Search message..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        <Input
          placeholder="Filter by Tenant ID..."
          value={filters.tenantId}
          onChange={(e) => handleFilterChange('tenantId', e.target.value)}
        />
        <Input
          placeholder="Filter by User ID..."
          value={filters.userId}
          onChange={(e) => handleFilterChange('userId', e.target.value)}
        />
        <Select value={filters.level} onValueChange={(value) => handleFilterChange('level', value)}>
          <SelectTrigger><SelectValue placeholder="Filter by level..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="audit">Audit</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={fadeInUp} className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableHead>Timestamp</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">No logs found for the current filters.</TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{log.message}</TableCell>
                  <TableCell>{log.tenantId?.name || 'N/A'}</TableCell>
                  <TableCell>{log.userId?.name || 'System'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      <motion.div variants={fadeInUp} className="flex items-center justify-between px-2 py-4">
        <Button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1 || loading}>Previous</Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages || loading}>Next</Button>
      </motion.div>
    </motion.div>
  );
}
