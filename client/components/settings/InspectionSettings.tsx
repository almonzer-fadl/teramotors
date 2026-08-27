'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Clipboard, DollarSign, CheckCircle, MessageSquare } from 'lucide-react';
import { fadeInUp } from '@/lib/dashboard-animations';
import { useTranslation } from 'react-i18next';

interface InspectionConfig {
  defaultFee: number;
  invoiceDueDays: number;
  estimateValidityDays: number;
  autoCloseInspectionJobCard: boolean;
  autoGenerateEstimate: boolean;
  autoGenerateInvoice: boolean;
  whatsappNotifications: boolean;
}

export default function InspectionSettings() {
  const { t, i18n } = useTranslation('common');
  const isRTL = i18n.language === 'ar';
  const [config, setConfig] = useState<InspectionConfig>({
    defaultFee: 150,
    invoiceDueDays: 7,
    estimateValidityDays: 30,
    autoCloseInspectionJobCard: true,
    autoGenerateEstimate: true,
    autoGenerateInvoice: true,
    whatsappNotifications: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/inspection');
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/settings/inspection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: t('settings.inspection.settings_saved_success', 'Inspection settings saved successfully!') });
      } else {
        setMessage({ type: 'error', text: t('settings.inspection.settings_saved_error', 'Failed to save settings. Please try again.') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('settings.inspection.error_occurred', 'An error occurred while saving settings.') });
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
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center me-4">
            <Clipboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.inspection.title', 'Inspection Automation')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.inspection.description', 'Configure inspection workflow settings')}</p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            {t('settings.inspection.workflow_note', 'These settings control the automated workflow when an inspection is marked as completed.')}
          </p>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center me-3">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.inspection.pricing_validity', 'Pricing & Validity')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.inspection.default_fee', 'Default Inspection Fee')}
            </label>
            <input
              type="number"
              value={config.defaultFee}
              onChange={(e) => setConfig({ ...config, defaultFee: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#F97402] focus:border-transparent"
              min="0"
              step="0.01"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('settings.inspection.fee_description', 'Fee charged for inspection service')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.inspection.invoice_due_days', 'Invoice Due (Days)')}
            </label>
            <input
              type="number"
              value={config.invoiceDueDays}
              onChange={(e) => setConfig({ ...config, invoiceDueDays: parseInt(e.target.value) || 7 })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#F97402] focus:border-transparent"
              min="1"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('settings.inspection.invoice_due_description', 'Payment due date for invoices')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.inspection.estimate_validity_days', 'Estimate Validity (Days)')}
            </label>
            <input
              type="number"
              value={config.estimateValidityDays}
              onChange={(e) => setConfig({ ...config, estimateValidityDays: parseInt(e.target.value) || 30 })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#F97402] focus:border-transparent"
              min="1"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('settings.inspection.estimate_validity_description', 'How long estimates remain valid')}
            </p>
          </div>
        </div>
      </div>

      {/* Automation Section */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center me-3">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.inspection.automation_options', 'Automation Options')}</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{t('settings.inspection.auto_generate_estimate', 'Auto-generate Estimate')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('settings.inspection.auto_generate_estimate_description', 'Automatically create estimate from inspection items needing repair')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoGenerateEstimate}
                onChange={(e) => setConfig({ ...config, autoGenerateEstimate: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#F97402]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F97402]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{t('settings.inspection.auto_generate_invoice', 'Auto-generate Invoice')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('settings.inspection.auto_generate_invoice_description', 'Automatically create invoice for inspection fee')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoGenerateInvoice}
                onChange={(e) => setConfig({ ...config, autoGenerateInvoice: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#F97402]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F97402]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{t('settings.inspection.auto_close_job_card', 'Auto-close Inspection Job Card')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('settings.inspection.auto_close_job_card_description', 'Mark inspection job card as completed automatically')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoCloseInspectionJobCard}
                onChange={(e) => setConfig({ ...config, autoCloseInspectionJobCard: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#F97402]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F97402]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center me-3">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.inspection.notifications', 'Notifications')}</h3>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">{t('settings.inspection.whatsapp_notifications', 'WhatsApp Notifications')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('settings.inspection.whatsapp_notifications_description', 'Send WhatsApp message to customer when inspection is completed')}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.whatsappNotifications}
              onChange={(e) => setConfig({ ...config, whatsappNotifications: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#F97402]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F97402]"></div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className={`flex items-center ${isRTL ? 'justify-start' : 'justify-end'} gap-4`}>
        {message && (
          <div className={`px-4 py-2 rounded-xl ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2"></div>
              {t('forms.saving', 'Saving...')}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 me-2" />
              {t('settings.save_changes', 'Save Settings')}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
