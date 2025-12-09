import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2, Search } from 'lucide-react';
import { scaleIn, fadeInUp, staggerContainer } from '@/lib/dashboard-animations';
import toast from 'react-hot-toast';
import TenantStatusToggle from './TenantStatusToggle'; // Import the new component

interface Tenant {
  _id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  userCount: number;
  createdAt: string;
}

interface TenantApiResponse {
  tenants: Tenant[];
  total: number;
  page: number;
  limit: number;
}

export default function TenantManagementTable() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [totalTenants, setTotalTenants] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/tenants?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tenants');
      }
      const data: TenantApiResponse = await response.json();
      setTenants(data.tenants);
      setTotalTenants(data.total);
    } catch (err: any) {
      toast.error(err.message);
      console.error('Error fetching tenants:', err);
      setTenants([]);
      setTotalTenants(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [currentPage, itemsPerPage, searchQuery]);

  const totalPages = useMemo(() => Math.ceil(totalTenants / itemsPerPage), [totalTenants, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRowClick = (tenantId: string) => {
    router.push(`/admin/system/tenants/${tenantId}`);
  };

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search tenants by name..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-2 border rounded-lg w-full bg-white dark:bg-gray-800"
          />
        </div>
      </motion.div>

      <motion.div variants={fadeInUp} className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableHead className="w-[200px]">Tenant Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  <p className="mt-2 text-gray-500">Loading tenants...</p>
                </TableCell>
              </TableRow>
            ) : tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  No tenants found.
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => (
                <motion.tr 
                  key={tenant._id} 
                  variants={scaleIn} 
                  className="hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(tenant._id)}
                >
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>{tenant.email}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <TenantStatusToggle tenantId={tenant._id} initialStatus={tenant.status} />
                  </TableCell>
                  <TableCell>{tenant.userCount}</TableCell>
                  <TableCell>{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      <motion.div variants={fadeInUp} className="flex items-center justify-between px-2 py-4">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          variant="outline"
          className="text-gray-700 dark:text-gray-300"
        >
          Previous
        </Button>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          variant="outline"
          className="text-gray-700 dark:text-gray-300"
        >
          Next
        </Button>
      </motion.div>
    </motion.div>
  );
}
