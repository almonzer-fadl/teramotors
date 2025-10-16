'use client';

import { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/dashboard/Modal';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/lib/hooks/useSession';
import { Plus, Trash2 } from 'lucide-react';

type Minimal = { _id: string; name?: string; firstName?: string; lastName?: string; displayName?: string; make?: string; model?: string; year?: number; licensePlate?: string };

interface InlineInspectionCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerId?: string;
  defaultVehicleId?: string;
  onCreated: (inspection: { _id: string }) => void;
}

export default function InlineInspectionCreator({ isOpen, onClose, defaultCustomerId, defaultVehicleId, onCreated }: InlineInspectionCreatorProps) {
  const { t } = useTranslation('common');
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Minimal[]>([]);
  const [vehicles, setVehicles] = useState<Minimal[]>([]);
  const [users, setUsers] = useState<Minimal[]>([]);
  const [templates, setTemplates] = useState<{ _id: string; name: string; items?: { itemId: string; category: string }[] }[]>([]);

  const [form, setForm] = useState({
    customerId: defaultCustomerId || '',
    vehicleId: defaultVehicleId || '',
    mechanicId: '',
    templateId: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    mileage: 0,
    overallCondition: '',
    items: [] as { itemId: string; category: string; condition: 'good' | 'fair' | 'poor' | 'critical' }[],
    recommendations: '',
    nextInspectionDate: '',
    status: 'in-progress',
  });

  useEffect(() => {
    if (!isOpen) return;
    void fetchInitial();
  }, [isOpen]);

  useEffect(() => {
    if (defaultCustomerId) setForm(prev => ({ ...prev, customerId: defaultCustomerId }));
    if (defaultVehicleId) setForm(prev => ({ ...prev, vehicleId: defaultVehicleId }));
    if (user?.id) setForm(prev => ({ ...prev, mechanicId: user.id }));
  }, [defaultCustomerId, defaultVehicleId, user?.id]);

  useEffect(() => {
    if (user?.id) setForm(prev => ({ ...prev, mechanicId: user.id }));
  }, [user?.id]);

  const vehicleLabel = (v: Minimal) => [v.make, v.model, v.year, v.licensePlate].filter(Boolean).join(' ');
  const customerLabel = (c: Minimal) => c.displayName || [c.firstName, c.lastName].filter(Boolean).join(' ');

  const canSubmit = useMemo(() => {
    return !!form.customerId && !!form.vehicleId && !!form.mechanicId && !!form.inspectionDate;
  }, [form]);

  const fetchInitial = async () => {
    try {
      const [customersRes, vehiclesRes, usersRes, templatesRes] = await Promise.all([
        fetch('/api/customers?limit=1000'),
        fetch('/api/vehicles?limit=1000'),
        fetch('/api/users?limit=1000'),
        fetch('/api/inspection-templates'),
      ]);

      const [customersJson, vehiclesJson, usersJson, templatesJson] = await Promise.all([
        customersRes.ok ? customersRes.json() : Promise.resolve({ customers: [] }),
        vehiclesRes.ok ? vehiclesRes.json() : Promise.resolve({ vehicles: [] }),
        usersRes.ok ? usersRes.json() : Promise.resolve({ users: [] }),
        templatesRes.ok ? templatesRes.json() : Promise.resolve([]),
      ]);

      setCustomers(customersJson.customers || customersJson || []);
      setVehicles(vehiclesJson.vehicles || vehiclesJson || []);
      setUsers(usersJson.users || usersJson || []);
      setTemplates(templatesJson);
    } catch (e) {
      // ignore and keep arrays empty
    }
  };

  const onTemplateChange = async (templateId: string) => {
    if (!templateId) {
      setForm(prev => ({ ...prev, templateId: '', items: [] }));
      return;
    }
    try {
      // Prefer loading full template by id to get up-to-date items
      const res = await fetch(`/api/inspection-templates/${templateId}`);
      if (res.ok) {
        const tpl = await res.json();
        const items = (tpl?.items || []).map((it: any) => ({ itemId: it.itemId, category: it.category, condition: 'good' as const }));
        setForm(prev => ({ ...prev, templateId, items }));
      } else {
        const template = templates.find(t => t._id === templateId);
        const fallback = (template?.items || []).map(it => ({ itemId: it.itemId, category: it.category, condition: 'good' as const }));
        setForm(prev => ({ ...prev, templateId, items: fallback }));
      }
    } catch {
      const template = templates.find(t => t._id === templateId);
      const fallback = (template?.items || []).map(it => ({ itemId: it.itemId, category: it.category, condition: 'good' as const }));
      setForm(prev => ({ ...prev, templateId, items: fallback }));
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setForm(prev => {
      const next: any = { ...prev, [field]: value };
      // Auto-populate customer when vehicle is selected
      if (field === 'vehicleId' && value) {
        const selectedVehicle: any = vehicles.find(v => v._id === value);
        if (selectedVehicle && (selectedVehicle as any).customerId) {
          const cid = typeof (selectedVehicle as any).customerId === 'object' ? (selectedVehicle as any).customerId._id : (selectedVehicle as any).customerId;
          next.customerId = cid || next.customerId;
        }
      }
      // Auto-populate vehicle when customer is selected if none chosen yet
      if (field === 'customerId' && value && !next.vehicleId) {
        const customerVehicles = (vehicles as any[]).filter(v => {
          const vcid = typeof (v as any).customerId === 'object' ? (v as any).customerId._id : (v as any).customerId;
          return vcid === value;
        });
        if (customerVehicles.length === 1) {
          next.vehicleId = (customerVehicles[0] as any)._id;
        }
      }
      return next;
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setForm(prev => {
      const nextItems = [...prev.items];
      nextItems[index] = { ...nextItems[index], [field]: value } as any;
      return { ...prev, items: nextItems };
    });
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { itemId: '', category: 'general', condition: 'good' }]
    }));
  };

  const removeItem = (index: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const payload: any = { ...form };
      if (!payload.templateId) delete payload.templateId;
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        alert(err.error || t('forms.failed_to_save_inspection'));
        return;
      }
      const data = await res.json();
      onCreated(data.inspection || data);
      onClose();
    } catch (err) {
      alert(t('forms.failed_to_save_inspection'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('inspections.new_inspection')} size="xl">
      <form onSubmit={handleCreate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm font-bold text-gray-700">{t('forms.customer')}</label>
          <select
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white/80 hover:border-gray-300"
            value={form.customerId}
            onChange={e => handleFieldChange('customerId', e.target.value)}
            required
          >
            <option value="">{t('forms.select_customer')}</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>{customerLabel(c)}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm font-bold text-gray-700">{t('forms.vehicle')}</label>
          <select
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white/80 hover:border-gray-300"
            value={form.vehicleId}
            onChange={e => handleFieldChange('vehicleId', e.target.value)}
            required
          >
            <option value="">{t('forms.select_vehicle')}</option>
            {vehicles.map(v => (
              <option key={v._id} value={v._id}>{vehicleLabel(v)}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm font-bold text-gray-700">{t('forms.mechanic')}</label>
          <select
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white/80 hover:border-gray-300"
            value={form.mechanicId}
            onChange={e => setForm({ ...form, mechanicId: e.target.value })}
            required
          >
            <option value="">{t('forms.assign_mechanic')}</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.displayName || customerLabel(u)}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm font-bold text-gray-700">{t('forms.inspection_template')}</label>
          <select
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white/80 hover:border-gray-300"
            value={form.templateId}
            onChange={e => onTemplateChange(e.target.value)}
          >
            <option value="">{t('forms.select_template')}</option>
            {templates.map(tp => (
              <option key={tp._id} value={tp._id}>{tp.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <label className="block text-sm font-bold text-gray-700">{t('forms.inspection_items')}</label>
          <div className="max-h-72 overflow-auto border rounded">
            {form.items.length === 0 ? (
              <div className="px-4 py-4 text-sm text-gray-500 bg-gray-50">
                {t('inspections.no_items')}
              </div>
            ) : (
              form.items.map((it, idx) => (
                <div key={`${it.category}-${it.itemId}-${idx}`} className="px-3 py-3 border-b last:border-b-0">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
                    <div>
                      <label className="block text-xs font-bold text-gray-600">{t('forms.item_id')}</label>
                      <input
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white"
                        value={it.itemId}
                        onChange={e => handleItemChange(idx, 'itemId', e.target.value)}
                        placeholder={t('ui.example_items') || 'engine, brakes, tires'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600">{t('forms.category')}</label>
                      <select
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white"
                        value={it.category}
                        onChange={e => handleItemChange(idx, 'category', e.target.value)}
                      >
                        <option value="general">{t('forms.category_general')}</option>
                        <option value="safety">{t('forms.category_safety')}</option>
                        <option value="maintenance">{t('forms.category_maintenance')}</option>
                        <option value="performance">{t('forms.category_performance')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600">{t('forms.condition')}</label>
                      <select
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white"
                        value={it.condition}
                        onChange={e => handleItemChange(idx, 'condition', e.target.value as any)}
                      >
                        <option value="good">{t('forms.condition_good')}</option>
                        <option value="fair">{t('forms.condition_fair')}</option>
                        <option value="poor">{t('forms.condition_poor')}</option>
                        <option value="critical">{t('forms.condition_critical')}</option>
                      </select>
                    </div>
                    <div className="flex justify-end md:justify-start items-end">
                      <button type="button" onClick={() => removeItem(idx)} className="text-red-600 hover:text-red-800 p-2 rounded-xl hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div>
            <button type="button" onClick={addItem} className="mt-3 inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50">
              <Plus className="h-4 w-4 mr-2" />
              {t('forms.add_item')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm font-bold text-gray-700">{t('forms.inspection_date')}</label>
          <input
            type="date"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white/80 hover:border-gray-300"
            value={form.inspectionDate}
            onChange={e => setForm({ ...form, inspectionDate: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm font-bold text-gray-700">{t('forms.mileage')}</label>
          <input
            type="number"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white/80 hover:border-gray-300"
            value={form.mileage}
            onChange={e => setForm({ ...form, mileage: Number(e.target.value) })}
            min={0}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm font-bold text-gray-700">{t('forms.overall_condition')}</label>
          <select
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white/80 hover:border-gray-300"
            value={form.overallCondition}
            onChange={e => setForm({ ...form, overallCondition: e.target.value })}
            required
          >
            <option value="">{t('forms.select_condition')}</option>
            <option value="excellent">{t('forms.condition_excellent')}</option>
            <option value="good">{t('forms.condition_good')}</option>
            <option value="fair">{t('forms.condition_fair')}</option>
            <option value="poor">{t('forms.condition_poor')}</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="inline-flex items-center px-5 py-3 border-2 border-gray-300 text-sm font-bold rounded-xl text-gray-700 bg-white hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50">
            {t('forms.cancel')}
          </button>
          <button type="submit" disabled={!canSubmit || loading} className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? t('forms.saving') : t('forms.save_inspection')}
          </button>
        </div>
      </form>
    </Modal>
  );
}


