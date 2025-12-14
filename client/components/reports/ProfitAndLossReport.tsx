"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, TrendingUp, HelpCircle } from 'lucide-react';
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

export const ProfitAndLossReport = ({ data }: { data: any }) => {
    const { t, i18n } = useTranslation('common');
    const isRTL = i18n.language === 'ar';

    if (!data || data.invoiceCount === 0) {
        return (
            <div className="text-center py-20 bg-gray-100/50 dark:bg-gray-800/20 rounded-2xl">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                    {t('reports.no_data_available', 'No Data Available')}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t('reports.pnl.no_invoices', 'There are no invoices within the selected date range to generate this report.')}
                </p>
            </div>
        );
    }

    const { totalRevenue, totalCogs, grossProfit, serviceRevenue, partsRevenue } = data;

    const revenueBreakdownData = [
        { name: t('reports.pnl.service_revenue', 'Service Revenue'), value: serviceRevenue },
        { name: t('reports.pnl.parts_revenue', 'Parts Revenue'), value: partsRevenue },
    ];

    const COLORS = ['#10b981', '#3b82f6'];

    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title={t('reports.pnl.total_revenue', 'Total Revenue')}
                    value={formatCurrency(totalRevenue)}
                    icon={<DollarSign className="w-7 h-7 text-white" />}
                    color="bg-gradient-to-br from-green-500 to-emerald-600"
                    tooltip={t('reports.pnl.total_revenue_tooltip', 'Sum of all invoice totals (services + parts).')}
                />
                <StatCard
                    title={t('reports.pnl.cogs', 'Cost of Goods Sold (COGS)')}
                    value={formatCurrency(totalCogs)}
                    icon={<ShoppingCart className="w-7 h-7 text-white" />}
                    color="bg-gradient-to-br from-red-500 to-rose-600"
                    tooltip={t('reports.pnl.cogs_tooltip', 'Total cost of parts used in completed jobs.')}
                />
                <StatCard
                    title={t('reports.pnl.gross_profit', 'Gross Profit')}
                    value={formatCurrency(grossProfit)}
                    icon={<TrendingUp className="w-7 h-7 text-white" />}
                    color="bg-gradient-to-br from-blue-500 to-indigo-600"
                    tooltip={t('reports.pnl.gross_profit_tooltip', 'Total Revenue minus Cost of Goods Sold.')}
                />
            </div>

            {/* Chart and Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Revenue Breakdown Pie Chart */}
                 <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.pnl.revenue_breakdown', 'Revenue Breakdown')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={revenueBreakdownData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={110}
                                fill="#8884d8"
                                dataKey="value"
                                label={(props) => {
                                    const { name, percent } = props as { name?: string; percent?: number };
                                    const pct = (percent ?? 0) * 100;
                                    return `${name ?? ''}: ${pct.toFixed(0)}%`;
                                }}
                            >
                                {revenueBreakdownData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Summary Table */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.summary', 'Summary')}</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">{t('reports.pnl.total_revenue', 'Total Revenue')}</span>
                            <span className="font-bold text-lg text-gray-900 dark:text-white">{formatCurrency(totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">{t('reports.pnl.service_revenue', 'Service Revenue')}</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(serviceRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">{t('reports.pnl.parts_revenue', 'Parts Revenue')}</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(partsRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400">
                            <span>{t('reports.pnl.cogs', 'Cost of Goods Sold (COGS)')}</span>
                            <span className="font-medium">({formatCurrency(totalCogs)})</span>
                        </div>
                        <div className="flex justify-between items-center pt-4">
                            <span className="font-semibold text-gray-900 dark:text-white text-lg">{t('reports.pnl.gross_profit', 'Gross Profit')}</span>
                            <span className="font-bold text-xl text-blue-600 dark:text-blue-400">{formatCurrency(grossProfit)}</span>
                        </div>
                         <div className="flex justify-between items-center pt-4">
                            <span className="text-gray-600 dark:text-gray-400">{t('reports.pnl.gross_profit_margin', 'Gross Profit Margin')}</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                {totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(2) : '0.00'}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {/* How to Read This Report */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.how_to_read', 'How to Read This Report')}</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                    <p>
                        <strong className="text-gray-800 dark:text-gray-200">{t('reports.pnl.total_revenue', 'Total Revenue')}:</strong> {t('reports.pnl.total_revenue_explanation', 'This is the total amount of money invoiced to customers for both services and parts within the selected date range. It represents the total income before any expenses are deducted.')}
                    </p>
                    <p>
                        <strong className="text-gray-800 dark:text-gray-200">{t('reports.pnl.cogs', 'Cost of Goods Sold (COGS)')}:</strong> {t('reports.pnl.cogs_explanation', 'This figure represents the direct cost of the parts sold to customers to perform repairs. It is the sum of the \'cost\' price of all parts listed on the job cards associated with the invoices in this period.')}
                    </p>
                    <p>
                        <strong className="text-gray-800 dark:text-gray-200">{t('reports.pnl.gross_profit', 'Gross Profit')}:</strong> {t('reports.pnl.gross_profit_explanation', 'This is the profit made directly from selling services and parts. It is calculated by subtracting the COGS from the Total Revenue. This number does not account for operational expenses like rent, salaries, or utilities.')}
                    </p>
                </div>
            </div>
        </div>
    );
};
