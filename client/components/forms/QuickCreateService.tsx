'use client';

import { useState } from 'react';
import Modal from '@/components/dashboard/Modal';
import { useTranslation } from 'react-i18next';
import { Wrench, DollarSign, Clock } from 'lucide-react';

interface QuickCreateServiceProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (service: { _id: string; name: string; laborHours: number; laborRate: number }) => void;
}

export default function QuickCreateService({ isOpen, onClose, onCreated }: QuickCreateServiceProps) {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    laborRate: 0,
    laborHours: 1,
    isActive: true,
    isTemplate: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
    setForm({
      name: '',
      description: '',
      category: '',
      laborRate: 0,
      laborHours: 1,
      isActive: true,
      isTemplate: false,
    });
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('services.quick_create_service')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Name */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-bold text-gray-700">
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
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
                placeholder={t('forms.service_name_placeholder')}
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
            <label className="block text-sm font-bold text-gray-700">
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
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
                placeholder="1.0"
              />
            </div>
          </div>

          {/* Labor Rate */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
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
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
                placeholder="0.00"
              />
            </div>
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

          {/* Active Status */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              {t('forms.status')}
            </label>
            <div className="flex items-center h-12">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                {t('forms.service_active')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            {t('services.quick_create_note')}
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
            className="px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-600/25 disabled:opacity-50 transition-all"
          >
            {loading ? t('forms.creating') : t('services.create_service')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

