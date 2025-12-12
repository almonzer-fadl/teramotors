'use client';

import { useState } from 'react';
import ModernizedModal from '@/components/ui/ModernizedModal';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Wrench, DollarSign, Clock, AlertCircle, RotateCw } from 'lucide-react';

const generateServiceCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `SVC-${timestamp}-${random}`;
};

const createInitialFormState = () => ({
  code: generateServiceCode(),
  name: '',
  description: '',
  category: '',
  laborRate: 0,
  laborHours: 1,
  isActive: true,
  isTemplate: false,
});

interface QuickCreateServiceProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (service: { _id: string; name: string; laborHours: number; laborRate: number }) => void;
}

const formVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function QuickCreateService({ isOpen, onClose, onCreated }: QuickCreateServiceProps) {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState(createInitialFormState);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        code: form.code?.trim() ? form.code.trim().toUpperCase() : generateServiceCode(),
      };

      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const service = data.service || data;
        onCreated(service);
        handleClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || t('forms.failed_to_create_service'));
      }
    } catch (err) {
      console.error('Failed to create service:', err);
      setError(t('forms.failed_to_create_service'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(createInitialFormState());
    setError('');
    onClose();
  };
  
  const handleRegenerateCode = () => {
    setForm((prev) => ({ ...prev, code: generateServiceCode() }));
  };

  return (
    <ModernizedModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('services.quick_create_service')}
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
          {/* Service Name */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.service_name')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Wrench className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder={t('forms.service_name_placeholder')}
              />
            </div>
          </div>

          {/* Service Code */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.service_code')} <span className="text-gray-400 font-normal">({t('forms.auto_generated_hint')})</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="flex-1 w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono uppercase"
                placeholder={t('forms.service_code_placeholder')}
              />
              <motion.button
                type="button"
                onClick={handleRegenerateCode}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCw className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.category')}
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
            >
              <option value="">{t('forms.select_category')}</option>
              <option value="maintenance">{t('services.categories.maintenance')}</option>
              <option value="repair">{t('services.categories.repair')}</option>
              <option value="inspection">{t('services.categories.inspection')}</option>
              <option value="diagnostic">{t('services.categories.diagnostic')}</option>
              <option value="bodywork">{t('services.categories.bodywork')}</option>
              <option value="detailing">{t('services.categories.detailing')}</option>
              <option value="other">{t('services.categories.other')}</option>
            </select>
          </div>

          {/* Labor Hours */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.labor_hours')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                required
                min="0"
                step="0.5"
                value={form.laborHours}
                onChange={(e) => setForm({ ...form, laborHours: parseFloat(e.target.value) || 0 })}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="1.0"
              />
            </div>
          </div>

          {/* Labor Rate */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.labor_rate')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.laborRate}
                onChange={(e) => setForm({ ...form, laborRate: parseFloat(e.target.value) || 0 })}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.description')}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              placeholder={t('forms.description_placeholder')}
            />
          </div>

          {/* Active Status */}
          <div className="md:col-span-2 space-y-2 flex items-center">
            <input
              id="service-active-toggle"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="service-active-toggle" className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.service_active')}
            </label>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 rounded-lg p-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {t('services.quick_create_note')}
          </p>
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
            {loading ? t('forms.creating') : t('services.create_service')}
          </motion.button>
        </motion.div>
      </motion.form>
    </ModernizedModal>
  );
}