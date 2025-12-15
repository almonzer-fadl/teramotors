'use client';

import { useState, useEffect } from 'react';
import ModernizedModal from '@/components/ui/ModernizedModal';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Car, Calendar, Hash, AlertCircle } from 'lucide-react';
import { CAR_MAKES, getModelsForMake } from '@/lib/data/carMakesModels';

interface QuickCreateVehicleProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  onCreated: (vehicle: { _id: string; make: string; model: string; year: number }) => void;
}

const formVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function QuickCreateVehicle({ isOpen, onClose, customerId, onCreated }: QuickCreateVehicleProps) {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [customMake, setCustomMake] = useState(false);
  const [customModel, setCustomModel] = useState(false);

  const [form, setForm] = useState({
    customerId: customerId,
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    vin: '',
  });

  useEffect(() => {
    if (customerId) {
      setForm(prev => ({ ...prev, customerId }));
    }
  }, [customerId]);

  useEffect(() => {
    // When custom make is selected, automatically enable custom model input
    if (customMake) {
      setCustomModel(true);
      setAvailableModels([]);
      return;
    }

    // Only update available models when using predefined makes (not custom)
    if (form.make && !customMake) {
      const models = getModelsForMake(form.make);
      setAvailableModels(models);
      // Only reset model field if:
      // 1. We're not in custom model mode
      // 2. The current model isn't in the available models list
      if (!customModel && form.model && !models.includes(form.model)) {
        setForm(prev => ({ ...prev, model: '' }));
      }
    } else {
      // Clear available models when in custom make mode or no make selected
      setAvailableModels([]);
    }
  }, [form.make, customMake]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = { ...form };
      if (!submitData.vin || submitData.vin === '') {
        submitData.vin = `QUICK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      }

      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const data = await response.json();
        const vehicle = data.vehicle || data;
        onCreated(vehicle);
        handleClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || errorData.message || t('forms.failed_to_create_vehicle'));
      }
    } catch (err) {
      setError(t('forms.failed_to_create_vehicle'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      customerId: customerId,
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      vin: '',
    });
    setCustomMake(false);
    setCustomModel(false);
    setError('');
    onClose();
  };

  const handleMakeChange = (value: string) => {
    if (value === 'custom') {
      setCustomMake(true);
      setForm({ ...form, make: '', model: '' });
    } else {
      setCustomMake(false);
      setCustomModel(false); // Reset custom model when switching to predefined make
      setForm({ ...form, make: value, model: '' });
    }
  };

  const handleModelChange = (value: string) => {
    if (value === 'custom') {
      setCustomModel(true);
      setForm({ ...form, model: '' });
    } else {
      setCustomModel(false);
      setForm({ ...form, model: value });
    }
  };

  return (
    <ModernizedModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('vehicles.quick_create_vehicle')}
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
          {/* Make */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.make')} <span className="text-red-500">*</span>
            </label>
            {!customMake ? (
              <div className="relative">
                <Car className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  required
                  value={form.make}
                  onChange={(e) => handleMakeChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                >
                  <option value="">{t('forms.select_make')}</option>
                  {CAR_MAKES.map((make) => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                  <option value="custom">{t('forms.custom_other')}</option>
                </select>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  required
                  value={form.make}
                  onChange={(e) => setForm({ ...form, make: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={t('forms.enter_custom_make')}
                />
                <button type="button" onClick={() => handleMakeChange('')} className="text-sm text-blue-600 hover:underline mt-1">
                  {t('forms.select_from_list')}
                </button>
              </div>
            )}
          </div>

          {/* Model */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.model')} <span className="text-red-500">*</span>
            </label>
            {!customModel ? (
              <div className="relative">
                <Car className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  required
                  value={form.model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  disabled={!form.make || customMake}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none disabled:opacity-50"
                >
                  <option value="">{t('forms.select_model')}</option>
                  {availableModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                  <option value="custom">{t('forms.custom_other')}</option>
                </select>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  required
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder={t('forms.enter_custom_model')}
                />
                <button type="button" onClick={() => handleModelChange('')} className="text-sm text-blue-600 hover:underline mt-1">
                  {t('forms.select_from_list')}
                </button>
              </div>
            )}
          </div>

          {/* Year */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.year')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* License Plate */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.license_plate')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                value={form.licensePlate}
                onChange={(e) => setForm({ ...form, licensePlate: e.target.value.toUpperCase() })}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase"
                placeholder={t('forms.license_plate_placeholder')}
              />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 rounded-lg p-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {t('vehicles.quick_create_note')}
          </p>
        </motion.div>

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
            disabled={loading || !customerId}
            className="px-6 py-3 text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? t('forms.creating') : t('vehicles.create_vehicle')}
          </motion.button>
        </motion.div>
      </motion.form>
    </ModernizedModal>
  );
}