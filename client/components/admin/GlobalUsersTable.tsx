"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, Search, User } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/dashboard-animations';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  tenantId?: { _id: string; name: string };
  createdAt: string;
}

interface UsersApiResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export default function GlobalUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchQuery,
      });
      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data: UsersApiResponse = await response.json();
      setUsers(data.users);
      setTotalUsers(data.total);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search query
    const handler = setTimeout(() => {
      fetchUsers();
    }, 500); // 500ms delay
    
    return () => {
      clearTimeout(handler);
    };
  }, [currentPage, itemsPerPage, searchQuery]);

  const totalPages = useMemo(() => Math.ceil(totalUsers / itemsPerPage), [totalUsers, itemsPerPage]);

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.h3 variants={fadeInUp} className="text-xl font-bold text-gray-900 dark:text-white">
        Global User Management
      </motion.h3>

      {/* Filters */}
      <motion.div variants={fadeInUp}>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-2 border rounded-lg w-full bg-white dark:bg-gray-800"
          />
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">No users found.</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.tenantId?.name || 'N/A (Super Admin)'}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
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
