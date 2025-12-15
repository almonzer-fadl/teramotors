"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, AlertCircle, Clock, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' }).format(value || 0);

const StatCard = ({ title, value, color }: { title: string; value: string; color: string }) => (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800">
        <p className={`text-sm font-medium ${color}`}>{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
);

const CustomerRow = ({ customer, t, i18n }: { customer: any; t: any; i18n: any }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <tr onClick={() => setIsOpen(!isOpen)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center">
                        {isOpen ? <ChevronDown className="h-4 w-4 me-2" /> : <ChevronRight className="h-4 w-4 me-2" />}
                        {customer.customerName}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{customer.invoices.length}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(customer.totalOutstanding)}
                </td>
            </tr>
            {isOpen && (
                <tr className="bg-gray-50/50 dark:bg-gray-800/20">
                    <td colSpan={3} className="px-6 py-4">
                        <div className="pl-8">
                             <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">{t('reports.ar_aging.overdue_invoices', 'Overdue Invoices')}</h4>
                            <table className="min-w-full">
                                <thead >
                                    <tr>
                                        <th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('reports.ar_aging.invoice_number', 'Invoice #')}</th>
                                        <th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('reports.ar_aging.due_date', 'Due Date')}</th>
                                        <th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('reports.ar_aging.days_overdue', 'Days Overdue')}</th>
                                        <th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">{t('reports.ar_aging.amount', 'Amount')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customer.invoices.map((invoice: any) => (
                                        <tr key={invoice.invoiceNumber}>
                                            <td className="py-2 text-sm text-gray-700 dark:text-gray-300">{invoice.invoiceNumber}</td>
                                            <td className="py-2 text-sm text-gray-700 dark:text-gray-300">{new Date(invoice.dueDate).toLocaleDateString(i18n.language)}</td>
                                            <td className="py-2 text-sm text-red-500">{invoice.daysOverdue > 0 ? invoice.daysOverdue : t('reports.ar_aging.current', 'Current')}</td>
                                            <td className="py-2 text-sm text-gray-700 dark:text-gray-300">{formatCurrency(invoice.outstandingAmount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

export const ArAgingReport = ({ data }: { data: any }) => {
    const { t, i18n } = useTranslation('common');
    const isRTL = i18n.language === 'ar';

    if (!data || !data.summary) {
        return (
            <div className="text-center py-20 bg-gray-100/50 dark:bg-gray-800/20 rounded-2xl">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                    {t('reports.ar_aging.no_outstanding', 'No Outstanding Invoices')}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t('reports.ar_aging.all_paid', 'All invoices are paid up. Great job!')}
                </p>
            </div>
        );
    }

    const { summary, customers } = data;

    const agingBuckets = [
        { title: t('reports.ar_aging.current', 'Current'), value: summary.current, color: 'text-green-600 dark:text-green-400' },
        { title: t('reports.ar_aging.1_30_days', '1-30 Days'), value: summary['1-30'], color: 'text-yellow-600 dark:text-yellow-400' },
        { title: t('reports.ar_aging.31_60_days', '31-60 Days'), value: summary['31-60'], color: 'text-orange-600 dark:text-orange-400' },
        { title: t('reports.ar_aging.61_90_days', '61-90 Days'), value: summary['61-90'], color: 'text-red-600 dark:text-red-400' },
        { title: t('reports.ar_aging.91_plus_days', '91+ Days'), value: summary['91+'], color: 'text-red-800 dark:text-red-500 font-bold' },
    ];

    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Summary Cards */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('reports.ar_aging.summary', 'A/R Aging Summary')}</h3>
                     <div className="text-right">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('reports.ar_aging.total_outstanding', 'Total Outstanding')}</p>
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{formatCurrency(summary.totalOutstanding)}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {agingBuckets.map(bucket => (
                        <StatCard key={bucket.title} title={bucket.title} value={formatCurrency(bucket.value)} color={bucket.color} />
                    ))}
                </div>
            </div>

            {/* Customer Breakdown Table */}
             <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white p-6">{t('reports.ar_aging.customer_breakdown', 'Customer Breakdown')}</h3>
                <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50/80 dark:bg-gray-800/80">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reports.ar_aging.customer', 'Customer')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reports.ar_aging.overdue_invoices', 'Overdue Invoices')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reports.ar_aging.total_outstanding', 'Total Outstanding')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            {customers.map((customer: any) => (
                                <CustomerRow key={customer.customerName} customer={customer} t={t} i18n={i18n} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
             {/* How to Read This Report */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.how_to_read', 'How to Read This Report')}</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                    <p>
                       {t('reports.ar_aging.intro', 'The Accounts Receivable (A/R) Aging Report categorizes unpaid customer invoices by the length of time they have been outstanding. It is a critical tool for understanding the financial health of your receivables and managing cash flow.')}
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong className="text-gray-800 dark:text-gray-200">{t('reports.ar_aging.current', 'Current')}:</strong> {t('reports.ar_aging.current_explanation', 'Invoices that are not yet past their due date.')}</li>
                        <li><strong className="text-gray-800 dark:text-gray-200">{t('reports.ar_aging.aging_buckets', '1-91+ Days')}:</strong> {t('reports.ar_aging.aging_buckets_explanation', 'Invoices that are past their due date, grouped into buckets. High numbers in the older buckets (e.g., 61-90 or 91+ days) may require immediate collection efforts.')}</li>
                        <li><strong className="text-gray-800 dark:text-gray-200">{t('reports.ar_aging.total_outstanding', 'Total Outstanding')}:</strong> {t('reports.ar_aging.total_outstanding_explanation', 'The total amount of money owed to your business from all unpaid invoices.')}</li>
                    </ul>
                </div>
            </div>

        </div>
    );
};
