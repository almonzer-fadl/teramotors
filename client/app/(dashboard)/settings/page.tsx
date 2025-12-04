"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Building, Users, FileText, Globe, Key, Share2, Palette } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/dashboard-animations';
import CompanyProfileSettings from '@/components/settings/CompanyProfileSettings';
import UserManagementSettings from '@/components/settings/UserManagementSettings';
import InvoicingSettings from '@/components/settings/InvoicingSettings';
import LocalizationSettings from '@/components/settings/LocalizationSettings';
import ZatcaSettings from '@/components/settings/ZatcaSettings';
import IntegrationsSettings from '@/components/settings/IntegrationsSettings'; // Import the new component

const tabs = [
    { name: 'Company Profile', icon: Building, component: <CompanyProfileSettings /> },
    { name: 'User Management', icon: Users, component: <UserManagementSettings /> }, 
    { name: 'Invoicing & Estimates', icon: FileText, component: <InvoicingSettings /> },
    { name: 'Localization', icon: Globe, component: <LocalizationSettings /> },
    { name: 'ZATCA', icon: Key, component: <ZatcaSettings /> },
    { name: 'Integrations', icon: Share2, component: <IntegrationsSettings /> }, // Replaced placeholder
];

export default function SettingsPage() {
    const { t } = useTranslation('common');
    const [activeTab, setActiveTab] = useState(tabs[0].name);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
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
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.name}
                                        onClick={() => setActiveTab(tab.name)}
                                        className={`w-full flex items-center p-4 rounded-xl text-left transition-all duration-200 ${
                                            activeTab === tab.name
                                                ? 'bg-gradient-to-r from-[#F97402]/10 to-[#F13F33]/10 text-[#F97402] font-semibold border border-[#F97402]/20'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <tab.icon className="w-5 h-5 mr-3" />
                                        <span>{tab.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Tab Content */}
                    <motion.div className="lg:col-span-3" variants={fadeInUp}>
                       {tabs.find(tab => tab.name === activeTab)?.component}

                       {/* "More customization" note */}
                       <div className="mt-8 bg-blue-50/80 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 text-center">
                           <div className="flex items-center justify-center text-blue-800 dark:text-blue-300">
                               <Palette className="w-5 h-5 mr-3" />
                               <p className="text-sm font-medium">
                                   More customization options, including advanced workflow settings and theming, are coming soon!
                               </p>
                           </div>
                       </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}