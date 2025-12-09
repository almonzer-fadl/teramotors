'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, DollarSign, ArrowRight } from 'lucide-react';
import type { IService } from '@/lib/models/Service';

interface ServiceSelectorProps {
  services: IService[];
  onSelect: (serviceId: string) => void;
  language?: 'ar' | 'en';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const categoryVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

const cardVariants = {
  unselected: {
    scale: 1,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  },
  selected: {
    scale: 1.02,
    boxShadow: '0 20px 25px -5px rgb(249 116 2 / 0.1), 0 8px 10px -6px rgb(249 116 2 / 0.1)',
  },
  hover: {
    scale: 1.01,
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
};

export function ServiceSelector({ services, onSelect, language = 'en' }: ServiceSelectorProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const isArabic = language === 'ar';

  const handleSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleContinue = () => {
    if (selectedService) {
      onSelect(selectedService);
    }
  };

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || (isArabic ? 'عام' : 'General');
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, IService[]>);

  return (
    <div>
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-8"
      >
        {isArabic ? 'اختر الخدمة' : 'Select Service'}
      </motion.h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {Object.entries(groupedServices).map(([category, categoryServices]) => (
          <motion.div key={category} variants={categoryVariants}>
            <h3 className="text-xl font-semibold bg-gradient-to-r from-[#F97402] to-[#F13F33] bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-gradient-to-b from-[#F97402] to-[#F13F33] rounded-full" />
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryServices.map((service) => {
                const isSelected = selectedService === service._id?.toString();
                return (
                  <motion.button
                    key={service._id?.toString()}
                    onClick={() => handleSelect(service._id?.toString() || '')}
                    variants={cardVariants}
                    initial="unselected"
                    animate={isSelected ? 'selected' : 'unselected'}
                    whileHover="hover"
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-6 rounded-2xl border-2 text-left transition-all overflow-hidden ${
                      isSelected
                        ? 'border-[#F97402] bg-gradient-to-br from-[#F97402]/5 to-[#F13F33]/5 dark:from-[#F97402]/10 dark:to-[#F13F33]/10'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-[#F97402]/30'
                    }`}
                  >
                    {/* Gradient overlay on selected */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-br from-[#F97402]/5 to-[#F13F33]/5 pointer-events-none"
                      />
                    )}

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white pr-8">
                          {service.name}
                        </h4>
                        <motion.div
                          initial={false}
                          animate={{
                            scale: isSelected ? 1 : 0.95,
                            backgroundColor: isSelected ? '#F97402' : 'transparent',
                          }}
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'border-[#F97402]'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                              <Check className="w-4 h-4 text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </motion.div>
                      </div>

                      {service.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {service.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm gap-4">
                        {service.estimatedDuration && (
                          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                            <div className="p-1.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
                              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium">
                              {service.estimatedDuration} {isArabic ? 'دقيقة' : 'min'}
                            </span>
                          </div>
                        )}
                        {service.laborRate && (
                          <div className="flex items-center gap-1.5">
                            <div className="p-1.5 bg-gradient-to-br from-[#F97402]/10 to-[#F13F33]/10 rounded-lg">
                              <DollarSign className="w-3.5 h-3.5 text-[#F97402]" />
                            </div>
                            <span className="text-gray-900 dark:text-white font-bold">
                              {service.laborRate} {isArabic ? 'ريال' : 'SAR'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-10 flex justify-end"
      >
        <motion.button
          onClick={handleContinue}
          disabled={!selectedService}
          whileHover={selectedService ? { scale: 1.02 } : {}}
          whileTap={selectedService ? { scale: 0.98 } : {}}
          className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center gap-3 shadow-lg ${
            selectedService
              ? 'bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white hover:shadow-xl hover:shadow-[#F97402]/25'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          {isArabic ? 'التالي' : 'Continue'}
          <ArrowRight className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} />
        </motion.button>
      </motion.div>
    </div>
  );
}
