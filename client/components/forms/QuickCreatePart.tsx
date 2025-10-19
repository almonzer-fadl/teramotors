'use client';

import { useState } from 'react';
import Modal from '@/components/dashboard/Modal';
import { useTranslation } from 'react-i18next';
import { Package, DollarSign, Hash } from 'lucide-react';

interface QuickCreatePartProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (part: { _id: string; name: string }) => void;
}

export default function QuickCreatePart({ isOpen, onClose, onCreated }: QuickCreatePartProps) {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    partNumber: '',
    cost: 0,
    sellingPrice: 0,
    stockQuantity: 0,
    minStockLevel: 5,
    category: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
      console.error('Failed to create part:', err);
      setError(t('forms.failed_to_create_part'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      name: '',
      partNumber: '',
      cost: 0,
      sellingPrice: 0,
      stockQuantity: 0,
      minStockLevel: 5,
      category: '',
      description: '',
    });
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('inventory.quick_create_part')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Part Name */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-bold text-gray-700">
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
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
                placeholder={t('forms.part_name_placeholder')}
              />
            </div>
          </div>

          {/* Part Number / SKU */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              {t('forms.part_number')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={form.partNumber}
                onChange={(e) => setForm({ ...form, partNumber: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
                placeholder={t('forms.part_number_placeholder')}
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              {t('forms.category')}
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
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
            <label className="block text-sm font-bold text-gray-700">
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
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Selling Price */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
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
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Stock Quantity */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              {t('forms.stock_quantity')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
              placeholder="0"
            />
          </div>

          {/* Min Stock Level */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              {t('forms.min_stock_level')}
            </label>
            <input
              type="number"
              min="0"
              value={form.minStockLevel}
              onChange={(e) => setForm({ ...form, minStockLevel: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
              placeholder="5"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              {t('forms.description')}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white resize-none"
              placeholder={t('forms.description_placeholder')}
            />
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            {t('inventory.quick_create_note')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-3 border-2 border-gray-300 text-sm font-bold rounded-xl text-gray-700 bg-white hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {t('forms.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-lg hover:shadow-purple-600/25 disabled:opacity-50 transition-all"
          >
            {loading ? t('forms.creating') : t('inventory.create_part')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

