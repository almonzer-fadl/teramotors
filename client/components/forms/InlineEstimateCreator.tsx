'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/dashboard/Modal';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/lib/hooks/useSession';
import { Plus, Trash2, Calculator } from 'lucide-react';

interface InlineEstimateCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  jobCardId: string;
  onCreated: (estimate: { _id: string }) => void;
}

interface Part {
  _id: string;
  name: string;
  cost: number;
  stock: number;
}

interface Service {
  _id: string;
  name: string;
  description: string;
  laborHours: number;
  laborRate: number;
}

export default function InlineEstimateCreator({ isOpen, onClose, jobCardId, onCreated }: InlineEstimateCreatorProps) {
  const { t } = useTranslation('common');
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [form, setForm] = useState({
    customerId: '',
    vehicleId: '',
    jobCardId: jobCardId,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    status: 'pending',
    notes: '',
    services: [] as Array<{
      serviceId: string;
      name: string;
      description: string;
      quantity: number;
      laborHours: number;
      laborRate: number;
      totalCost: number;
    }>,
    parts: [] as Array<{
      partId: string;
      name: string;
      quantity: number;
      cost: number;
      totalCost: number;
    }>,
    subtotal: 0,
    taxRate: 0.15, // 15% tax on parts only
    taxAmount: 0,
    total: 0,
  });

  useEffect(() => {
    if (!isOpen) return;
    void fetchInitial();
  }, [isOpen]);

  useEffect(() => {
    if (jobCardId) setForm(prev => ({ ...prev, jobCardId }));
  }, [jobCardId]);

  const fetchInitial = async () => {
    try {
      const [partsRes, servicesRes, jobCardRes] = await Promise.all([
        fetch('/api/parts?limit=1000'),
        fetch('/api/services?limit=1000'),
        fetch(`/api/job-cards/${jobCardId}`),
      ]);

      const [partsJson, servicesJson, jobCardJson] = await Promise.all([
        partsRes.ok ? partsRes.json() : Promise.resolve({ parts: [] }),
        servicesRes.ok ? servicesRes.json() : Promise.resolve({ services: [] }),
        jobCardRes.ok ? jobCardRes.json() : Promise.resolve({}),
      ]);

      setParts(partsJson.parts || partsJson || []);
      setServices(servicesJson.services || servicesJson || []);

      // Build estimate items from full job card
      const jobCard = jobCardJson.jobCard || jobCardJson;
      if (jobCard && jobCard._id) {
        const estimateServices: typeof form.services = [];
        const estimateParts: typeof form.parts = [];

        // Map services to estimate items
        (jobCard.services || []).forEach((svc: any) => {
          const svcId = typeof svc.serviceId === 'object' ? svc.serviceId._id : svc.serviceId;
          const svcRef = (servicesJson.services || servicesJson || []).find((s: any) => s._id === svcId);
          const name = svcRef?.name || svc?.name || 'Service';
          const rate = svc.laborRate ?? svcRef?.laborRate ?? 0;
          const hours = svc.laborHours ?? svcRef?.laborHours ?? 0;
          const qty = svc.quantity ?? 1;
          const totalCost = qty * hours * rate;

          estimateServices.push({
            serviceId: svcId || '',
            name,
            description: name,
            quantity: qty,
            laborHours: hours,
            laborRate: rate,
            totalCost,
          });
        });

        // Map parts to estimate items
        (jobCard.partsUsed || []).forEach((pt: any) => {
          const partId = typeof pt.partId === 'object' ? pt.partId._id : pt.partId;
          const partRef = (partsJson.parts || partsJson || []).find((p: any) => p._id === partId);
          const name = partRef?.name || pt?.name || 'Part';
          const cost = pt.cost ?? partRef?.cost ?? partRef?.sellingPrice ?? 0;
          const qty = pt.quantity ?? 1;
          const totalCost = qty * cost;

          estimateParts.push({
            partId: partId || '',
            name,
            quantity: qty,
            cost,
            totalCost,
          });
        });

        const totals = calculateTotals(estimateServices, estimateParts);
        setForm(prev => ({
          ...prev,
          customerId: jobCard.customerId?._id || jobCard.customerId || '',
          vehicleId: jobCard.vehicleId?._id || jobCard.vehicleId || '',
          services: estimateServices,
          parts: estimateParts,
          ...totals,
        }));
      }
    } catch (e) {
      console.error('Failed to fetch initial data:', e);
    }
  };

  const calculateTotals = (services: typeof form.services, parts: typeof form.parts) => {
    const servicesTotal = services.reduce((sum, item) => sum + item.totalCost, 0);
    const partsSubtotal = parts.reduce((sum, item) => sum + item.totalCost, 0);
    const subtotal = servicesTotal + partsSubtotal;
    // Tax only on parts (15%)
    const taxAmount = partsSubtotal * form.taxRate;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleServiceChange = (index: number, field: string, value: any) => {
    setForm(prev => {
      const nextServices = [...prev.services];
      const service = { ...nextServices[index] };

      if (field === 'serviceId') {
        const svcRef = services.find(s => s._id === value);
        if (svcRef) {
          service.name = svcRef.name;
          service.description = svcRef.description;
          service.laborHours = svcRef.laborHours;
          service.laborRate = svcRef.laborRate;
          service.totalCost = service.quantity * svcRef.laborHours * svcRef.laborRate;
        }
      } else if (field === 'quantity' || field === 'laborHours' || field === 'laborRate') {
        service[field] = value;
        service.totalCost = service.quantity * service.laborHours * service.laborRate;
      } else {
        (service as any)[field] = value;
      }

      nextServices[index] = service;
      const totals = calculateTotals(nextServices, prev.parts);
      return { ...prev, services: nextServices, ...totals };
    });
  };

  const handlePartChange = (index: number, field: string, value: any) => {
    setForm(prev => {
      const nextParts = [...prev.parts];
      const part = { ...nextParts[index] };

      if (field === 'partId') {
        const partRef = parts.find(p => p._id === value);
        if (partRef) {
          part.name = partRef.name;
          part.cost = partRef.cost;
          part.totalCost = part.quantity * partRef.cost;
        }
      } else if (field === 'quantity' || field === 'cost') {
        part[field] = value;
        part.totalCost = part.quantity * part.cost;
      } else {
        (part as any)[field] = value;
      }

      nextParts[index] = part;
      const totals = calculateTotals(prev.services, nextParts);
      return { ...prev, parts: nextParts, ...totals };
    });
  };

  const addService = () => {
    setForm(prev => ({
      ...prev,
      services: [...prev.services, {
        serviceId: '',
        name: '',
        description: '',
        quantity: 1,
        laborHours: 0,
        laborRate: 0,
        totalCost: 0,
      }]
    }));
  };

  const addPart = () => {
    setForm(prev => ({
      ...prev,
      parts: [...prev.parts, {
        partId: '',
        name: '',
        quantity: 1,
        cost: 0,
        totalCost: 0,
      }]
    }));
  };

  const removeService = (index: number) => {
    setForm(prev => {
      const nextServices = prev.services.filter((_, i) => i !== index);
      const totals = calculateTotals(nextServices, prev.parts);
      return { ...prev, services: nextServices, ...totals };
    });
  };

  const removePart = (index: number) => {
    setForm(prev => {
      const nextParts = prev.parts.filter((_, i) => i !== index);
      const totals = calculateTotals(prev.services, nextParts);
      return { ...prev, parts: nextParts, ...totals };
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.services.length === 0 && form.parts.length === 0) {
      alert(t('estimates.add_at_least_one_item'));
      return;
    }
    setLoading(true);
    try {
      const payload = {
        jobCardId: form.jobCardId,
        customerId: form.customerId,
        vehicleId: form.vehicleId,
        services: form.services,
        parts: form.parts,
        validUntil: form.validUntil,
        status: form.status,
        notes: form.notes,
      };

      const res = await fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        alert(err.error || t('estimates.failed_to_create_estimate'));
        return;
      }

      const data = await res.json();
      onCreated(data.estimate || data);
      onClose();
    } catch (err) {
      alert(t('estimates.failed_to_create_estimate'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('estimates.create_estimate')} size="xl">
      <form onSubmit={handleCreate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('estimates.valid_until')}</label>
            <input
              type="date"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white/80 hover:border-gray-300"
              value={form.validUntil}
              onChange={e => setForm({ ...form, validUntil: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('estimates.status')}</label>
            <select
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white/80 hover:border-gray-300"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              <option value="pending">{t('estimates.status_pending')}</option>
              <option value="approved">{t('estimates.status_approved')}</option>
              <option value="rejected">{t('estimates.status_rejected')}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">{t('forms.notes')}</label>
          <textarea
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white/80 hover:border-gray-300"
            rows={3}
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder={t('estimates.additional_notes')}
          />
        </div>

        {/* Services Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-bold text-gray-700">{t('job_cards.services')}</label>
            <button
              type="button"
              onClick={addService}
              className="inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('estimates.add_service')}
            </button>
          </div>

          <div className="space-y-3">
            {form.services.length === 0 ? (
              <div className="px-4 py-8 text-sm text-gray-500 bg-gray-50 text-center rounded-xl">
                {t('estimates.no_services_added')}
              </div>
            ) : (
              form.services.map((service, idx) => (
                <div key={idx} className="px-4 py-4 border-2 border-gray-200 rounded-xl bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-600 mb-1">{t('forms.select_service')}</label>
                      <select
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white"
                        value={service.serviceId}
                        onChange={e => handleServiceChange(idx, 'serviceId', e.target.value)}
                      >
                        <option value="">{t('invoices.select_item')}</option>
                        {services.map(s => (
                          <option key={s._id} value={s._id}>{s.name} (${s.laborRate}/hr)</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{t('forms.qty')}</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white"
                        value={service.quantity}
                        onChange={e => handleServiceChange(idx, 'quantity', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{t('job_cards.labor_hours')}</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white"
                        value={service.laborHours}
                        onChange={e => handleServiceChange(idx, 'laborHours', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{t('forms.labor_placeholder')}</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white"
                        value={service.laborRate}
                        onChange={e => handleServiceChange(idx, 'laborRate', Number(e.target.value))}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-600 mb-1">{t('invoices.total')}</label>
                        <div className="px-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-bold">
                          ${service.totalCost.toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeService(idx)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-xl hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Parts Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-bold text-gray-700">{t('job_cards.parts_used')}</label>
            <button
              type="button"
              onClick={addPart}
              className="inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('estimates.add_part')}
            </button>
          </div>

          <div className="space-y-3">
            {form.parts.length === 0 ? (
              <div className="px-4 py-8 text-sm text-gray-500 bg-gray-50 text-center rounded-xl">
                {t('estimates.no_parts_added')}
              </div>
            ) : (
              form.parts.map((part, idx) => (
                <div key={idx} className="px-4 py-4 border-2 border-gray-200 rounded-xl bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-600 mb-1">{t('forms.select_part')}</label>
                      <select
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white"
                        value={part.partId}
                        onChange={e => handlePartChange(idx, 'partId', e.target.value)}
                      >
                        <option value="">{t('invoices.select_item')}</option>
                        {parts.map(p => (
                          <option key={p._id} value={p._id}>{p.name} (${p.cost})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{t('forms.qty')}</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white"
                        value={part.quantity}
                        onChange={e => handlePartChange(idx, 'quantity', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{t('forms.cost_placeholder')}</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white"
                        value={part.cost}
                        onChange={e => handlePartChange(idx, 'cost', Number(e.target.value))}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-600 mb-1">{t('invoices.total')}</label>
                        <div className="px-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-bold">
                          ${part.totalCost.toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePart(idx)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-xl hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700">{t('invoices.subtotal')}</span>
              <span className="text-lg font-bold text-gray-900">${form.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-700">{t('invoices.tax')} ({(form.taxRate * 100).toFixed(0)}% on parts)</span>
              <span className="text-lg font-bold text-gray-900">${form.taxAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-300 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">{t('invoices.total')}</span>
                <span className="text-2xl font-bold text-[#F13F33]">${form.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center px-5 py-3 border-2 border-gray-300 text-sm font-bold rounded-xl text-gray-700 bg-white hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50"
          >
            {t('forms.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading || (form.services.length === 0 && form.parts.length === 0)}
            className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-[#F13F33] to-[#E63946] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Calculator className="h-4 w-4 mr-2" />
            {loading ? t('forms.saving') : t('estimates.create_estimate')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
