'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Migrate Tenant IDs
          </h1>

          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This migration will add tenantId to existing WorkLog and WhatsAppMessage records.
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-500 mb-4">
              ⚠️ This should only be run once to fix existing data.
            </p>
          </div>

          <button
            onClick={runMigration}
            disabled={loading}
            className="px-4 py-2 bg-[#F97402] hover:bg-[#F13F33] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Running Migration...' : 'Run Migration'}
          </button>

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h3 className="text-red-800 dark:text-red-400 font-semibold mb-2">Error</h3>
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h3 className="text-green-800 dark:text-green-400 font-semibold mb-2">Migration Complete</h3>
              <div className="text-green-600 dark:text-green-300 space-y-2">
                <p>✅ WorkLogs updated: {result.workLogsUpdated}</p>
                <p>✅ WhatsApp messages updated: {result.whatsappMessagesUpdated}</p>
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold">Errors:</p>
                    <ul className="list-disc list-inside text-sm">
                      {result.errors.map((err: string, idx: number) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
