'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar,
  Car,
  User,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/portal/Modal';
import { AppointmentsContent } from '@/components/portal/AppointmentsContent';
import { VehiclesContent } from '@/components/portal/VehiclesContent';
import { ProfileContent } from '@/components/portal/ProfileContent';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  licensePlate?: string;
  vin?: string;
}

interface Appointment {
  _id: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  serviceId: {
    name: string;
  };
  vehicleId: {
    make: string;
    model: string;
  };
}

interface DashboardData {
  customer: Customer;
  upcomingAppointments: Appointment[];
  vehicles: Vehicle[];
  stats: {
    totalAppointments: number;
    completedAppointments: number;
    totalVehicles: number;
  };
}

// Portal Language Switcher Component
function PortalLanguageSwitcher() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
    // Update document direction for RTL
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  if (!mounted) {
    return <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800" />;
  }

  return (
    <motion.button
      onClick={toggleLanguage}
      className="relative w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${i18n.language === 'en' ? 'Arabic' : 'English'}`}
    >
      <motion.span
        key={i18n.language}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="text-sm font-bold text-gray-700 dark:text-gray-300"
      >
        {i18n.language === 'en' ? 'EN' : 'ع'}
      </motion.span>
    </motion.button>
  );
}

export default function CustomerPortalDashboard() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.slug as string;
  const { i18n } = useTranslation('common');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  // Modal states
  const [appointmentsModalOpen, setAppointmentsModalOpen] = useState(false);
  const [vehiclesModalOpen, setVehiclesModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Set initial language and direction
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en';
    i18n.changeLanguage(savedLang);
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLang;
  }, [i18n]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/portal/dashboard?tenantSlug=${tenantSlug}`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/portal/${tenantSlug}/login`);
          return;
        }
        throw new Error('Failed to load dashboard');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/portal/auth/logout', { method: 'POST' });
      router.push(`/portal/${tenantSlug}/login`);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-[#F97402] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push(`/portal/${tenantSlug}/login`)}
            className="px-6 py-3 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  const { customer, upcomingAppointments, vehicles, stats } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Welcome Message */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Company Logo - matches dashboard TopBarLogo */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src="/icon.png"
                  alt="TeraMotors Logo"
                  className="w-10 h-10 object-contain rounded-lg"
                />
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#F97402] to-[#F13F33] bg-clip-text text-transparent">
                  {i18n.language === 'ar'
                    ? `مرحباً بعودتك، ${customer.firstName}`
                    : `Welcome back, ${customer.firstName}`}
                </h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  {customer.email}
                </motion.p>
              </div>
            </motion.div>

            {/* Right: Controls */}
            <motion.div
              className="flex items-center gap-2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Language Switcher */}
              <PortalLanguageSwitcher />

              {/* Logout Button */}
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {i18n.language === 'ar' ? 'تسجيل خروج' : 'Logout'}
                </span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, staggerChildren: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -5, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50"
              >
                <Calendar className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {i18n.language === 'ar' ? 'إجمالي المواعيد' : 'Total Appointments'}
                </p>
                <motion.p
                  key={stats.totalAppointments}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"
                >
                  {stats.totalAppointments}
                </motion.p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -5, boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)" }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:shadow-green-500/50"
              >
                <CheckCircle2 className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {i18n.language === 'ar' ? 'مكتمل' : 'Completed'}
                </p>
                <motion.p
                  key={stats.completedAppointments}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent"
                >
                  {stats.completedAppointments}
                </motion.p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05, y: -5, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.3)" }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50"
              >
                <Car className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {i18n.language === 'ar' ? 'سياراتي' : 'My Vehicles'}
                </p>
                <motion.p
                  key={stats.totalVehicles}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent"
                >
                  {stats.totalVehicles}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {i18n.language === 'ar' ? 'المواعيد القادمة' : 'Upcoming Appointments'}
                </h2>
                <motion.button
                  onClick={() => setAppointmentsModalOpen(true)}
                  whileHover={{ scale: 1.05, x: i18n.language === 'ar' ? -3 : 3 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-[#F97402] hover:text-[#F13F33] font-medium text-sm flex items-center gap-1"
                >
                  {i18n.language === 'ar' ? 'عرض الكل' : 'View All'}
                  <ArrowRight className={`w-4 h-4 ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
                </motion.button>
              </div>

              <div className="space-y-4">
                {upcomingAppointments.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    </motion.div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {i18n.language === 'ar' ? 'لا توجد مواعيد قادمة' : 'No upcoming appointments'}
                    </p>
                    <motion.button
                      onClick={() => router.push(`/book/${tenantSlug}`)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      {i18n.language === 'ar' ? 'احجز موعد' : 'Book Appointment'}
                    </motion.button>
                  </motion.div>
                ) : (
                  upcomingAppointments.map((appointment, index) => (
                    <motion.div
                      key={appointment._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {appointment.serviceId.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          appointment.status === 'confirmed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : appointment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(appointment.scheduledDate).toLocaleDateString()} at {appointment.scheduledTime}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <Car className="w-4 h-4 inline mr-1" />
                        {appointment.vehicleId.make} {appointment.vehicleId.model}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* My Vehicles */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {i18n.language === 'ar' ? 'سياراتي' : 'My Vehicles'}
                </h2>
                <motion.button
                  onClick={() => setVehiclesModalOpen(true)}
                  whileHover={{ scale: 1.05, x: i18n.language === 'ar' ? -3 : 3 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-[#F97402] hover:text-[#F13F33] font-medium text-sm flex items-center gap-1"
                >
                  {i18n.language === 'ar' ? 'عرض الكل' : 'View All'}
                  <ArrowRight className={`w-4 h-4 ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
                </motion.button>
              </div>

              <div className="space-y-4">
                {vehicles.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    </motion.div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {i18n.language === 'ar' ? 'لا توجد سيارات مسجلة' : 'No vehicles registered'}
                    </p>
                  </motion.div>
                ) : (
                  vehicles.slice(0, 3).map((vehicle, index) => (
                    <motion.div
                      key={vehicle._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-700"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                          <Car className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h3>
                          {vehicle.licensePlate && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {vehicle.licensePlate}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
          >
            <Sparkles className="w-6 h-6 text-[#F97402]" />
            {i18n.language === 'ar' ? 'الإجراءات السريعة' : 'Quick Actions'}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Book Appointment - Prominent Button (Public Access) */}
            <motion.button
              onClick={() => router.push(`/book/${tenantSlug}`)}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.08, y: -5, boxShadow: "0 20px 40px rgba(249, 116, 2, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="group relative p-8 bg-gradient-to-br from-[#F97402] via-[#F55C1A] to-[#F13F33] text-white rounded-2xl shadow-2xl hover:shadow-[#F97402]/50 transition-all overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <Calendar className="w-10 h-10 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-lg">
                {i18n.language === 'ar' ? 'احجز موعد' : 'Book Appointment'}
              </p>
              <p className="text-xs mt-1 text-white/80">
                {i18n.language === 'ar' ? 'متاح للجميع' : 'Available for everyone'}
              </p>
            </motion.button>

            <motion.button
              onClick={() => setAppointmentsModalOpen(true)}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05, y: -3, boxShadow: "0 15px 30px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all group"
            >
              <Clock className="w-9 h-9 mx-auto mb-2 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 dark:text-white">
                {i18n.language === 'ar' ? 'مواعيدي' : 'My Appointments'}
              </p>
            </motion.button>

            <motion.button
              onClick={() => setVehiclesModalOpen(true)}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05, y: -3, boxShadow: "0 15px 30px rgba(168, 85, 247, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all group"
            >
              <Car className="w-9 h-9 mx-auto mb-2 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 dark:text-white">
                {i18n.language === 'ar' ? 'سياراتي' : 'My Vehicles'}
              </p>
            </motion.button>

            <motion.button
              onClick={() => setProfileModalOpen(true)}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.3, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05, y: -3, boxShadow: "0 15px 30px rgba(107, 114, 128, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all group"
            >
              <User className="w-9 h-9 mx-auto mb-2 text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-900 dark:text-white">
                {i18n.language === 'ar' ? 'ملفي الشخصي' : 'My Profile'}
              </p>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <Modal
        open={appointmentsModalOpen}
        onClose={() => setAppointmentsModalOpen(false)}
        title={i18n.language === 'ar' ? 'مواعيدي' : 'My Appointments'}
      >
        <AppointmentsContent />
      </Modal>

      <Modal
        open={vehiclesModalOpen}
        onClose={() => setVehiclesModalOpen(false)}
        title={i18n.language === 'ar' ? 'سياراتي' : 'My Vehicles'}
      >
        <VehiclesContent />
      </Modal>

      <Modal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        title={i18n.language === 'ar' ? 'ملفي الشخصي' : 'My Profile'}
      >
        <ProfileContent />
      </Modal>
    </div>
  );
}
