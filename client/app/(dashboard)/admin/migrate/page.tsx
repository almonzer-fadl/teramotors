'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Database, ArrowLeft } from 'lucide-react';
import { fadeInUp } from '@/lib/dashboard-animations';
import { RoleGuard } from '@/components/RoleGuard';

export default function MigratePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const runMigration = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/maintenance/migrate-tenant-ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Migration failed');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']} redirectToLogin={true}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="space-y-8"
          >
            {/* Header */}
            <div>
            <button
              onClick={() => router.back()}
              className="mb-4 p-3 text-gray-600 dark:text-gray-400 hover:text-[#F97402] transition-all duration-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 group inline-flex items-center"
            >
              <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Database Migration Tool
            </h1>
            <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
              Manage database migrations and data fixes
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="px-6 sm:px-8 py-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  Migrate Tenant IDs
                </h3>
              </div>

              <div className="mb-8 space-y-4">
                <p className="text-base text-gray-700 dark:text-gray-300">
                  This migration will add tenantId to existing WorkLog and WhatsAppMessage records.
                </p>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                  <p className="text-sm text-yellow-800 dark:text-yellow-400 flex items-start">
                    <span className="text-xl mr-2">⚠️</span>
                    <span>This should only be run once to fix existing data. Running it multiple times is safe but unnecessary.</span>
                  </p>
                </div>
              </div>

              <button
                onClick={runMigration}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Running Migration...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-5 w-5" />
                    Run Migration
                  </>
                )}
              </button>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl"
                >
                  <h3 className="text-red-800 dark:text-red-400 font-semibold text-lg mb-3 flex items-center">
                    <span className="text-2xl mr-2">❌</span>
                    Migration Error
                  </h3>
                  <p className="text-red-600 dark:text-red-300 text-base">{error}</p>
                </motion.div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl"
                >
                  <h3 className="text-green-800 dark:text-green-400 font-semibold text-lg mb-4 flex items-center">
                    <span className="text-2xl mr-2">✅</span>
                    Migration Complete
                  </h3>
                  <div className="text-green-700 dark:text-green-300 space-y-3 text-base">
                    <p className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="font-medium">WorkLogs updated:</span>
                      <span className="ml-2 font-semibold">{result.workLogsUpdated}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="font-medium">WhatsApp messages updated:</span>
                      <span className="ml-2 font-semibold">{result.whatsappMessagesUpdated}</span>
                    </p>
                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                        <p className="font-semibold mb-2 text-yellow-700 dark:text-yellow-400">Warnings:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {result.errors.map((err: string, idx: number) => (
                            <li key={idx} className="text-yellow-600 dark:text-yellow-300">{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    </RoleGuard>
  );
}
