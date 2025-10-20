'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/dashboard/Modal';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/lib/hooks/useSession';
import { Plus, Trash2, Calculator } from 'lucide-react';

interface InlineInvoiceCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  jobCardId: string;
  onCreated: (invoice: { _id: string }) => void;
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

export default function InlineInvoiceCreator({ isOpen, onClose, jobCardId, onCreated }: InlineInvoiceCreatorProps) {
  const { t } = useTranslation('common');
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [form, setForm] = useState({
    customerId: '',
    vehicleId: '',
    jobCardId: jobCardId,
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    status: 'pending',
    paymentMethod: 'cash',
    notes: '',
    items: [] as Array<{
      type: 'part' | 'service';
      itemId: string;
      name: string;
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>,
    subtotal: 0,
    taxRate: 0.15, // 15% tax
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

      // Build invoice items from full job card
      const jobCard = jobCardJson.jobCard || jobCardJson;
      if (jobCard && jobCard._id) {
        const items: typeof form.items = [];
        // Map services to invoice items
        (jobCard.services || []).forEach((svc: any) => {
          const svcId = typeof svc.serviceId === 'object' ? svc.serviceId._id : svc.serviceId;
          const svcRef = (servicesJson.services || servicesJson || []).find((s: any) => s._id === svcId);
          const name = svcRef?.name || svc?.name || 'Service';
          const rate = svc.laborRate ?? svcRef?.laborRate ?? 0;
          const qty = svc.quantity ?? 1;
          items.push({
            type: 'service',
            itemId: svcId || '',
            name,
            description: name,
            quantity: qty,
            unitPrice: rate,
            total: qty * rate,
          });
        });
        // Map parts to invoice items
        (jobCard.partsUsed || []).forEach((pt: any) => {
          const partId = typeof pt.partId === 'object' ? pt.partId._id : pt.partId;
          const partRef = (partsJson.parts || partsJson || []).find((p: any) => p._id === partId);
          const name = partRef?.name || pt?.name || 'Part';
          const unit = pt.cost ?? partRef?.cost ?? partRef?.sellingPrice ?? 0;
          const qty = pt.quantity ?? 1;
          items.push({
            type: 'part',
            itemId: partId || '',
            name,
            description: name,
            quantity: qty,
            unitPrice: unit,
            total: qty * unit,
          });
        });

        const totals = calculateTotals(items);
        setForm(prev => ({
          ...prev,
          customerId: jobCard.customerId?._id || jobCard.customerId || '',
          vehicleId: jobCard.vehicleId?._id || jobCard.vehicleId || '',
          items,
          ...totals,
        }));
      }
    } catch (e) {
      console.error('Failed to fetch initial data:', e);
    }
  };

  const calculateTotals = (items: typeof form.items) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * form.taxRate;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setForm(prev => {
      const nextItems = [...prev.items];
      const item = { ...nextItems[index] };

      if (field === 'type' && value === 'part') {
        const part = parts.find(p => p._id === item.itemId);
        if (part) {
          item.name = part.name;
          item.description = part.name;
          item.unitPrice = part.cost;
        }
      } else if (field === 'type' && value === 'service') {
        const service = services.find(s => s._id === item.itemId);
        if (service) {
          item.name = service.name;
          item.description = service.description;
          item.unitPrice = service.laborRate;
        }
      } else if (field === 'itemId') {
        if (item.type === 'part') {
          const part = parts.find(p => p._id === value);
          if (part) {
            item.name = part.name;
            item.description = part.name;
            item.unitPrice = part.cost;
          }
        } else if (item.type === 'service') {
          const service = services.find(s => s._id === value);
          if (service) {
            item.name = service.name;
            item.description = service.description;
            item.unitPrice = service.laborRate;
          }
        }
      } else if (field === 'quantity' || field === 'unitPrice') {
        item.total = item.quantity * item.unitPrice;
      }

      nextItems[index] = { ...item, [field]: value };
      const totals = calculateTotals(nextItems);
      return { ...prev, items: nextItems, ...totals };
    });
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, {
        type: 'part',
        itemId: '',
        name: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      }]
    }));
  };

  const removeItem = (index: number) => {
    setForm(prev => {
      const nextItems = prev.items.filter((_, i) => i !== index);
      const totals = calculateTotals(nextItems);
      return { ...prev, items: nextItems, ...totals };
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.items.length === 0) {
      alert(t('invoices.add_at_least_one_item'));
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        invoiceNumber: form.invoiceNumber || `INV-${Date.now()}`,
      };
      
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        alert(err.error || t('invoices.failed_to_create_invoice'));
        return;
      }
      
      const data = await res.json();
      onCreated(data.invoice || data);
      onClose();
    } catch (err) {
      alert(t('invoices.failed_to_create_invoice'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('invoices.create_invoice')} size="xl">
      <form onSubmit={handleCreate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('invoices.invoice_number')}</label>
            <input
              type="text"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white/80 hover:border-gray-300"
              value={form.invoiceNumber}
              onChange={e => setForm({ ...form, invoiceNumber: e.target.value })}
              placeholder={t('invoices.auto_generated')}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('invoices.invoice_date')}</label>
            <input
              type="date"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white/80 hover:border-gray-300"
              value={form.invoiceDate}
              onChange={e => setForm({ ...form, invoiceDate: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('invoices.due_date')}</label>
            <input
              type="date"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white/80 hover:border-gray-300"
              value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{t('invoices.payment_method')}</label>
            <select
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white/80 hover:border-gray-300"
              value={form.paymentMethod}
              onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
            >
              <option value="cash">{t('invoices.cash')}</option>
              <option value="card">{t('invoices.card')}</option>
              <option value="bank_transfer">{t('invoices.bank_transfer')}</option>
              <option value="check">{t('invoices.check')}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">{t('invoices.notes')}</label>
          <textarea
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-gray-900 bg-white/80 hover:border-gray-300"
            rows={3}
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder={t('invoices.additional_notes')}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-bold text-gray-700">{t('invoices.invoice_items')}</label>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('invoices.add_item')}
            </button>
          </div>
          
          <div className="max-h-72 overflow-auto border rounded-xl">
            {form.items.length === 0 ? (
              <div className="px-4 py-8 text-sm text-gray-500 bg-gray-50 text-center">
                {t('invoices.no_items_added')}
              </div>
            ) : (
              form.items.map((item, idx) => (
                <div key={idx} className="px-4 py-4 border-b last:border-b-0">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{t('invoices.type')}</label>
                      <select
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white"
                        value={item.type}
                        onChange={e => handleItemChange(idx, 'type', e.target.value)}
                      >
                        <option value="part">{t('invoices.part')}</option>
                        <option value="service">{t('invoices.service')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{t('invoices.item')}</label>
                      <select
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white"
                        value={item.itemId}
                        onChange={e => handleItemChange(idx, 'itemId', e.target.value)}
                      >
                        <option value="">{t('invoices.select_item')}</option>
                        {item.type === 'part' 
                          ? parts.map(p => (
                              <option key={p._id} value={p._id}>{p.name} (${p.cost})</option>
                            ))
                          : services.map(s => (
                              <option key={s._id} value={s._id}>{s.name} (${s.laborRate}/hr)</option>
                            ))
                        }
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{t('invoices.quantity')}</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white"
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{t('invoices.unit_price')}</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white"
                        value={item.unitPrice}
                        onChange={e => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">{t('invoices.total')}</label>
                      <div className="px-3 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-bold">
                        ${item.total.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
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
              <span className="text-sm font-bold text-gray-700">{t('invoices.tax')} ({(form.taxRate * 100).toFixed(0)}%)</span>
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
            disabled={loading || form.items.length === 0}
            className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-[#F13F33] to-[#E63946] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Calculator className="h-4 w-4 mr-2" />
            {loading ? t('forms.saving') : t('invoices.create_invoice')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
