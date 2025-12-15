'use client';

import { useState } from 'react';
import ModernizedModal from '@/components/ui/ModernizedModal';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MessageSquare, AlertCircle } from 'lucide-react';

interface QuickCreateCustomerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (customer: { _id: string; firstName: string; lastName: string }) => void;
}

const formVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function QuickCreateCustomer({ isOpen, onClose, onCreated }: QuickCreateCustomerProps) {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    language: 'ar',
    whatsappEnabled: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const data = await response.json();
        const customer = data.customer || data;
        onCreated(customer);
        handleClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || errorData.message || t('forms.failed_to_create_customer'));
      }
    } catch (err) {
      setError(t('forms.failed_to_create_customer'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      language: 'ar',
      whatsappEnabled: true,
    });
    setError('');
    onClose();
  };

  return (
    <ModernizedModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('customers.quick_create_customer')}
      size="lg"
    >
      <motion.form
        variants={formVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {error && (
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3 bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 rounded-lg p-3"
          >
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.first_name')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder={t('forms.first_name_placeholder')}
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.last_name')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder={t('forms.last_name_placeholder')}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.email_address')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder={t('forms.email_placeholder')}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.phone_number')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder={t('forms.phone_placeholder')}
              />
            </div>
          </div>

          {/* Language Preference */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.language_preference')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MessageSquare className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="ar">{t('forms.arabic')}</option>
                <option value="en">{t('forms.english')}</option>
              </select>
            </div>
          </div>

          {/* WhatsApp Enabled */}
          <div className="space-y-2 flex items-center justify-start h-full pt-6">
            <input
              id="whatsapp-toggle"
              type="checkbox"
              checked={form.whatsappEnabled}
              onChange={(e) => setForm({ ...form, whatsappEnabled: e.target.checked })}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="whatsapp-toggle" className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.whatsapp_notifications')}
            </label>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex justify-end gap-4 pt-4 border-t border-black/10 dark:border-white/10">
          <motion.button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-3 text-sm font-bold rounded-lg text-gray-700 dark:text-gray-300 bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-300/50 dark:hover:bg-gray-600/50 transition-all disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t('forms.cancel')}
          </motion.button>
          <motion.button
            type="submit"
            disabled={loading}
            className="px-6 py-3 text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? t('forms.creating') : t('customers.create_customer')}
          </motion.button>
        </motion.div>
      </motion.form>
    </ModernizedModal>
  );
}