"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2, Save, Key, Check, X } from 'lucide-react';
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

export default function ZatcaSettings() {
    const { t } = useTranslation('common');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

    const [formData, setFormData] = useState({
        deviceId: '',
        cryptographicStamp: '',
        apiToken: '',
        apiUrl: '',
        certificate: '',
        privateKey: '',
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/settings/zatca');
                if (response.ok) {
                    const data = await response.json();
                    setFormData(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error("Failed to fetch ZATCA settings", error);
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

    const handleTestConnection = async () => {
        setTestStatus('testing');
        // TODO: Implement actual API call to a test endpoint
        await new Promise(res => setTimeout(res, 1500));
        // Simulate success/fail
        const isSuccess = Math.random() > 0.3;
        setTestStatus(isSuccess ? 'success' : 'failed');
        setTimeout(() => setTestStatus('idle'), 3000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch('/api/settings/zatca', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save settings');
            }
            toast.success('ZATCA settings saved!');
        } catch (error) {
            console.error("Error saving ZATCA settings", error);
            toast.error(`Failed to save: ${(error as Error).message}`);
        } finally {
            setSaving(false);
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    const TestButton = () => {
        switch(testStatus) {
            case 'testing': return <><Loader2 className="me-2 h-4 w-4 animate-spin" /> Testing...</>
            case 'success': return <><Check className="me-2 h-4 w-4 text-green-500" /> Success</>
            case 'failed': return <><X className="me-2 h-4 w-4 text-red-500" /> Failed</>
            default: return <>Test Connection</>
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center"><Key className="w-6 h-6 mr-3 text-[#F97402]" /> ZATCA E-Invoicing</h2>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <FormLabel>API URL</FormLabel>
                            <FormInput name="apiUrl" value={formData.apiUrl} onChange={handleInputChange} placeholder="ZATCA API Endpoint" />
                        </div>
                        <div>
                            <FormLabel>Device ID</FormLabel>
                            <FormInput name="deviceId" value={formData.deviceId} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div>
                        <FormLabel>API Token</FormLabel>
                        <FormInput name="apiToken" type="password" value={formData.apiToken} onChange={handleInputChange} />
                    </div>
                     <div>
                        <FormLabel>Cryptographic Stamp</FormLabel>
                        <FormTextarea name="cryptographicStamp" value={formData.cryptographicStamp} onChange={handleInputChange} rows={4} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <FormLabel>Certificate</FormLabel>
                             <FormTextarea name="certificate" value={formData.certificate} onChange={handleInputChange} rows={4} />
                        </div>
                        <div>
                            <FormLabel>Private Key</FormLabel>
                             <FormTextarea name="privateKey" value={formData.privateKey} onChange={handleInputChange} rows={4} />
                        </div>
                    </div>
                </div>
                 <div className="flex justify-between items-center mt-8">
                     <button type="button" onClick={handleTestConnection} disabled={testStatus !== 'idle'} className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-semibold text-sm bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#F97402] hover:text-[#F97402] hover:bg-[#F97402]/5 active:scale-[0.98] disabled:opacity-50 transition-all duration-200">
                        <TestButton />
                    </button>
                     <button type="submit" disabled={saving} className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200">
                        {saving ? <><Loader2 className="me-2 h-5 w-5 animate-spin" />{t("forms.saving")}</> : <><Save className="me-2 h-5 w-5" /> Save Changes</>}
                    </button>
                </div>
            </div>
        </form>
    );
}
