"use client";

import { motion } from 'framer-motion';
import { Percent, DollarSign, FileText, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' }).format(value || 0);

const StatCard = ({ title, value, icon, color, tooltip }: { title: string; value: string; icon: React.ReactNode; color: string; tooltip: string }) => (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${color}`}>
                {icon}
            </div>
        </div>
        <div className="group relative flex items-center mt-4">
            <HelpCircle className="h-4 w-4 text-gray-400 dark:text-gray-500 me-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">{tooltip}</p>
        </div>
    </div>
);

export const VatReport = ({ data }: { data: any }) => {
    const { t } = useTranslation('common');

    if (!data || data.invoiceCount === 0) {
        return (
            <div className="text-center py-20 bg-gray-100/50 dark:bg-gray-800/20 rounded-2xl">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                    No Data Available
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    There are no invoices within the selected date range to generate this report.
                </p>
            </div>
        );
    }

    const { totalVatCollected, totalSalesWithoutVat, invoiceCount, invoices } = data;

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total VAT Collected" 
                    value={formatCurrency(totalVatCollected)} 
                    icon={<Percent className="w-7 h-7 text-white" />}
                    color="bg-gradient-to-br from-red-500 to-rose-600"
                    tooltip="Sum of VAT from all invoices in the period."
                />
                <StatCard 
                    title="Total Sales (excl. VAT)" 
                    value={formatCurrency(totalSalesWithoutVat)} 
                    icon={<DollarSign className="w-7 h-7 text-white" />}
                    color="bg-gradient-to-br from-green-500 to-emerald-600"
                    tooltip="Total revenue minus the VAT amount."
                />
                <StatCard 
                    title="Total Invoices" 
                    value={invoiceCount.toString()} 
                    icon={<FileText className="w-7 h-7 text-white" />}
                    color="bg-gradient-to-br from-blue-500 to-indigo-600"
                    tooltip="Total number of invoices issued in the period."
                />
            </div>
            
            {/* Invoices Table */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white p-6">Invoice Breakdown</h3>
                <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50/80 dark:bg-gray-800/80">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">VAT Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            {invoices.map((invoice: any) => (
                                <tr key={invoice.invoiceNumber}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{new Date(invoice.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">{formatCurrency(invoice.totalAmount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600 dark:text-red-400">{formatCurrency(invoice.vatAmount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* How to Read This Report */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">How to Read This Report</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                    <p>
                       This report summarizes the Value Added Tax (VAT) collected from customers, which is essential for tax filing purposes.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong className="text-gray-800 dark:text-gray-200">Total VAT Collected:</strong> The sum of all VAT amounts from every invoice in the selected period. This is the amount you are required to report and remit to the tax authorities.</li>
                        <li><strong className="text-gray-800 dark:text-gray-200">Total Sales (excl. VAT):</strong> The total revenue from services and parts before VAT is added. This represents your net sales.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
