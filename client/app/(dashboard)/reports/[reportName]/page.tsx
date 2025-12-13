"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Download, BarChart2, Loader2, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { fadeInUp, staggerContainer } from '@/lib/dashboard-animations';
import { ProfitAndLossReport } from '@/components/reports/ProfitAndLossReport';
import { SalesReport } from '@/components/reports/SalesReport'; 
import { ArAgingReport } from '@/components/reports/ArAgingReport';
import { VatReport } from '@/components/reports/VatReport';
import { PaymentsReceivedReport } from '@/components/reports/PaymentsReceivedReport';
import { InventoryValuationReport } from '@/components/reports/InventoryValuationReport';
import { TechnicianPerformanceReport } from '@/components/reports/TechnicianPerformanceReport'; // New import

// Placeholder for report-specific components
const ReportPlaceholder = ({ title, t }: { title: string; t: any }) => (
    <div className="text-center py-20 bg-gray-100/50 dark:bg-gray-800/20 rounded-2xl">
        <BarChart2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            {title} {t('reports.report', 'Report')}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('reports.under_construction', 'This report is under construction.')}
        </p>
    </div>
);


export default function DetailedReportPage() {
    const { t, i18n } = useTranslation('common');
    const isRTL = i18n.language === 'ar';
    const router = useRouter();
    const params = useParams();
    const reportName = params.reportName as string;

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });

    const reportTitle = reportName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    useEffect(() => {
        const fetchData = async () => {
            if (!reportName || !dateRange?.from || !dateRange?.to) return;
            setLoading(true);
            setData(null);
            try {
                const from = format(dateRange.from, 'yyyy-MM-dd');
                const to = format(dateRange.to, 'yyyy-MM-dd');
                
                let response;
                if (reportName === 'profit-and-loss') {
                    response = await fetch(`/api/reports/profit-and-loss?from=${from}&to=${to}`);
                } else if (reportName === 'sales') {
                    response = await fetch(`/api/reports/sales?from=${from}&to=${to}`);
                } else if (reportName === 'accounts-receivable') {
                    response = await fetch(`/api/reports/accounts-receivable`);
                } else if (reportName === 'vat') {
                    response = await fetch(`/api/reports/vat?from=${from}&to=${to}`);
                } else if (reportName === 'payments-received') {
                    response = await fetch(`/api/reports/payments-received?from=${from}&to=${to}`);
                } else if (reportName === 'inventory-valuation') {
                    response = await fetch(`/api/reports/inventory-valuation`);
                } else if (reportName === 'technician-performance') {
                    response = await fetch(`/api/reports/technician-performance?from=${from}&to=${to}`);
                }
                
                if (response && response.ok) {
                    const result = await response.json();
                    setData(result);
                } else if (response) {
                    throw new Error('Failed to fetch report');
                }

            } catch (error) {
                console.error(`Failed to fetch ${reportName} report:`, error);
                setData(null); 
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [reportName, dateRange]);

    const renderReport = () => {
        if (!data) {
            if (reportName === 'profit-and-loss') return <ProfitAndLossReport data={null} />;
            if (reportName === 'sales') return <SalesReport data={null} />;
            if (reportName === 'accounts-receivable') return <ArAgingReport data={null} />;
            if (reportName === 'vat') return <VatReport data={null} />;
            if (reportName === 'payments-received') return <PaymentsReceivedReport data={null} />;
            if (reportName === 'inventory-valuation') return <InventoryValuationReport data={null} />;
            if (reportName === 'technician-performance') return <TechnicianPerformanceReport data={null} />;
            return <ReportPlaceholder title={reportTitle} t={t} />;
        }

        switch(reportName) {
            case 'profit-and-loss':
                return <ProfitAndLossReport data={data} />;
            case 'sales':
                return <SalesReport data={data} />;
            case 'accounts-receivable':
                return <ArAgingReport data={data} />;
            case 'vat':
                return <VatReport data={data} />;
            case 'payments-received':
                return <PaymentsReceivedReport data={data} />;
            case 'inventory-valuation':
                return <InventoryValuationReport data={data} />;
            case 'technician-performance':
                return <TechnicianPerformanceReport data={data} />;
            default:
                return <ReportPlaceholder title={reportTitle} t={t} />;
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
            <motion.div
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" variants={fadeInUp}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/reports')}
                            className="p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#F97402] transition-all duration-200 group"
                        >
                            <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                {reportTitle}
                            </h1>
                            <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                                {t(`reports.${reportName.replace(/-/g, '_')}.description`)}
                            </p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        {reportName !== 'accounts-receivable' && reportName !== 'inventory-valuation' && <DateRangePicker date={dateRange} onDateChange={setDateRange} />}
                    </div>
                </motion.div>

                {/* Report Content */}
                <motion.div variants={fadeInUp}>
                    {loading ? (
                         <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-[#F97402]" />
                        </div>
                    ) : (
                        renderReport()
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}