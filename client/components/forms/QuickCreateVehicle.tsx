'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/dashboard/Modal';
import { useTranslation } from 'react-i18next';
import { Car, Calendar, Hash } from 'lucide-react';
import { CAR_MAKES, getModelsForMake } from '@/lib/data/carMakesModels';

interface QuickCreateVehicleProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string; // Pre-filled from job card form
  onCreated: (vehicle: { _id: string; make: string; model: string; year: number }) => void;
}

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
    vin: '', // Empty string will be converted to null by the API
  });

  useEffect(() => {
    if (customerId) {
      setForm(prev => ({ ...prev, customerId }));
    }
  }, [customerId]);

  useEffect(() => {
    if (form.make && !customMake) {
      const models = getModelsForMake(form.make);
      setAvailableModels(models);
      // Reset model when make changes
      if (!models.includes(form.model)) {
        setForm(prev => ({ ...prev, model: '' }));
        setCustomModel(false);
      }
    } else {
      setAvailableModels([]);
    }
  }, [form.make, customMake]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Generate a unique VIN if not provided to avoid duplicate key errors
      const submitData = { ...form };
      if (!submitData.vin || submitData.vin === '') {
        // Generate a unique temporary VIN: QUICK-{timestamp}-{random}
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
      console.error('Failed to create vehicle:', err);
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
      vin: '', // Empty string will be converted to null by the API
    });
    setCustomMake(false);
    setCustomModel(false);
    setError('');
    onClose();
  };

  const handleMakeChange = (value: string) => {
    if (value === 'custom') {
      setCustomMake(true);
      setForm({ ...form, make: '' });
    } else {
      setCustomMake(false);
      setForm({ ...form, make: value });
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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('vehicles.quick_create_vehicle')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Make */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              {t('forms.make')} <span className="text-red-500">*</span>
            </label>
            {!customMake ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Car className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  required
                  value={form.make}
                  onChange={(e) => handleMakeChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
                >
                  <option value="">{t('forms.select_make')}</option>
                  {CAR_MAKES.map((make) => (
                    <option key={make} value={make}>
                      {make}
                    </option>
                  ))}
                  <option value="custom">{t('forms.custom_other')}</option>
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Car className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={form.make}
                    onChange={(e) => setForm({ ...form, make: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
                    placeholder={t('forms.enter_custom_make')}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleMakeChange('')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {t('forms.select_from_list')}
                </button>
              </div>
            )}
          </div>

          {/* Model */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              {t('forms.model')} <span className="text-red-500">*</span>
            </label>
            {!customModel ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Car className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  required
                  value={form.model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  disabled={!form.make}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white disabled:opacity-50"
                >
                  <option value="">{t('forms.select_model')}</option>
                  {availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                  <option value="custom">{t('forms.custom_other')}</option>
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Car className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
                    placeholder={t('forms.enter_custom_model')}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleModelChange('')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {t('forms.select_from_list')}
                </button>
              </div>
            )}
          </div>

          {/* Year */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              {t('forms.year')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
              />
            </div>
          </div>

          {/* License Plate */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              {t('forms.license_plate')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={form.licensePlate}
                onChange={(e) => setForm({ ...form, licensePlate: e.target.value.toUpperCase() })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white uppercase"
                placeholder={t('forms.license_plate_placeholder')}
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            {t('vehicles.quick_create_note')}
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
            disabled={loading || !customerId}
            className="px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-600/25 disabled:opacity-50 transition-all"
          >
            {loading ? t('forms.creating') : t('vehicles.create_vehicle')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

