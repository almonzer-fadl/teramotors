'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { User, Car, Calendar } from 'lucide-react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Modal from '@/components/portal/Modal';
import { ProfileContent } from '@/components/portal/ProfileContent';
import { VehiclesContent } from '@/components/portal/VehiclesContent';
import { AppointmentsContent } from '@/components/portal/AppointmentsContent';
import { useCustomerSession } from '@/lib/hooks/useCustomerSession';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.7, ease: [0.32, 0.72, 0, 1] } },
};

const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.32, 0.72, 0, 1] } },
};

const GlassmorphicCard = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: (e: React.MouseEvent) => void }) => (
  <motion.div 
    variants={itemVariants}
    whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
    onClick={onClick}
    className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl rounded-3xl shadow-lg border border-white/20 dark:border-gray-700/50 p-8 cursor-pointer overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
);


function DashboardContent() {
    const { t } = useTranslation(['dashboard']);
    const { customer } = useCustomerSession();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug;
    const modal = searchParams.get('modal');
  
    const openModal = (e: React.MouseEvent, modalName: string) => {
      e.preventDefault();
      console.log('Opening modal:', modalName);
      router.push(`?modal=${modalName}`, { scroll: false });
    };
  
    const closeModal = () => {
      router.push(`/portal/${slug}`, { scroll: false });
    };
  
    const navItems = [
      { path: 'profile', label: t('profile.title'), icon: User, description: t('profile.description') },
      { path: 'vehicles', label: t('vehicles.title'), icon: Car, description: t('vehicles.description') },
      { path: 'appointments', label: t('appointments.title'), icon: Calendar, description: t('appointments.description') },
    ];
  
    return (
      <motion.div
        key="customer-dashboard"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-6xl mx-auto px-4"
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">
            {t('welcome_back')}, {customer?.firstName}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">{t('portal_subtitle')}</p>
        </motion.div>
  
        <motion.div 
            variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {navItems.map((item) => (
            <GlassmorphicCard key={item.path} onClick={(e) => openModal(e, item.path)}>
              <item.icon className="h-12 w-12 text-[#F97402] mb-6" />
              <h2 className="text-2xl font-bold mb-2">{item.label}</h2>
              <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
            </GlassmorphicCard>
          ))}
        </motion.div>
        
        <Modal title={t('profile.title')} open={modal === 'profile'} onClose={closeModal}>
            <ProfileContent />
        </Modal>
        <Modal title={t('vehicles.title')} open={modal === 'vehicles'} onClose={closeModal}>
            <VehiclesContent />
        </Modal>
        <Modal title={t('appointments.title')} open={modal === 'appointments'} onClose={closeModal}>
            <AppointmentsContent />
        </Modal>

      </motion.div>
    );
}


export default function CustomerPortalDashboard() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin h-10 w-10 text-[#F97402]" /></div>}>
            <DashboardContent />
        </Suspense>
    )
}
