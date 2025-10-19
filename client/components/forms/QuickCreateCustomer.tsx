'use client';

import { useState } from 'react';
import Modal from '@/components/dashboard/Modal';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, MessageSquare } from 'lucide-react';

interface QuickCreateCustomerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (customer: { _id: string; firstName: string; lastName: string }) => void;
}

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
      console.error('Failed to create customer:', err);
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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('customers.quick_create_customer')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
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
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
                placeholder={t('forms.first_name_placeholder')}
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
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
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
                placeholder={t('forms.last_name_placeholder')}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              {t('forms.email')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
                placeholder={t('forms.email_placeholder')}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              {t('forms.phone')} <span className="text-red-500">*</span>
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
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
                placeholder={t('forms.phone_placeholder')}
              />
            </div>
          </div>

          {/* Language Preference */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              {t('forms.language_preference')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MessageSquare className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white"
              >
                <option value="ar">{t('forms.arabic')}</option>
                <option value="en">{t('forms.english')}</option>
              </select>
            </div>
          </div>

          {/* WhatsApp Enabled */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              {t('forms.whatsapp_notifications')}
            </label>
            <div className="flex items-center h-12">
              <input
                type="checkbox"
                checked={form.whatsappEnabled}
                onChange={(e) => setForm({ ...form, whatsappEnabled: e.target.checked })}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                {t('forms.enable_whatsapp')}
              </span>
            </div>
          </div>
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
            {loading ? t('forms.creating') : t('customers.create_customer')}
          </button>
        </div>
      </form>
    </Modal>
  );
}

