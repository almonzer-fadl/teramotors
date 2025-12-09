'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calendar, Loader2 } from 'lucide-react';
import { useCustomerSession } from '@/lib/hooks/useCustomerSession';
import toast from 'react-hot-toast';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
};

const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const GlassmorphicCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50 ${className}`}>
    {children}
  </div>
);

interface Appointment {
    _id: string;
    serviceId: { name: string };
    vehicleId: { make: string; model: string; };
    appointmentDate: string;
    status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
}

export function AppointmentsContent() {
  const { customer, isLoading: isSessionLoading } = useCustomerSession();
  const { t } = useTranslation(['dashboard']);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (customer) {
        try {
          const response = await fetch('/api/portal/appointments');
          if (!response.ok) {
            throw new Error(t('appointments.fetch_error'));
          }
          const data = await response.json();
          setAppointments(data);
        } catch (error: any) {
          toast.error(error.message);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchAppointments();
  }, [customer, t]);

  if (isSessionLoading || isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin h-10 w-10 text-[#F97402]" /></div>;
  }
  
  const upcomingAppointments = appointments.filter(a => new Date(a.appointmentDate) >= new Date());
  const pastAppointments = appointments.filter(a => new Date(a.appointmentDate) < new Date());

  return (
    <motion.div
      key="appointments-page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <h1 className="text-3xl font-bold mb-8">
        {t('appointments.title')}
      </h1>

      <motion.div variants={itemVariants} className="mb-12">
        <h2 className="text-2xl font-bold mb-4">{t('appointments.upcoming')}</h2>
        {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
            {upcomingAppointments.map((app) => (
                <GlassmorphicCard key={app._id} className="p-6">
                    <p>{app.serviceId.name} for {app.vehicleId.make} {app.vehicleId.model}</p>
                    <p>{new Date(app.appointmentDate).toLocaleString()}</p>
                    <p>{app.status}</p>
                </GlassmorphicCard>
            ))}
            </div>
        ) : (
            <GlassmorphicCard className="p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto text-gray-400" />
                <h3 className="mt-4 text-xl font-medium">{t('appointments.no_upcoming_title')}</h3>
                <p className="mt-1 text-gray-500">{t('appointments.no_upcoming_desc')}</p>
            </GlassmorphicCard>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold mb-4">{t('appointments.past')}</h2>
        {pastAppointments.length > 0 ? (
            <div className="space-y-4">
            {pastAppointments.map((app) => (
                <GlassmorphicCard key={app._id} className="p-6">
                    <p>{app.serviceId.name} for {app.vehicleId.make} {app.vehicleId.model}</p>
                    <p>{new Date(app.appointmentDate).toLocaleString()}</p>
                    <p>{app.status}</p>
                </GlassmorphicCard>
            ))}
            </div>
        ) : (
            <GlassmorphicCard className="p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto text-gray-400" />
                <h3 className="mt-4 text-xl font-medium">{t('appointments.no_past_title')}</h3>
                <p className="mt-1 text-gray-500">{t('appointments.no_past_desc')}</p>
            </GlassmorphicCard>
        )}
      </motion.div>
    </motion.div>
  );
}
