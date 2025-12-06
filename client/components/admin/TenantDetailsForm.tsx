"use client";

import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/dashboard-animations';

interface TenantDetails {
  _id: string;
  name: string;
  email: string;
  status: 'active' | 'disabled';
  createdAt: string;
}

interface TenantDetailsFormProps {
  tenant: TenantDetails;
  onUpdate: (updatedTenant: TenantDetails) => void;
}

export default function TenantDetailsForm({ tenant, onUpdate }: TenantDetailsFormProps) {
  const [formData, setFormData] = useState<TenantDetails>(tenant);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(tenant);
  }, [tenant]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as 'active' | 'disabled' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/tenants/${tenant._id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update tenant');
      }

      const result = await response.json();
      toast.success('Tenant updated successfully!');
      onUpdate(result.tenant); // Notify parent component of update
    } catch (err: any) {
      toast.error(`Error updating tenant: ${err.message}`);
      console.error('Error updating tenant:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form onSubmit={handleSubmit} variants={fadeInUp} className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Tenant Details</h3>
      
      <div>
        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Tenant Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="mt-1 block w-full"
          disabled={loading}
        />
      </div>
      
      <div>
        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Admin Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          className="mt-1 block w-full"
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleSelectChange('status', value)}
          disabled={loading}
        >
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );
}
