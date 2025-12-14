"use client";

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User, DollarSign, Wrench, Clock, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' }).format(value || 0);
const formatHours = (value: number) => `${(value || 0).toFixed(1)} hrs`;

export const TechnicianPerformanceReport = ({ data }: { data: any[] | null }) => {
    const { t, i18n } = useTranslation('common');
    const isRTL = i18n.language === 'ar';

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-100/50 dark:bg-gray-800/20 rounded-2xl">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                    {t('reports.technician.no_data', 'No Performance Data Available')}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t('reports.technician.no_jobs', 'There are no completed jobs by technicians within the selected date range.')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Chart */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reports.technician.revenue_by_technician', 'Revenue by Technician')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                        <XAxis dataKey="mechanicName" angle={-45} textAnchor="end" height={80} interval={0} style={{ fontSize: '0.8rem' }} />
                        <YAxis tickFormatter={formatCurrency} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="totalRevenue" fill="#8884d8" name={t('reports.technician.total_revenue', 'Total Revenue')} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Detailed Table */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white p-6">{t('reports.technician.performance_details', 'Performance Details')}</h3>
                <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50/80 dark:bg-gray-800/80">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reports.technician.technician', 'Technician')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reports.technician.jobs_completed', 'Jobs Completed')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reports.technician.avg_job_time', 'Avg. Job Time')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('reports.technician.total_revenue_generated', 'Total Revenue Generated')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            {data.map((tech: any) => (
                                <tr key={tech.mechanicId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{tech.mechanicName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{tech.jobsCompleted}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{formatHours(tech.avgJobTime)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(tech.totalRevenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
