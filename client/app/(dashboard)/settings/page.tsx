"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Building, Users, FileText, Globe, Key, Share2, Palette, Clipboard, UserCircle, Calendar, CreditCard } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/dashboard-animations';
import CompanyProfileSettings from '@/components/settings/CompanyProfileSettings';
import UserManagementSettings from '@/components/settings/UserManagementSettings';
import InvoicingSettings from '@/components/settings/InvoicingSettings';
import LocalizationSettings from '@/components/settings/LocalizationSettings';
import ZatcaSettings from '@/components/settings/ZatcaSettings';
import IntegrationsSettings from '@/components/settings/IntegrationsSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import InspectionSettings from '@/components/settings/InspectionSettings';
import AccountSettings from '@/components/settings/AccountSettings';
import BookingSettings from '@/components/settings/BookingSettings';

const tabs = [
    { id: 'account', nameKey: 'settings.tabs.account', name: 'Account', icon: UserCircle, component: <AccountSettings /> },
    { id: 'billing', nameKey: 'settings.tabs.billing', name: 'Billing', icon: CreditCard, href: '/settings/subscription' },
    { id: 'company_profile', nameKey: 'settings.tabs.company_profile', name: 'Company Profile', icon: Building, component: <CompanyProfileSettings /> },
    { id: 'user_management', nameKey: 'settings.tabs.user_management', name: 'User Management', icon: Users, component: <UserManagementSettings /> },
    { id: 'online_booking', nameKey: 'settings.tabs.online_booking', name: 'Online Booking', icon: Calendar, component: <BookingSettings /> },
    { id: 'invoicing', nameKey: 'settings.tabs.invoicing', name: 'Invoicing & Estimates', icon: FileText, component: <InvoicingSettings /> },
    { id: 'inspections', nameKey: 'settings.tabs.inspections', name: 'Inspections', icon: Clipboard, component: <InspectionSettings /> },
    { id: 'localization', nameKey: 'settings.tabs.localization', name: 'Localization', icon: Globe, component: <LocalizationSettings /> },
    { id: 'zatca', nameKey: 'settings.tabs.zatca', name: 'ZATCA', icon: Key, component: <ZatcaSettings /> },
    { id: 'integrations', nameKey: 'settings.tabs.integrations', name: 'Integrations', icon: Share2, component: <IntegrationsSettings /> },
    { id: 'appearance', nameKey: 'settings.tabs.appearance', name: 'Appearance', icon: Palette, component: <AppearanceSettings /> },
];

export default function SettingsPage() {
    const { t, i18n } = useTranslation('common');
    const [activeTab, setActiveTab] = useState(tabs[0].id);
    const isRTL = i18n.language === 'ar';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
            <motion.div
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div className="mb-8" variants={fadeInUp}>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        {t("settings.title")}
                    </h1>
                    <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                        {t("settings.description")}
                    </p>
                </motion.div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Tabs Navigation */}
                    <motion.div className="lg:col-span-1" variants={fadeInUp}>
                        <div className="sticky top-24">
                             <div className="space-y-2">
                                {tabs.map((tab) => {
                                    const className = `w-full flex items-center p-4 rounded-xl ${isRTL ? 'text-right' : 'text-left'} transition-all duration-200 ${
                                        activeTab === tab.id
                                            ? 'bg-gradient-to-r from-[#F97402]/10 to-[#F13F33]/10 text-[#F97402] font-semibold border border-[#F97402]/20'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`;

                                    if ('href' in tab) {
                                        return (
                                            <Link key={tab.id} href={tab.href} className={className}>
                                                <tab.icon className={`w-5 h-5 ${isRTL ? 'ms-3' : 'me-3'}`} />
                                                <span>{t(tab.nameKey, tab.name)}</span>
                                            </Link>
                                        );
                                    }

                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={className}
                                        >
                                            <tab.icon className={`w-5 h-5 ${isRTL ? 'ms-3' : 'me-3'}`} />
                                            <span>{t(tab.nameKey, tab.name)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Tab Content */}
                    <motion.div className="lg:col-span-3" variants={fadeInUp}>
                       {tabs.find(tab => tab.id === activeTab)?.component}

                       {/* "More customization" note - updated to reflect theming is available */}
                       <div className="mt-8 bg-blue-50/80 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 text-center">
                           <div className="flex items-center justify-center text-blue-800 dark:text-blue-300">
                               <Palette className={`w-5 h-5 ${isRTL ? 'ms-3' : 'me-3'}`} />
                               <p className="text-sm font-medium">
                                   {t("settings.more_customization_note", "More customization options, including advanced workflow settings, are coming soon! You can now customize your app's appearance in the new \"Appearance\" tab!")}
                               </p>
                           </div>
                       </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
