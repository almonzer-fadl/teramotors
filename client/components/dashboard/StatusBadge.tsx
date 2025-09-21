'use client';

interface StatusBadgeProps {
  status: string;
}

const statusColors: { [key: string]: string } = {
  // Appointment Statuses
  scheduled: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',

  // Job Card Statuses
  pending: 'bg-gray-100 text-gray-800',
  
  // Invoice Statuses
  paid: 'bg-green-100 text-green-800',
  unpaid: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-800',

  // Estimate Statuses
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-yellow-100 text-yellow-800',

  // Default
  default: 'bg-gray-100 text-gray-800',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = statusColors[status.toLowerCase()] || statusColors.default;
  const formattedStatus = status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {formattedStatus}
    </span>
  );
}
