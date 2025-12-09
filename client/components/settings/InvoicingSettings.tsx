"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2, Save, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200" />
);
const FormTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200" />
);
const FormLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{children}</label>
);

export default function InvoicingSettings() {
    const { t } = useTranslation('common');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        invoicePrefix: '',
        estimatePrefix: '',
        defaultPaymentTerms: '',
        defaultInvoiceNotes: '',
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/settings/invoicing');
                if (response.ok) {
                    const data = await response.json();
                    setFormData(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error("Failed to fetch invoicing settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch('/api/settings/invoicing', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save settings');
            }
            toast.success('Invoicing settings saved!');
        } catch (error) {
            console.error("Error saving invoicing settings", error);
            toast.error(`Failed to save: ${(error as Error).message}`);
        } finally {
            setSaving(false);
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center"><FileText className="w-6 h-6 me-3 text-[#F97402]" /> Invoicing & Estimates</h2>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <FormLabel>Invoice Prefix</FormLabel>
                            <FormInput name="invoicePrefix" value={formData.invoicePrefix} onChange={handleInputChange} placeholder="e.g., INV-" />
                        </div>
                        <div>
                            <FormLabel>Estimate Prefix</FormLabel>
                            <FormInput name="estimatePrefix" value={formData.estimatePrefix} onChange={handleInputChange} placeholder="e.g., EST-" />
                        </div>
                    </div>
                    <div>
                        <FormLabel>Default Payment Terms</FormLabel>
                        <FormTextarea name="defaultPaymentTerms" value={formData.defaultPaymentTerms} onChange={handleInputChange} rows={3} placeholder="e.g., Payment due within 30 days." />
                    </div>
                    <div>
                        <FormLabel>Default Invoice Notes</FormLabel>
                        <FormTextarea name="defaultInvoiceNotes" value={formData.defaultInvoiceNotes} onChange={handleInputChange} rows={3} placeholder="e.g., Thank you for your business!" />
                    </div>
                </div>
                 <div className="flex justify-end mt-8">
                     <button type="submit" disabled={saving} className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200">
                        {saving ? <><Loader2 className="me-2 h-5 w-5 animate-spin" />{t("forms.saving")}</> : <><Save className="me-2 h-5 w-5" /> Save Changes</>}
                    </button>
                </div>
            </div>
        </form>
    );
}
