"use client";

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2, Send, MessageSquare, Users, CheckCircle, XCircle, BarChartHorizontal } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/dashboard-animations';

const StatCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center">
            <div className="mr-4">{icon}</div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    </div>
);

export default function WhatsAppPage() {
    const { t } = useTranslation('common');
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [messageBody, setMessageBody] = useState('');
    const [sending, setSending] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [customersRes, messagesRes] = await Promise.all([
                fetch('/api/customers?limit=1000&whatsappEnabled=true'), // Fetch only enabled customers
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
                // Refresh history after sending
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
            alert((error as Error).message);
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
                        WhatsApp Messenger
                    </h1>
                    <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                        Send manual messages and view automated notification history.
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={fadeInUp}>
                    <StatCard title="Total Messages Sent" value={stats.total.toString()} icon={<BarChartHorizontal className="h-8 w-8 text-blue-500" />} />
                    <StatCard title="Messages Successfully Sent" value={stats.sent.toString()} icon={<CheckCircle className="h-8 w-8 text-green-500" />} />
                    <StatCard title="Messages Failed" value={stats.failed.toString()} icon={<XCircle className="h-8 w-8 text-red-500" />} />
                </motion.div>

                {/* Composer */}
                <motion.div variants={fadeInUp}>
                    <form onSubmit={handleSendMessage} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center"><MessageSquare className="w-6 h-6 mr-3 text-[#F97402]" /> Send Manual Message</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label htmlFor="customer" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Customer</label>
                                <select 
                                    id="customer" 
                                    value={selectedCustomer} 
                                    onChange={(e) => setSelectedCustomer(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all"
                                >
                                    <option value="">Select a customer...</option>
                                    {customers.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName} ({c.phoneNumber})</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                 <label htmlFor="messageBody" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Message</label>
                                <textarea 
                                    id="messageBody"
                                    rows={3} 
                                    value={messageBody} 
                                    onChange={(e) => setMessageBody(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-[#F97402] focus:ring-4 focus:ring-[#F97402]/20 transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button type="submit" disabled={sending || !selectedCustomer || !messageBody} className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200">
                                {sending ? <Loader2 className="me-2 h-5 w-5 animate-spin" /> : <Send className="me-2 h-5 w-5" />}
                                Send Message
                            </button>
                        </div>
                    </form>
                </motion.div>

                 {/* History */}
                <motion.div variants={fadeInUp} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Message History</h2>
                     <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                        {messages.map(msg => (
                            <div key={msg._id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{msg.customerId?.firstName} {msg.customerId?.lastName}</p>
                                    <span className="text-xs text-gray-500">{new Date(msg.sentAt).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{msg.body}</p>
                                <div className={`mt-2 text-xs inline-flex items-center font-semibold px-2 py-1 rounded-full ${msg.status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                    {msg.status === 'sent' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                                    {msg.status}
                                    {msg.status === 'failed' && <span className="ml-2 truncate">: {msg.errorMessage}</span>}
                                </div>
                            </div>
                        ))}
                     </div>
                </motion.div>
            </motion.div>
        </div>
    );
}