'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Car, Plus, Loader2 } from 'lucide-react';
import { useSession } from '@/lib/hooks/useSession';
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

interface Vehicle {
    _id: string;
    make: string;
    model: string;
    year: number;
    licensePlate?: string;
    vin?: string;
}

export default function VehiclesPage() {
  const { user, isLoading: isSessionLoading } = useSession();
  const { t, i18n } = useTranslation(['common', 'dashboard']);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles');
        if (!response.ok) {
          throw new Error(t('dashboard:vehicles.fetch_error'));
        }
        const data = await response.json();
        setVehicles(data);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchVehicles();
    }
  }, [user, t]);

  if (isSessionLoading || isLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin h-10 w-10 text-[#F97402]" /></div>;
  }

  return (
    <motion.div
      key="vehicles-page"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="max-w-6xl mx-auto py-12 px-4"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {t('dashboard:vehicles.title')}
        </h1>
        <motion.button 
            className="flex items-center justify-center px-5 py-3 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <Plus className="mr-2" />
            {t('dashboard:vehicles.add_vehicle')}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {vehicles.map((vehicle, i) => (
          <motion.div key={vehicle._id} variants={itemVariants}>
            <GlassmorphicCard className="p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-start">
                    <Car className="h-10 w-10 text-[#F97402]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{vehicle.make} {vehicle.model}</h2>
                <p className="text-gray-600 dark:text-gray-300">{vehicle.year}</p>
              </div>
              <div className="mt-6">
                {vehicle.licensePlate && <p className="text-sm text-gray-500 dark:text-gray-400"><strong>{t('dashboard:vehicles.license_plate')}:</strong> {vehicle.licensePlate}</p>}
                {vehicle.vin && <p className="text-sm text-gray-500 dark:text-gray-400"><strong>{t('dashboard:vehicles.vin')}:</strong> {vehicle.vin}</p>}
              </div>
            </GlassmorphicCard>
          </motion.div>
        ))}
      </div>

      {vehicles.length === 0 && (
        <motion.div variants={itemVariants}>
            <GlassmorphicCard className="p-12 text-center">
                <Car className="h-16 w-16 mx-auto text-gray-400" />
                <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">{t('dashboard:vehicles.no_vehicles_title')}</h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">{t('dashboard:vehicles.no_vehicles_desc')}</p>
            </GlassmorphicCard>
        </motion.div>
      )}
    </motion.div>
  );
}