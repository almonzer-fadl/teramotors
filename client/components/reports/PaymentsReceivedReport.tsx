"use client";

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, FileText, HelpCircle } from 'lucide-react';
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

export const PaymentsReceivedReport = ({ data }: { data: any }) => {
    const { t } = useTranslation('common');

    if (!data || data.paymentCount === 0) {
        return (
             <div className="text-center py-20 bg-gray-100/50 dark:bg-gray-800/20 rounded-2xl">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                    No Data Available
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    There are no completed payments within the selected date range.
                </p>
            </div>
        );
    }

    const { totalPaymentsReceived, paymentsByMethod, paymentCount, payments } = data;
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                    title="Total Payments Received" 
                    value={formatCurrency(totalPaymentsReceived)} 
                    icon={<DollarSign className="w-7 h-7 text-white" />}
                    color="bg-gradient-to-br from-green-500 to-emerald-600"
                    tooltip="Sum of all completed payments in the period."
                />
                <StatCard 
                    title="Total Transactions" 
                    value={paymentCount.toString()} 
                    icon={<FileText className="w-7 h-7 text-white" />}
                    color="bg-gradient-to-br from-blue-500 to-indigo-600"
                    tooltip="Total number of completed payment transactions."
                />
            </div>

            {/* Chart and Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payments by Method</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={paymentsByMethod}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={110}
                                fill="#8884d8"
                                dataKey="amount"
                                label={({ method, percent }: { method: string, percent: any }) => `${method}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {paymentsByMethod.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white p-6">Detailed Payments List</h3>
                    <div className="overflow-y-auto h-[300px]">
                         <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50/80 dark:bg-gray-800/80 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                {payments.map((payment: any) => (
                                    <tr key={payment._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{payment.invoiceId?.invoiceNumber || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">{formatCurrency(payment.amount)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{payment.paymentMethod}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
};
