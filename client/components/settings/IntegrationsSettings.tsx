"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2, Save, Share2, Mail, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const FormInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200" />
);
const FormLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{children}</label>
);

export default function IntegrationsSettings() {
    const { t, i18n } = useTranslation('common');
    const isRTL = i18n.language === 'ar';
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        smtp: {
            host: '',
            port: '',
            user: '',
            password: '',
            fromEmail: '',
        },
        whatsapp: {
            instanceId: '',
            token: '',
        }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/settings/integrations');
                if (response.ok) {
                    const data = await response.json();
                    setFormData(prev => ({
                        smtp: { ...prev.smtp, ...data.smtp },
                        whatsapp: { ...prev.whatsapp, ...data.whatsapp }
                    }));
                }
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSmtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, smtp: { ...prev.smtp, [name]: value } }));
    };

    const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, whatsapp: { ...prev.whatsapp, [name]: value } }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch('/api/settings/integrations', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save settings');
            }
            toast.success(t('settings.integrations.settings_saved', 'Integrations settings saved!'));
        } catch (error) {
            toast.error(`Failed to save: ${(error as Error).message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center"><Mail className="w-6 h-6 me-3 text-[#F97402]" /> {t('settings.integrations.smtp_settings', 'SMTP (Email) Settings')}</h2>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <FormLabel>{t('settings.integrations.smtp_host', 'SMTP Host')}</FormLabel>
                            <FormInput name="host" value={formData.smtp.host} onChange={handleSmtpChange} placeholder={t('settings.integrations.smtp_host_placeholder', 'smtp.example.com')} />
                        </div>
                        <div>
                            <FormLabel>{t('settings.integrations.smtp_port', 'SMTP Port')}</FormLabel>
                            <FormInput name="port" type="number" value={formData.smtp.port} onChange={handleSmtpChange} placeholder={t('settings.integrations.smtp_port_placeholder', '587')} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <FormLabel>{t('settings.integrations.username', 'Username')}</FormLabel>
                            <FormInput name="user" value={formData.smtp.user} onChange={handleSmtpChange} />
                        </div>
                        <div>
                            <FormLabel>{t('settings.integrations.password', 'Password')}</FormLabel>
                            <FormInput name="password" type="password" value={formData.smtp.password} onChange={handleSmtpChange} />
                        </div>
                    </div>
                    <div>
                        <FormLabel>{t('settings.integrations.from_email', 'From Email')}</FormLabel>
                        <FormInput name="fromEmail" type="email" value={formData.smtp.fromEmail} onChange={handleSmtpChange} placeholder={t('settings.integrations.from_email_placeholder', 'noreply@example.com')} />
                    </div>
                </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center"><MessageSquare className="w-6 h-6 me-3 text-[#F97402]" /> {t('settings.integrations.whatsapp_settings', 'WhatsApp (Ultramsg) Settings')}</h2>
                <div className="space-y-6">
                    <div>
                        <FormLabel>{t('settings.integrations.ultramsg_instance_id', 'Ultramsg Instance ID')}</FormLabel>
                        <FormInput name="instanceId" value={formData.whatsapp.instanceId} onChange={handleWhatsappChange} placeholder={t('settings.integrations.ultramsg_instance_placeholder', 'instance12345')} />
                    </div>
                    <div>
                        <FormLabel>{t('settings.integrations.ultramsg_token', 'Ultramsg Token')}</FormLabel>
                        <FormInput name="token" type="password" value={formData.whatsapp.token} onChange={handleWhatsappChange} />
                    </div>
                </div>
            </div>

            <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                 <button type="submit" disabled={saving} className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200">
                    {saving ? <><Loader2 className="h-5 w-5 animate-spin me-2" />{t("forms.saving")}</> : <><Save className="h-5 w-5 me-2" /> {t('settings.save_changes', 'Save Changes')}</>}
                </button>
            </div>
        </form>
    );
}
