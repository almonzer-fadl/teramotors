'use client';

import { useState } from 'react';
import ModernizedModal from '@/components/ui/ModernizedModal';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Package, DollarSign, Hash, AlertCircle } from 'lucide-react';

const generatePartNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `PART-${timestamp}-${random}`;
};

const createInitialFormState = () => ({
  name: '',
  partNumber: generatePartNumber(),
  cost: 0,
  sellingPrice: 0,
  stockQuantity: 0,
  minStockLevel: 5,
  category: '',
  description: '',
});

interface QuickCreatePartProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (part: { _id: string; name: string }) => void;
}

const formVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function QuickCreatePart({ isOpen, onClose, onCreated }: QuickCreatePartProps) {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState(createInitialFormState);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = { ...form };
      if (!submitData.partNumber || submitData.partNumber.trim() === '') {
        submitData.partNumber = generatePartNumber();
      } else {
        submitData.partNumber = submitData.partNumber.trim().toUpperCase();
      }

      const response = await fetch('/api/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const data = await response.json();
        const part = data.part || data;
        onCreated(part);
        handleClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || t('forms.failed_to_create_part'));
      }
    } catch (err) {
      setError(t('forms.failed_to_create_part'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(createInitialFormState());
    setError('');
    onClose();
  };

  return (
    <ModernizedModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('inventory.quick_create_part')}
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
          {/* Part Name */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.part_name')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder={t('forms.part_name_placeholder')}
              />
            </div>
          </div>

          {/* Part Number / SKU */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.part_number')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={form.partNumber}
                onChange={(e) => setForm({ ...form, partNumber: e.target.value.toUpperCase() })}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-mono uppercase"
                placeholder={t('forms.part_number_placeholder')}
              />
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
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all appearance-none"
            >
              <option value="">{t('forms.select_category')}</option>
              <option value="engine">{t('inventory.categories.engine')}</option>
              <option value="brakes">{t('inventory.categories.brakes')}</option>
              <option value="suspension">{t('inventory.categories.suspension')}</option>
              <option value="electrical">{t('inventory.categories.electrical')}</option>
              <option value="body">{t('inventory.categories.body')}</option>
              <option value="filters">{t('inventory.categories.filters')}</option>
              <option value="fluids">{t('inventory.categories.fluids')}</option>
              <option value="tires">{t('inventory.categories.tires')}</option>
              <option value="other">{t('inventory.categories.other')}</option>
            </select>
          </div>

          {/* Cost Price */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.cost_price')} <span className="text-red-500">*</span>
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
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Selling Price */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.selling_price')} <span className="text-red-500">*</span>
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
                value={form.sellingPrice}
                onChange={(e) => setForm({ ...form, sellingPrice: parseFloat(e.target.value) || 0 })}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Stock Quantity */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.stock_quantity')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              placeholder="0"
            />
          </div>

          {/* Min Stock Level */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('forms.min_stock_level')}
            </label>
            <input
              type="number"
              min="0"
              value={form.minStockLevel}
              onChange={(e) => setForm({ ...form, minStockLevel: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              placeholder="5"
            />
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
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
              placeholder={t('forms.description_placeholder')}
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 rounded-lg p-3">
          <p className="text-sm text-purple-700 dark:text-purple-300">
            {t('inventory.quick_create_note')}
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
            className="px-6 py-3 text-sm font-bold rounded-lg text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? t('forms.creating') : t('inventory.create_part')}
          </motion.button>
        </motion.div>
      </motion.form>
    </ModernizedModal>
  );
}