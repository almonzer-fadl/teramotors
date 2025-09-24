"use client";

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

export function Skeleton({ 
  className = "", 
  width = "100%", 
  height = "1rem", 
  rounded = false,
  animate = true 
}: SkeletonProps) {
  return (
    <div
      className={`bg-gray-200 ${rounded ? 'rounded-full' : 'rounded'} ${
        animate ? 'animate-pulse' : ''
      } ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonText({ lines = 1, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} height="1rem" />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton width={48} height={48} rounded />
        <div className="flex-1">
          <Skeleton height="1.25rem" width="60%" className="mb-2" />
          <Skeleton height="1rem" width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4, className = "" }: { 
  rows?: number; 
  columns?: number; 
  className?: string 
}) {
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="px-6 py-4 border-b">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} height="1rem" width="20%" />
          ))}
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} height="1rem" width="20%" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboard({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64" />
      </div>

      {/* Recent Activity */}
      <SkeletonTable rows={6} columns={4} />
    </div>
  );
}

export function SkeletonCustomerList({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow">
        <Skeleton height="2.5rem" width="100%" />
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonVehicleList({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-4">
          <Skeleton height="2.5rem" width="200px" />
          <Skeleton height="2.5rem" width="150px" />
          <Skeleton height="2.5rem" width="150px" />
        </div>
      </div>

      {/* Vehicle Table */}
      <SkeletonTable rows={8} columns={5} />
    </div>
  );
}

export function SkeletonAppointmentList({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Calendar Header */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <Skeleton height="2rem" width="200px" />
          <div className="flex space-x-2">
            <Skeleton height="2rem" width="100px" />
            <Skeleton height="2rem" width="100px" />
          </div>
        </div>
      </div>

      {/* Appointment Cards */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center space-x-4">
              <Skeleton width={12} height={12} rounded />
              <div className="flex-1">
                <Skeleton height="1.25rem" width="40%" className="mb-2" />
                <Skeleton height="1rem" width="60%" />
              </div>
              <Skeleton height="2rem" width="80px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonJobCardList({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height="2rem" width="100px" />
          ))}
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Skeleton height="1.5rem" width="30%" className="mb-2" />
                <Skeleton height="1rem" width="50%" />
              </div>
              <Skeleton height="2rem" width="100px" />
            </div>
            <SkeletonText lines={2} />
            <div className="mt-4 flex space-x-2">
              <Skeleton height="2rem" width="80px" />
              <Skeleton height="2rem" width="80px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonInvoiceList({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Invoice Table */}
      <SkeletonTable rows={10} columns={6} />
    </div>
  );
}

export function SkeletonInventoryList({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <Skeleton width={60} height={60} className="mb-3" />
            <Skeleton height="1.25rem" width="80%" className="mb-2" />
            <Skeleton height="1rem" width="60%" className="mb-2" />
            <Skeleton height="1rem" width="40%" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading Spinner Component
export function LoadingSpinner({ 
  size = "md", 
  className = "" 
}: { 
  size?: "sm" | "md" | "lg"; 
  className?: string 
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`} />
  );
}

// Loading Button Component
export function LoadingButton({ 
  loading = false, 
  children, 
  className = "",
  ...props 
}: { 
  loading?: boolean; 
  children: React.ReactNode; 
  className?: string;
  [key: string]: any;
}) {
  return (
    <button
      disabled={loading}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
}

export default Skeleton;
