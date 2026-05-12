'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Cog, DollarSign } from 'lucide-react';
import { fadeInUp } from '@/lib/dashboard-animations';
import toast from 'react-hot-toast';

interface PlatformDefaultsConfig {
  defaultInspectionFee: number;
  // Add other global default settings here
}

export default function PlatformDefaultsSettings() {
  const [config, setConfig] = useState<PlatformDefaultsConfig>({
    defaultInspectionFee: 150, // Initial default value
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // TODO: Fetch global platform default settings from an API endpoint
    // This API endpoint would be for super admin only and would manage truly global defaults
    // For now, using a hardcoded default.
    const fetchGlobalDefaults = async () => {
      setLoading(true);
      try {
        // Example: const response = await fetch('/api/admin/settings/platform-defaults');
        // const data = await response.json();
        // setConfig(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalDefaults();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to save global platform default settings
      // Example: const response = await fetch('/api/admin/settings/platform-defaults', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(config),
      // });
      // if (!response.ok) throw new Error('Failed to save global defaults');
      toast.success('Platform default settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save platform default settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97402]"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center me-3">
            <Cog className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform-wide Defaults</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Inspection Fee
            </label>
            <input
              type="number"
              value={config.defaultInspectionFee}
              onChange={(e) => setConfig({ ...config, defaultInspectionFee: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#F97402] focus:border-transparent"
              min="0"
              step="0.01"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This will be the default inspection fee for new tenants. Individual tenants can override this in their own settings.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white me-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 me-2" />
              Save Platform Defaults
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
