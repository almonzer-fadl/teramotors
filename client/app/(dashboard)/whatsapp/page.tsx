'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Settings,
  TestTube
} from 'lucide-react';
import { WahaConfigModal } from '@/components/modals/WahaConfigModal';
import { fadeInUp, scaleIn, staggerContainer } from '@/lib/dashboard-animations';

interface WhatsAppMessage {
  _id: string;
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  messageType: 'welcome' | 'job_started' | 'job_completed' | 'invoice_ready' | 'advertisement';
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  language: 'ar' | 'en';
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  createdAt: string;
}

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  whatsappEnabled: boolean;
  language: 'ar' | 'en';
}

interface Invoice {
  _id: string;
  customerId: string;
  totalAmount: number;
  createdAt: string;
}

export default function WhatsAppPage() {
  const { t } = useTranslation('common');
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [messageType, setMessageType] = useState('welcome');
  const [language, setLanguage] = useState('ar');
  const [customMessage, setCustomMessage] = useState('');
  const [showWahaConfig, setShowWahaConfig] = useState(false);

  // Message templates
  const messageTemplates = {
    welcome: {
      ar: 'مرحباً بك في تيرا موتورز! 🚗\n\nشكراً لثقتك في خدماتنا. سنبدأ العمل على سيارتك قريباً وسنخبرك بكل التحديثات.\n\nلأي استفسار، لا تتردد في التواصل معنا.',
      en: 'Welcome to Tera Motors! 🚗\n\nThank you for trusting our services. We will start working on your car soon and keep you updated.\n\nFor any inquiries, feel free to contact us.'
    },
    job_started: {
      ar: 'تم بدء العمل على سيارتك! 🔧\n\nفريقنا المختص بدأ العمل على سيارتك الآن. سنخبرك فور الانتهاء.\n\nشكراً لصبرك!',
      en: 'We started working on your car! 🔧\n\nOur expert team has started working on your car now. We will notify you as soon as we are done.\n\nThank you for your patience!'
    },
    job_completed: {
      ar: 'تم الانتهاء من سيارتك! ✅\n\nسيارتك جاهزة للاستلام. يمكنك الحضور لاستلامها في أي وقت مناسب لك.\n\nنتطلع لرؤيتك قريباً!',
      en: 'Your car is ready! ✅\n\nYour car is ready for pickup. You can come to collect it at any convenient time.\n\nWe look forward to seeing you soon!'
    },
    invoice_ready: {
      ar: 'فاتورتك جاهزة! 📄\n\nتم إنشاء فاتورتك ويمكنك مراجعتها. شكراً لاختيارك خدماتنا.\n\nنتطلع لخدمتك مرة أخرى!',
      en: 'Your invoice is ready! 📄\n\nYour invoice has been created and you can review it. Thank you for choosing our services.\n\nWe look forward to serving you again!'
    },
    advertisement: {
      ar: 'شكراً لثقتك في تيرا موتورز! 🙏\n\nنحن متخصصون في:\n• صيانة السيارات\n• إصلاح المحركات\n• تغيير الزيوت\n• فحص شامل\n\n📞 للاستفسارات: [رقم الهاتف]\n📍 العنوان: [العنوان]\n\nنتطلع لخدمتك مرة أخرى!',
      en: 'Thank you for trusting Tera Motors! 🙏\n\nWe specialize in:\n• Car maintenance\n• Engine repair\n• Oil changes\n• Comprehensive inspection\n\n📞 For inquiries: [Phone Number]\n📍 Address: [Address]\n\nWe look forward to serving you again!'
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchMessages();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/whatsapp/messages');
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoicesForCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`/api/invoices?customerId=${customerId}&limit=100`);
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomer(customerId);
    setSelectedInvoice('');
    if (customerId) {
      fetchInvoicesForCustomer(customerId);
    } else {
      setInvoices([]);
    }
  };

  const sendTestMessage = async () => {
    if (!selectedCustomer || !messageType) return;

    setSending(true);
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomer,
          messageType,
          language,
          customMessage: customMessage || undefined,
          invoiceId: messageType === 'invoice_ready' && selectedInvoice ? selectedInvoice : undefined
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Message sent successfully!');
        fetchMessages();
        setCustomMessage('');
      } else {
        alert('Failed to send message: ' + result.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'sent':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
    }
  };

  const getMessageTypeLabel = (type: string) => {
    const labels = {
      welcome: 'Welcome',
      job_started: 'Job Started',
      job_completed: 'Job Completed',
      invoice_ready: 'Invoice Ready',
      advertisement: 'Advertisement'
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97402]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 sm:px-6 lg:px-8 py-6">
      <motion.div
        className="space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
      <motion.div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" variants={fadeInUp}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('whatsapp.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('whatsapp.description')}</p>
        </div>
        <button
          onClick={() => setShowWahaConfig(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F97402] text-white shadow-sm hover:bg-[#F13F33] transition-colors"
        >
          <Settings className="h-5 w-5" />
          <span>{t('whatsapp.settings_button', { defaultValue: 'WAHA Settings' })}</span>
        </button>
      </motion.div>

      <WahaConfigModal isOpen={showWahaConfig} onClose={() => setShowWahaConfig(false)} />

      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={fadeInUp}>
        {/* Send Test Message */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              <span>{t('whatsapp.send_test_message')}</span>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Send a test WhatsApp message to any customer
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('whatsapp.customer')}
              </label>
              <select
                id="customer"
                value={selectedCustomer}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F97402] focus:border-[#F97402]"
              >
                <option value="">{t('whatsapp.select_customer')}</option>
                {customers
                  .filter(c => c.whatsappEnabled)
                  .map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.firstName} {customer.lastName} - {customer.phoneNumber}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label htmlFor="messageType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('whatsapp.message_type')}
              </label>
              <select
                id="messageType"
                value={messageType}
                onChange={(e) => setMessageType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97402] focus:border-[#F97402]"
              >
                <option value="welcome">{t('whatsapp.message_templates.welcome')}</option>
                <option value="job_started">{t('whatsapp.message_templates.job_started')}</option>
                <option value="job_completed">{t('whatsapp.message_templates.job_completed')}</option>
                <option value="invoice_ready">{t('whatsapp.message_templates.invoice_ready')}</option>
                <option value="advertisement">{t('whatsapp.message_templates.advertisement')}</option>
              </select>
            </div>

            {messageType === 'invoice_ready' && (
              <div>
                <label htmlFor="invoice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Invoice (Optional)
                </label>
                <select
                  id="invoice"
                  value={selectedInvoice}
                  onChange={(e) => setSelectedInvoice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97402] focus:border-[#F97402]"
                  disabled={!selectedCustomer || invoices.length === 0}
                >
                  <option value="">No invoice link (template only)</option>
                  {invoices.map((invoice) => (
                    <option key={invoice._id} value={invoice._id}>
                      Invoice #{invoice._id.slice(-8)} - ${invoice.totalAmount.toFixed(2)} - {new Date(invoice.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {selectedCustomer && invoices.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No invoices found for this customer</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('whatsapp.language')}
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97402] focus:border-[#F97402]"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label htmlFor="customMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('whatsapp.custom_message')}
              </label>
              <textarea
                id="customMessage"
                placeholder={t('whatsapp.custom_message_placeholder')}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97402] focus:border-[#F97402]"
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 p-3 rounded-lg">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('whatsapp.preview')}</label>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-line">
                {customMessage || messageTemplates[messageType as keyof typeof messageTemplates][language as 'ar' | 'en']}
              </p>
            </div>

            <button 
              onClick={sendTestMessage} 
              disabled={!selectedCustomer || sending}
              className="w-full bg-[#F97402] text-white px-4 py-2 rounded-md hover:bg-[#F13F33] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t('whatsapp.send_test_message')}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Message Statistics */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span>{t('whatsapp.message_statistics')}</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {messages.filter(m => m.status === 'delivered').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('whatsapp.delivered')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {messages.filter(m => m.status === 'sent').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('whatsapp.sent')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {messages.filter(m => m.status === 'failed').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('whatsapp.failed')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                  {messages.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('whatsapp.total')}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Message History */}
      <motion.div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800" variants={fadeInUp}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('whatsapp.message_history')}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('whatsapp.recent_messages')}
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t('whatsapp.no_messages')}
              </div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message._id}
                  className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-gray-900/60"
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {message.customerId ? `${message.customerId.firstName} ${message.customerId.lastName}` : 'Unknown Customer'}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                        {getMessageTypeLabel(message.messageType)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                        {t(`whatsapp.status.${message.status}`)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(message.status)}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <strong>{t('whatsapp.phone')}</strong> {message.customerId?.phoneNumber || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <strong>Language:</strong> {message.language === 'ar' ? 'العربية' : 'English'}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {message.content}
                  </div>
                  {message.errorMessage && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                      <strong>{t('whatsapp.error')}</strong> {message.errorMessage}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
      </motion.div>
    </div>
  );
}
