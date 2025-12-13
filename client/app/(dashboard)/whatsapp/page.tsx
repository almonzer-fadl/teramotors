"use client";

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Loader2,
  Send,
  MessageSquare,
  Users,
  CheckCircle,
  XCircle,
  BarChartHorizontal,
  ShieldCheck
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/dashboard-animations';

const StatCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center">
            <div className="me-4">{icon}</div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    </div>
);

type IntegrationState = {
    configured: boolean;
    connected: boolean;
    message?: string;
    messageKey?: string;
};

export default function WhatsAppPage() {
    const { t } = useTranslation('common');
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [integrationStatus, setIntegrationStatus] = useState<IntegrationState>({ configured: false, connected: false, message: '' });
    const [testingIntegration, setTestingIntegration] = useState(false);
    
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [messageBody, setMessageBody] = useState('');
    const [sending, setSending] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [customersRes, messagesRes] = await Promise.all([
                fetch('/api/customers?limit=1000&whatsappEnabled=true'),
                fetch('/api/whatsapp/history')
            ]);
            
            if (customersRes.ok) {
                const customersData = await customersRes.json();
                setCustomers(customersData.customers || []);
            }
            if (messagesRes.ok) {
                const messagesData = await messagesRes.json();
                setMessages(messagesData.messages || []);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const resolveIntegrationMessage = (status: IntegrationState) => status.messageKey ? t(status.messageKey) : (status.message || t('whatsapp.integration.not_configured'));

    const runIntegrationTest = async (showToast?: boolean) => {
        setTestingIntegration(true);
        try {
            const response = await fetch('/api/whatsapp/test');
            const result = await response.json();
            setIntegrationStatus(result);
            if (showToast) {
                if (response.ok && result.connected) {
                    toast.success(t('whatsapp.integration.connected'));
                } else if (response.ok && result.configured) {
                    toast(t('whatsapp.integration.configured_only'));
                } else {
                    toast.error(resolveIntegrationMessage(result));
                }
            }
        } catch (error) {
            console.error('Failed to test integration', error);
            if (showToast) {
                toast.error(t('whatsapp.integration.test_failed'));
            }
        } finally {
            setTestingIntegration(false);
        }
    };

    useEffect(() => {
        runIntegrationTest();
    }, []);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer || !messageBody) return;
        
        setSending(true);
        try {
            const response = await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId: selectedCustomer, messageBody }),
            });
            
            if (response.ok) {
                setMessageBody('');
                toast.success(t('whatsapp.notifications.sent_success'));
                const messagesRes = await fetch('/api/whatsapp/history');
                if (messagesRes.ok) {
                    const messagesData = await messagesRes.json();
                    setMessages(messagesData.messages || []);
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send message');
            }

        } catch (error) {
            console.error("Error sending message", error);
            toast.error((error as Error).message);
        } finally {
            setSending(false);
        }
    };

    const stats = useMemo(() => {
        const total = messages.length;
        const sent = messages.filter(m => m.status === 'sent').length;
        const failed = messages.filter(m => m.status === 'failed').length;
        return { total, sent, failed };
    }, [messages]);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-[#F97402]" /></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
            <motion.div
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div className="mb-8" variants={fadeInUp}>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        {t('whatsapp.title')}
                    </h1>
                    <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                        {t('whatsapp.subtitle')}
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={fadeInUp}>
                    <StatCard title={t('whatsapp.stats.total')} value={stats.total.toString()} icon={<BarChartHorizontal className="h-8 w-8 text-blue-500" />} />
                    <StatCard title={t('whatsapp.stats.sent')} value={stats.sent.toString()} icon={<CheckCircle className="h-8 w-8 text-green-500" />} />
                    <StatCard title={t('whatsapp.stats.failed')} value={stats.failed.toString()} icon={<XCircle className="h-8 w-8 text-red-500" />} />
                </motion.div>

                {/* Integration Card */}
                <motion.div variants={fadeInUp}>
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${integrationStatus.connected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-sm uppercase tracking-[0.4em] text-gray-500 dark:text-gray-400">{t('whatsapp.integration.badge')}</p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                        {integrationStatus.configured
                                            ? integrationStatus.connected
                                                ? t('whatsapp.integration.status_online')
                                                : t('whatsapp.integration.status_offline')
                                            : t('whatsapp.integration.status_missing')}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {resolveIntegrationMessage(integrationStatus)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${integrationStatus.configured ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-200 text-gray-600'}`}>
                                    {integrationStatus.configured ? t('whatsapp.integration.configured_label') : t('whatsapp.integration.not_configured_short')}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => runIntegrationTest(true)}
                                    disabled={testingIntegration}
                                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 disabled:opacity-60 transition-all duration-200"
                                >
                                    {testingIntegration ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin me-2" />
                                            {t('whatsapp.integration.testing')}
                                        </>
                                    ) : (
                                        t('whatsapp.integration.test_button')
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Composer */}
                <motion.div variants={fadeInUp}>
                    <form onSubmit={handleSendMessage} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                            <MessageSquare className="w-6 h-6 me-3 text-[#F97402]" />
                            {t('whatsapp.composer.title')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label htmlFor="customer" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('whatsapp.composer.customer')}</label>
                                <select 
                                    id="customer" 
                                    value={selectedCustomer} 
                                    onChange={(e) => setSelectedCustomer(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all"
                                >
                                    <option value="">{t('whatsapp.composer.select_customer')}</option>
                                    {customers.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.phoneNumber || c.phone})</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                 <label htmlFor="messageBody" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t('whatsapp.composer.message')}</label>
                                <textarea 
                                    id="messageBody"
                                    rows={3} 
                                    value={messageBody} 
                                    onChange={(e) => setMessageBody(e.target.value)}
                                    placeholder={t('whatsapp.composer.placeholder')}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button type="submit" disabled={sending || !selectedCustomer || !messageBody} className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200">
                                {sending ? <Loader2 className="me-2 h-5 w-5 animate-spin" /> : <Send className="me-2 h-5 w-5" />}
                                {t('whatsapp.composer.send')}
                            </button>
                        </div>
                    </form>
                </motion.div>

                 {/* History */}
                <motion.div variants={fadeInUp} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('whatsapp.history.title')}</h2>
                     <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                                {t('whatsapp.history.empty')}
                            </div>
                        )}
                        {messages.map(msg => (
                            <div key={msg._id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{msg.customerId?.firstName} {msg.customerId?.lastName}</p>
                                    <span className="text-xs text-gray-500">{new Date(msg.sentAt || msg.createdAt).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{msg.body}</p>
                                <div className={`mt-2 text-xs inline-flex items-center font-semibold px-2 py-1 rounded-full ${msg.status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                    {msg.status === 'sent' ? <CheckCircle className="w-3 h-3 me-1" /> : <XCircle className="w-3 h-3 me-1" />}
                                    {msg.status === 'sent' ? t('whatsapp.history.status_sent') : t('whatsapp.history.status_failed')}
                                    {msg.status === 'failed' && <span className="ms-2 truncate">: {msg.errorMessage}</span>}
                                </div>
                            </div>
                        ))}
                     </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
