"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, scaleIn, staggerContainer } from '@/lib/dashboard-animations';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

interface TenantUsersTableProps {
  users: User[];
  tenantName: string;
  loading: boolean;
}

export default function TenantUsersTable({ users, tenantName, loading }: TenantUsersTableProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.h3 variants={fadeInUp} className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Users for {tenantName}
      </motion.h3>

      <motion.div variants={fadeInUp} className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  <p className="mt-2 text-gray-500">Loading users...</p>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                  No users found for this tenant.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <motion.tr key={user._id} variants={scaleIn} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <TableCell>{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  );
}
