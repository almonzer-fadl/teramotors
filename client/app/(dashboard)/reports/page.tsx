"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BarChart2,
  Users,
  DollarSign,
  Receipt,
  Package,
  Wrench,
  AlertTriangle,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'; // Recharts imports
import { fadeInUp, staggerContainer } from "@/lib/dashboard-animations";

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' }).format(value || 0);

const reports = [
  // Package 1: Financial Core
  {
    titleKey: "reports.pnl.title",
    descriptionKey: "reports.pnl.description",
    href: "/reports/profit-and-loss",
    icon: BarChart2,
    color: "from-blue-500 to-indigo-600",
    summaryApi: "/api/reports/profit-and-loss/summary",
    type: "pnl",
  },
  {
    titleKey: "reports.sales.title",
    descriptionKey: "reports.sales.description",
    href: "/reports/sales",
    icon: DollarSign,
    color: "from-green-500 to-emerald-600",
    summaryApi: "/api/reports/sales/summary",
    type: "sales",
  },
  {
    titleKey: "reports.ar_aging.title",
    descriptionKey: "reports.ar_aging.description",
    href: "/reports/accounts-receivable",
    icon: Users,
    color: "from-amber-500 to-orange-600",
    summaryApi: "/api/reports/accounts-receivable/summary",
    type: "ar",
  },
  {
    titleKey: "reports.vat.title",
    descriptionKey: "reports.vat.description",
    href: "/reports/vat",
    icon: Receipt,
    color: "from-red-500 to-rose-600",
    summaryApi: "/api/reports/vat/summary",
    type: "vat",
  },
  {
    titleKey: "reports.payments.title",
    descriptionKey: "reports.payments.description",
    href: "/reports/payments-received",
    icon: Receipt,
    color: "from-purple-500 to-violet-600",
    summaryApi: "/api/reports/payments-received/summary",
    type: "payments",
  },
  // Package 2: Operations & Assets
  {
    titleKey: "reports.inventory_valuation.title",
    descriptionKey: "reports.inventory_valuation.description",
    href: "/reports/inventory-valuation",
    icon: Package,
    color: "from-cyan-500 to-sky-600",
    summaryApi: "/api/reports/inventory-valuation/summary",
    type: "inventory",
  },
  {
    titleKey: "reports.technician_performance.title",
    descriptionKey: "reports.technician_performance.description",
    href: "/reports/technician-performance",
    icon: Wrench,
    color: "from-gray-500 to-slate-600",
    summaryApi: "/api/reports/technician-performance/summary",
    type: "tech",
  },
];

const ReportCard = ({ titleKey, descriptionKey, href, icon: Icon, color, summaryApi, type }: (typeof reports)[0]) => {
  const { t } = useTranslation("common");
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    if (summaryApi) {
      const fetchSummary = async () => {
        setLoadingSummary(true);
        try {
          const response = await fetch(summaryApi);
          if (response.ok) {
            const data = await response.json();
            setSummaryData(data);
          }
        } catch (error) {
          console.error(`Failed to fetch summary for ${titleKey}:`, error);
        } finally {
          setLoadingSummary(false);
        }
      };
      fetchSummary();
    } else {
      setLoadingSummary(false);
    }
  }, [summaryApi, titleKey]);

  const renderContent = () => {
    if (loadingSummary) {
      return (
        <div className="flex items-center justify-center h-full min-h-[100px]">
          <Loader2 className="h-6 w-6 animate-spin text-[#F97402]" />
        </div>
      );
    }

    if (!summaryData && summaryApi) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[100px] text-gray-500 dark:text-gray-400 text-sm text-center">
                <HelpCircle className="h-6 w-6 mb-1" />
                No data for summary
            </div>
        );
    }

    if (type === "pnl" && summaryData) {
      const { grossProfit, totalRevenue, totalCogs } = summaryData;
      const data = [
        { name: 'Gross Profit', value: grossProfit || 0 },
        { name: 'COGS', value: totalCogs || 0 },
      ];
      const COLORS = ['#10b981', '#ef4444']; // Green for profit, Red for COGS

      return (
        <div className="flex flex-col h-full justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t(titleKey)}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(grossProfit)}</p>
          </div>
          <div className="relative w-full h-24">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={40}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={500}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Total Revenue: {formatCurrency(totalRevenue)}</p>
        </div>
      );
    }

    if (type === "sales" && summaryData) {
      const { totalSales, salesByServiceCategory } = summaryData;
      const chartData = salesByServiceCategory.map((item: any) => ({
        name: item.category,
        Sales: item.amount,
      }));

      return (
        <div className="flex flex-col h-full justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t(titleKey)}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalSales)}</p>
          </div>
          <div className="relative w-full h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="Sales" fill="#82ca9d" animationDuration={500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Top services by sales</p>
        </div>
      );
    }

    if (type === "ar" && summaryData) {
        const { totalOutstanding } = summaryData;
        const buckets = [
            { label: '1-30', value: summaryData['1-30'] },
            { label: '31-60', value: summaryData['31-60'] },
            { label: '61+', value: summaryData['61-90'] + summaryData['91+'] },
        ];
        return (
            <div className="flex flex-col h-full justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t(titleKey)}</p>
                <p className="text-2xl font-bold text-red-500 dark:text-red-400 mt-1">{formatCurrency(totalOutstanding)}</p>
            </div>
            <div className="space-y-1 mt-2">
                {buckets.map(bucket => (
                    <div key={bucket.label} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>{bucket.label} Days</span>
                        <span className="font-medium">{formatCurrency(bucket.value)}</span>
                    </div>
                ))}
            </div>
            </div>
        );
    }

    if (type === "vat" && summaryData) {
      const { totalVatCollected } = summaryData;
      return (
        <div className="flex flex-col h-full justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t(titleKey)}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalVatCollected)}</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Total VAT collected in last 30 days.</p>
        </div>
      );
    }

    if (type === "payments" && summaryData) {
      const { totalPaymentsReceived } = summaryData;
      return (
        <div className="flex flex-col h-full justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t(titleKey)}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalPaymentsReceived)}</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Total payments received in last 30 days.</p>
        </div>
      );
    }

    if (type === "inventory" && summaryData) {
      const { totalInventoryValue } = summaryData;
      return (
        <div className="flex flex-col h-full justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t(titleKey)}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(totalInventoryValue)}</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Total value of all parts in stock.</p>
        </div>
      );
    }

    if (type === "tech" && summaryData) {
        const chartData = summaryData.map((item: any) => ({
            name: item.mechanicName,
            Revenue: item.totalRevenue,
        }));
        return (
            <div className="flex flex-col h-full justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t(titleKey)}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{summaryData.length > 0 ? formatCurrency(summaryData[0].totalRevenue) : formatCurrency(0)}</p>
            </div>
            <div className="relative w-full h-24">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="Revenue" fill="#8884d8" animationDuration={500} />
                </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Top technician by revenue (last 30 days).</p>
            </div>
        );
    }

    // Default content for reports without specific summary data/charts
    return (
      <div className="relative flex flex-col h-full">
        <div className="mb-4">
          <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
            <Icon className="w-7 h-7" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t(titleKey)}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm flex-grow">{t(descriptionKey)}</p>
      </div>
    );
  };

  return (
    <Link href={href}>
      <motion.div
        variants={fadeInUp}
        className="relative group block w-full h-full bg-white dark:bg-gray-900/80 p-6 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-black/30 border border-gray-100 dark:border-gray-800 hover:border-[#F97402] hover:shadow-[#F97402]/20 hover:shadow-2xl transition-all duration-300"
      >
        <div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
        ></div>
        <div className="relative flex flex-col h-full">
          {renderContent()}
          <div className="mt-4 text-sm font-semibold text-[#F97402] text-right">
            {t('reports.view_report')} &rarr;
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default function ReportsPage() {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="mb-8" variants={fadeInUp}>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            {t("reports.title")}
          </h1>
          <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
            {t("reports.description")}
          </p>
        </motion.div>

        {/* Report Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard key={report.href} {...report} />
          ))}
        </div>

        {/* Disclaimer for data not tracked */}
         <motion.div variants={fadeInUp} className="mt-12 bg-yellow-50/80 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 rounded-r-lg">
            <div className="flex">
                <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 dark:text-yellow-500" aria-hidden="true" />
                </div>
                <div className="ms-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        <span className="font-bold">{t('reports.disclaimer.title')}</span>: {t('reports.disclaimer.description')}
                    </p>
                </div>
            </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
