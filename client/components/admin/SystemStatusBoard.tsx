"use client";

import { useState, useEffect } from 'react';
import SystemStatusCard from './SystemStatusCard';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Loader2, Activity, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface HealthComponent {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  message: string;
}

interface HealthResponse {
  overallStatus: 'operational' | 'degraded' | 'outage';
  components: HealthComponent[];
}

export default function SystemStatusBoard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true); // For initial load
  const [isPolling, setIsPolling] = useState(false); // For background refresh
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHealth = async () => {
    if (loading) { // if it's the first load
      setIsPolling(false);
    } else { // if it's a background poll
      setIsPolling(true);
    }

    try {
      const response = await fetch('/api/admin/health');
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Unauthorized: You must be a Super Admin to view system status.');
        } else {
          toast.error('Failed to fetch system health.');
        }
        setHealth(null);
        return;
      }
      const data: HealthResponse = await response.json();
      setHealth(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching system health:', error);
      toast.error('An unexpected error occurred while fetching system health.');
      setHealth(null);
    } finally {
      setLoading(false);
      setIsPolling(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const overallStatusConfig = {
    operational: { text: "All Systems Operational", icon: CheckCircle, color: "text-green-500" },
    degraded: { text: "Some Systems Degraded", icon: AlertCircle, color: "text-yellow-500" },
    outage: { text: "Major Outage Detected", icon: XCircle, color: "text-red-500" },
  };
  
  const OverAllIcon = health ? overallStatusConfig[health.overallStatus].icon : Loader2;
  const overallTextColor = health ? overallStatusConfig[health.overallStatus].color : "text-gray-500";


  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Activity className="w-6 h-6 me-3 text-primary" />
          Live System Status
        </h2>
        <motion.button
          onClick={fetchHealth}
          disabled={isPolling || loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-all"
        >
          {isPolling || loading ? (
            <Loader2 className="w-4 h-4 me-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 me-2" />
          )}
          <span>{isPolling || loading ? 'Checking...' : 'Refresh'}</span>
        </motion.button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-60">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : health ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {health.components.map((component) => (
            <SystemStatusCard 
              key={component.name} 
              name={component.name}
              status={isPolling ? 'checking' : component.status}
              message={isPolling ? 'Checking status...' : component.message}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-60 text-red-500">
          <AlertTriangle className="w-8 h-8 mb-2" />
          <p>Could not load system status.</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className={`flex items-center text-sm font-semibold ${overallTextColor}`}>
          <OverAllIcon className="w-5 h-5 me-2" />
          {health ? overallStatusConfig[health.overallStatus].text : "Loading Status..."}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}
        </p>
      </div>
    </div>
  );
}
