"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { DollarSign, Tag, Wrench, Package, HelpCircle } from 'lucide-react';
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

export const SalesReport = ({ data }: { data: any }) => {
    const { t, i18n } = useTranslation('common');
    const isRTL = i18n.language === 'ar';

    if (!data || data.totalSales === undefined) {
        return (
            <div className="text-center py-20 bg-gray-100/50 dark:bg-gray-800/20 rounded-2xl">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                    {t('reports.no_data_available', 'No Data Available')}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t('reports.sales.no_sales', 'There are no sales within the selected date range to generate this report.')}
                </p>
            </div>
        );
    }

    const { totalSales, salesByServiceCategory, salesByPartCategory, topSellingServices, topSellingParts } = data;

    const COLORS_SERVICES = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];
    const COLORS_PARTS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A6'];

    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title={t('reports.sales.total_sales')} 
                    value={formatCurrency(totalSales)} 
                    icon={<DollarSign className="w-7 h-7 text-white" />}
                    color="bg-gradient-to-br from-green-500 to-emerald-600"
                    tooltip={t('reports.sales.total_sales_tooltip')}
                />
                <StatCard 
                    title={t('reports.sales.total_service_categories')} 
                    value={salesByServiceCategory.length.toString()} 
                    icon={<Wrench className="w-7 h-7 text-white" />}
                    color="bg-gradient-to-br from-blue-500 to-indigo-600"
                    tooltip={t('reports.sales.total_service_categories_tooltip')}
                />
                <StatCard 
                    title={t('reports.sales.total_part_categories')} 
                    value={salesByPartCategory.length.toString()} 
                    icon={<Package className="w-7 h-7 text-white" />}
                    color="bg-gradient-to-br from-purple-500 to-violet-600"
                    tooltip={t('reports.sales.total_part_categories_tooltip')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales by Service Category */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.sales.sales_by_service_category')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={salesByServiceCategory}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={110}
                                fill="#8884d8"
                                dataKey="amount"
                                label={(props) => {
                                    const { name, percent } = props as { name?: string; percent?: number };
                                    const pct = (percent ?? 0) * 100;
                                    return `${name ?? ''}: ${pct.toFixed(0)}%`;
                                }}
                            >
                                {salesByServiceCategory.map((entry: { amount: number }, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_SERVICES[index % COLORS_SERVICES.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Sales by Part Category */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.sales.sales_by_part_category')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={salesByPartCategory}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                            <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} interval={0} style={{ fontSize: '0.7rem' }} />
                            <YAxis tickFormatter={formatCurrency} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="amount" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Selling Services and Parts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Selling Services */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.sales.top_selling_services')}</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reports.sales.service_name')}</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reports.sales.quantity_sold')}</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reports.sales.total_revenue')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {topSellingServices.map((item: any, index: number) => (
                                    <tr key={index}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{item.count}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{formatCurrency(item.totalRevenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Selling Parts */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.sales.top_selling_parts')}</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reports.sales.part_name')}</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reports.sales.quantity_sold')}</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reports.sales.total_revenue')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {topSellingParts.map((item: any, index: number) => (
                                    <tr key={index}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{item.count}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{formatCurrency(item.totalRevenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* How to Read This Report */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.sales.how_to_read_this_report')}</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                    <p>
                        <strong className="text-gray-800 dark:text-gray-200">{t('reports.sales.total_sales')}:</strong> {t('reports.sales.total_sales_explanation')}
                    </p>
                    <p>
                        <strong className="text-gray-800 dark:text-gray-200">{t('reports.sales.sales_by_service_category')}:</strong> {t('reports.sales.sales_by_service_category_explanation')}
                    </p>
                    <p>
                        <strong className="text-gray-800 dark:text-gray-200">{t('reports.sales.sales_by_part_category')}:</strong> {t('reports.sales.sales_by_part_category_explanation')}
                    </p>
                    <p>
                        <strong className="text-gray-800 dark:text-gray-200">{t('reports.sales.top_selling_services')}:</strong> {t('reports.sales.top_selling_services_explanation')}
                    </p>
                    <p>
                        <strong className="text-gray-800 dark:text-gray-200">{t('reports.sales.top_selling_parts')}:</strong> {t('reports.sales.top_selling_parts_explanation')}
                    </p>
                </div>
            </div>
        </div>
    );
};
