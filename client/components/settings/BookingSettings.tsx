'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Settings as SettingsIcon, Check, Copy, ExternalLink } from 'lucide-react';
import { fadeInUp } from '@/lib/dashboard-animations';

interface WorkingHours {
  start: string;
  end: string;
  closed: boolean;
}

interface BookingSettingsData {
  enabled: boolean;
  workingHours: {
    monday: WorkingHours;
    tuesday: WorkingHours;
    wednesday: WorkingHours;
    thursday: WorkingHours;
    friday: WorkingHours;
    saturday: WorkingHours;
    sunday: WorkingHours;
  };
  appointmentDuration: number;
  bufferTime: number;
  advanceBookingDays: number;
  requireApproval: boolean;
}

export default function BookingSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tenantSlug, setTenantSlug] = useState('');
  const [copied, setCopied] = useState(false);

  const [settings, setSettings] = useState<BookingSettingsData>({
    enabled: false,
    workingHours: {
      monday: { start: '08:00', end: '17:00', closed: false },
      tuesday: { start: '08:00', end: '17:00', closed: false },
      wednesday: { start: '08:00', end: '17:00', closed: false },
      thursday: { start: '08:00', end: '17:00', closed: false },
      friday: { start: '08:00', end: '17:00', closed: true },
      saturday: { start: '08:00', end: '17:00', closed: false },
      sunday: { start: '08:00', end: '17:00', closed: false },
    },
    appointmentDuration: 60,
    bufferTime: 15,
    advanceBookingDays: 30,
    requireApproval: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();
      setTenantSlug(data.tenant?.slug || '');

      if (data.tenant?.bookingSettings && Object.keys(data.tenant.bookingSettings).length > 0) {
        setSettings(data.tenant.bookingSettings);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/settings/booking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingSettings: settings }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWorkingHoursChange = (
    day: keyof BookingSettingsData['workingHours'],
    field: keyof WorkingHours,
    value: string | boolean
  ) => {
    setSettings({
      ...settings,
      workingHours: {
        ...settings.workingHours,
        [day]: {
          ...settings.workingHours[day],
          [field]: value,
        },
      },
    });
  };

  const copyToAllDays = (day: keyof BookingSettingsData['workingHours']) => {
    const daySettings = settings.workingHours[day];
    const newWorkingHours = Object.keys(settings.workingHours).reduce(
      (acc, d) => ({
        ...acc,
        [d]: { ...daySettings },
      }),
      {} as BookingSettingsData['workingHours']
    );

    setSettings({
      ...settings,
      workingHours: newWorkingHours,
    });
  };

  const copyBookingUrl = () => {
    if (tenantSlug) {
      const url = `${window.location.origin}/book/${tenantSlug}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97402]"></div>
      </div>
    );
  }

  const bookingUrl = tenantSlug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${tenantSlug}` : '';

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ] as const;

  return (
    <motion.div variants={fadeInUp} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-3 rounded-xl flex items-center">
          <Check className="w-5 h-5 mr-2" />
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Enable/Disable Booking */}
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[#F97402]/10 to-[#F13F33]/10 rounded-xl">
                <Calendar className="w-6 h-6 text-[#F97402]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Enable Online Booking</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Allow customers to book appointments online 24/7
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#F97402]/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-[#F97402] peer-checked:to-[#F13F33]"></div>
            </label>
          </div>

          {settings.enabled && bookingUrl && (
            <div className="mt-6 p-4 bg-gradient-to-r from-[#F97402]/5 to-[#F13F33]/5 rounded-xl border border-[#F97402]/20">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Your Booking URL:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bookingUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={copyBookingUrl}
                  className="px-4 py-2 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white rounded-lg hover:opacity-90 transition-opacity text-sm flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </a>
              </div>
            </div>
          )}
        </div>

        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl">
              <SettingsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">General Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Appointment Duration (minutes)
              </label>
              <input
                type="number"
                value={settings.appointmentDuration}
                onChange={(e) =>
                  setSettings({ ...settings, appointmentDuration: parseInt(e.target.value) })
                }
                min="15"
                max="480"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97402] bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buffer Time (minutes)
              </label>
              <input
                type="number"
                value={settings.bufferTime}
                onChange={(e) =>
                  setSettings({ ...settings, bufferTime: parseInt(e.target.value) })
                }
                min="0"
                max="120"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97402] bg-white dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Advance Booking Days
              </label>
              <input
                type="number"
                value={settings.advanceBookingDays}
                onChange={(e) =>
                  setSettings({ ...settings, advanceBookingDays: parseInt(e.target.value) })
                }
                min="1"
                max="365"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97402] bg-white dark:bg-gray-900"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireApproval}
                  onChange={(e) =>
                    setSettings({ ...settings, requireApproval: e.target.checked })
                  }
                  className="w-5 h-5 text-[#F97402] border-gray-300 rounded focus:ring-[#F97402]"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Require Manual Approval
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Working Hours</h2>
          </div>

          <div className="space-y-4">
            {days.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-4">
                <div className="w-32">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!settings.workingHours[key].closed}
                      onChange={(e) =>
                        handleWorkingHoursChange(key, 'closed', !e.target.checked)
                      }
                      className="w-4 h-4 text-[#F97402] border-gray-300 rounded focus:ring-[#F97402]"
                    />
                    <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                </div>

                {!settings.workingHours[key].closed && (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={settings.workingHours[key].start}
                        onChange={(e) =>
                          handleWorkingHoursChange(key, 'start', e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97402] bg-white dark:bg-gray-900"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={settings.workingHours[key].end}
                        onChange={(e) => handleWorkingHoursChange(key, 'end', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97402] bg-white dark:bg-gray-900"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToAllDays(key)}
                      className="text-sm text-[#F97402] hover:text-[#F13F33] font-medium transition-colors"
                    >
                      Copy to all
                    </button>
                  </>
                )}

                {settings.workingHours[key].closed && (
                  <span className="text-gray-500 italic">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white rounded-xl font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-[#F97402]/25"
          >
            {isSaving && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            )}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
