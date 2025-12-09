'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface WorkingHours {
  start: string;
  end: string;
  closed: boolean;
}

interface BookingSettings {
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

export default function BookingSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tenantSlug, setTenantSlug] = useState('');

  const [settings, setSettings] = useState<BookingSettings>({
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
      // Fetch current tenant settings
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();
      setTenantSlug(data.tenant?.slug || '');

      if (data.tenant?.bookingSettings) {
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
    day: keyof BookingSettings['workingHours'],
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

  const copyToAllDays = (day: keyof BookingSettings['workingHours']) => {
    const daySettings = settings.workingHours[day];
    const newWorkingHours = Object.keys(settings.workingHours).reduce(
      (acc, d) => ({
        ...acc,
        [d]: { ...daySettings },
      }),
      {} as BookingSettings['workingHours']
    );

    setSettings({
      ...settings,
      workingHours: newWorkingHours,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const bookingUrl = tenantSlug ? `${window.location.origin}/book/${tenantSlug}` : '';

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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Online Booking Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure your online booking system for customers
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6">
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Enable/Disable Booking */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Enable Online Booking</h2>
              <p className="text-gray-600 text-sm">
                Allow customers to book appointments online 24/7
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.enabled && bookingUrl && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Your Booking URL:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bookingUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded text-sm"
                />
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(bookingUrl)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">General Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Buffer Time (minutes)</label>
              <input
                type="number"
                value={settings.bufferTime}
                onChange={(e) =>
                  setSettings({ ...settings, bufferTime: parseInt(e.target.value) })
                }
                min="0"
                max="120"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ms-2 text-sm font-medium">Require Approval</span>
              </label>
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Working Hours</h2>

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
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ms-2 font-medium">{label}</span>
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
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={settings.workingHours[key].end}
                        onChange={(e) => handleWorkingHoursChange(key, 'end', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToAllDays(key)}
                      className="text-sm text-blue-600 hover:text-blue-800"
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
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {isSaving && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            )}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
