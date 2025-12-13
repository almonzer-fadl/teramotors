"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2, Save, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const FormSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all duration-200" />
);
const FormLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{children}</label>
);

export default function LocalizationSettings() {
    const { t, i18n } = useTranslation('common');
    const isRTL = i18n.language === 'ar';
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        timezone: 'Asia/Riyadh',
        currency: 'SAR',
        locale: 'ar-SA',
        dateFormat: 'DD/MM/YYYY',
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/settings/localization');
                if (response.ok) {
                    const data = await response.json();
                    setFormData(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error("Failed to fetch localization settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await fetch('/api/settings/localization', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save settings');
            }
            toast.success(t('settings.localization.settings_saved', 'Localization settings saved!'));
        } catch (error) {
            console.error("Error saving localization settings", error);
            toast.error(`Failed to save: ${(error as Error).message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <form onSubmit={handleSubmit} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center"><Globe className="w-6 h-6 me-3 text-[#F97402]" /> {t('settings.localization.title', 'Localization')}</h2>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <FormLabel>{t('settings.localization.timezone', 'Timezone')}</FormLabel>
                            <FormSelect name="timezone" value={formData.timezone} onChange={handleInputChange}>
                                <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
                            </FormSelect>
                        </div>
                        <div>
                            <FormLabel>{t('settings.localization.currency', 'Currency')}</FormLabel>
                            <FormSelect name="currency" value={formData.currency} onChange={handleInputChange}>
                                <option value="SAR">{t('settings.localization.sar', 'SAR - Saudi Riyal')}</option>
                                <option value="USD">{t('settings.localization.usd', 'USD - US Dollar')}</option>
                                <option value="EUR">{t('settings.localization.eur', 'EUR - Euro')}</option>
                            </FormSelect>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <FormLabel>{t('settings.localization.default_language', 'Default Language')}</FormLabel>
                             <FormSelect name="locale" value={formData.locale} onChange={handleInputChange}>
                                <option value="ar-SA">{t('settings.localization.arabic_saudi', 'Arabic (Saudi Arabia)')}</option>
                                <option value="en-US">{t('settings.localization.english_us', 'English (US)')}</option>
                            </FormSelect>
                        </div>
                        <div>
                            <FormLabel>{t('settings.localization.date_format', 'Date Format')}</FormLabel>
                             <FormSelect name="dateFormat" value={formData.dateFormat} onChange={handleInputChange}>
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </FormSelect>
                        </div>
                    </div>
                </div>
                 <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} mt-8`}>
                     <button type="submit" disabled={saving} className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200">
                        {saving ? <><Loader2 className="h-5 w-5 animate-spin me-2" />{t("forms.saving")}</> : <><Save className="h-5 w-5 me-2" /> {t('settings.save_changes', 'Save Changes')}</>}
                    </button>
                </div>
            </div>
        </form>
    );
}
