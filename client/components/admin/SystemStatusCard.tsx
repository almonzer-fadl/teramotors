"use client";

import PlugAnimation from './PlugAnimation';

interface SystemStatusCardProps {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'checking';
  message: string;
}

export default function SystemStatusCard({ name, status, message }: SystemStatusCardProps) {
  const statusColors = {
    operational: 'text-green-500',
    degraded: 'text-yellow-500',
    outage: 'text-red-500',
    checking: 'text-blue-500',
  };

  return (
    <div className="flex items-center p-4">
      <div className="flex-shrink-0">
        <PlugAnimation status={status} />
      </div>
      <div className="ms-4 flex-grow">
        <p className="text-lg font-bold text-gray-900 dark:text-white">{name}</p>
        <p className={`text-sm ${statusColors[status]}`}>{message}</p>
      </div>
      <div className={`text-sm font-bold uppercase tracking-wider ${statusColors[status]}`}>
        {status}
      </div>
    </div>
  );
}
