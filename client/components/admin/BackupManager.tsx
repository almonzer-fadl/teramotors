'use client';

import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Download, HardDriveRestore, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';

interface IBackup {
  _id: string;
  type: 'full' | 'tenant';
  filename: string;
  size: number;
  status: 'in_progress' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function BackupManager() {
  const [backups, setBackups] = useState<IBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/backup');
      if (!response.ok) throw new Error('Failed to fetch backups.');
      const data = await response.json();
      setBackups(data.backups);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'full' }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to start backup.');
      }
      // Refresh list after a short delay to allow backup to appear
      setTimeout(fetchBackups, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleRestore = async (backupId: string) => {
    try {
        const response = await fetch(`/api/admin/backup/${backupId}/restore`, {
            method: 'POST',
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Failed to restore backup.');
        }
        alert('Restore process started successfully.');
    } catch (err: any) {
        setError(err.message);
    }
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Backup & Recovery</CardTitle>
        <Button onClick={handleCreateBackup} disabled={isCreating}>
          <PlusCircle className="me-2 h-4 w-4" />
          {isCreating ? 'Creating Backup...' : 'Create Full Backup'}
        </Button>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 mb-4">Error: {error}</div>}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>}
            {!loading && backups.map((backup) => (
              <TableRow key={backup._id}>
                <TableCell>{format(new Date(backup.createdAt), 'PPpp')}</TableCell>
                <TableCell>{backup.type}</TableCell>
                <TableCell>{backup.status}</TableCell>
                <TableCell>{formatBytes(backup.size)}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/api/admin/backup/${backup._id}/download`} download>
                      <Download className="me-2 h-4 w-4" /> Download
                    </a>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <HardDriveRestore className="me-2 h-4 w-4" /> Restore
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will restore the database to the state of this backup. All data created after this backup will be lost. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRestore(backup._id)}>
                          Yes, Restore
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
