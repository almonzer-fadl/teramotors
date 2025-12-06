"use client";

import { useState } from 'react';
import { Switch } from '@/components/ui/switch'; // Assuming a Switch component exists
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

interface TenantStatusToggleProps {
  tenantId: string;
  initialStatus: 'active' | 'suspended' | 'trial' | 'cancelled';
}

export default function TenantStatusToggle({ tenantId, initialStatus }: TenantStatusToggleProps) {
  const [isActive, setIsActive] = useState(initialStatus === 'active' || initialStatus === 'trial');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    const newStatus = checked ? 'active' : 'suspended';
    toast.loading('Updating status...');

    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      setIsActive(checked);
      toast.dismiss();
      toast.success(`Tenant status updated to ${newStatus}.`);
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Update failed: ${error.message}`);
      // Revert UI on failure
      setIsActive(!checked);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`status-toggle-${tenantId}`}
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={isUpdating}
        aria-readonly={isUpdating}
      />
      <Label htmlFor={`status-toggle-${tenantId}`} className={`text-sm font-medium ${isActive ? 'text-green-600' : 'text-red-600'}`}>
        {isActive ? 'Active' : 'Suspended'}
      </Label>
    </div>
  );
}
