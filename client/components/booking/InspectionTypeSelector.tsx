'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, ClipboardCheck, Zap, Cpu, Wrench, Car, Shield } from 'lucide-react';
import type { IInspectionTemplate } from '@/lib/models/InspectionTemplate';

interface InspectionTypeSelectorProps {
  inspectionTemplates: IInspectionTemplate[];
  onSelect: (inspectionTemplateId: string) => void;
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

// Icon mapping for inspection types
const getInspectionIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('full') || lowerName.includes('complete') || lowerName.includes('شامل')) {
    return ClipboardCheck;
  }
  if (lowerName.includes('electrical') || lowerName.includes('كهربائي')) {
    return Zap;
  }
  if (lowerName.includes('computer') || lowerName.includes('diagnostic') || lowerName.includes('كمبيوتر')) {
    return Cpu;
  }
  if (lowerName.includes('mechanical') || lowerName.includes('ميكانيكي')) {
    return Wrench;
  }
  if (lowerName.includes('safety') || lowerName.includes('سلامة')) {
    return Shield;
  }
  return Car;
};

// Color mapping for inspection types
const getInspectionColor = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('full') || lowerName.includes('complete') || lowerName.includes('شامل')) {
    return {
      gradient: 'from-purple-500 to-indigo-600',
      bg: 'from-purple-500/10 to-indigo-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-600 dark:text-purple-400',
      icon: 'text-purple-600',
    };
  }
  if (lowerName.includes('electrical') || lowerName.includes('كهربائي')) {
    return {
      gradient: 'from-yellow-500 to-orange-500',
      bg: 'from-yellow-500/10 to-orange-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-600 dark:text-yellow-400',
      icon: 'text-yellow-600',
    };
  }
  if (lowerName.includes('computer') || lowerName.includes('diagnostic') || lowerName.includes('كمبيوتر')) {
    return {
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'from-blue-500/10 to-cyan-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'text-blue-600',
    };
  }
  if (lowerName.includes('mechanical') || lowerName.includes('ميكانيكي')) {
    return {
      gradient: 'from-gray-600 to-gray-800',
      bg: 'from-gray-500/10 to-gray-700/10',
      border: 'border-gray-500/30',
      text: 'text-gray-700 dark:text-gray-300',
      icon: 'text-gray-700',
    };
  }
  return {
    gradient: 'from-green-500 to-emerald-600',
    bg: 'from-green-500/10 to-emerald-500/10',
    border: 'border-green-500/30',
    text: 'text-green-600 dark:text-green-400',
    icon: 'text-green-600',
  };
};

export function InspectionTypeSelector({
  inspectionTemplates,
  onSelect,
  language = 'en'
}: InspectionTypeSelectorProps) {
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);
  const isArabic = language === 'ar';

  const handleSelect = (inspectionTemplateId: string) => {
    setSelectedInspection(inspectionTemplateId);
  };

  const handleContinue = () => {
    if (selectedInspection) {
      onSelect(selectedInspection);
    }
  };

  return (
    <div>
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-8"
      >
        {isArabic ? 'اختر نوع الفحص' : 'Select Inspection Type'}
      </motion.h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
      >
        {inspectionTemplates.map((template) => {
          const isSelected = selectedInspection === template._id?.toString();
          const Icon = getInspectionIcon(template.name);
          const colors = getInspectionColor(template.name);

          return (
            <motion.button
              key={template._id?.toString()}
              onClick={() => handleSelect(template._id?.toString() || '')}
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative p-8 rounded-2xl border-2 text-left transition-all overflow-hidden backdrop-blur-xl ${
                isSelected
                  ? `border-[#F97402] bg-gradient-to-br from-[#F97402]/10 to-[#F13F33]/10 shadow-xl shadow-[#F97402]/20`
                  : `${colors.border} bg-white/80 dark:bg-gray-800/80 hover:bg-gradient-to-br ${colors.bg} hover:shadow-lg`
              }`}
            >
              {/* Animated gradient overlay on select */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-br from-[#F97402]/5 to-[#F13F33]/5 pointer-events-none"
                />
              )}

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-5">
                  {/* Icon with rotation animation */}
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg ${
                      isSelected ? 'shadow-[#F97402]/30' : 'shadow-black/10'
                    }`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Selection indicator */}
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isSelected ? 1 : 0.95,
                      backgroundColor: isSelected ? '#F97402' : 'transparent',
                    }}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
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
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                <h4 className="font-bold text-2xl text-gray-900 dark:text-white mb-3">
                  {template.name}
                </h4>

                {template.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {template.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-br ${colors.bg} border ${colors.border}`}>
                      <span className={`font-medium ${colors.text}`}>
                        {template.vehicleType}
                      </span>
                    </div>
                  </div>
                  {template.items && template.items.length > 0 && (
                    <div className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {template.items.length}
                      </span>{' '}
                      {isArabic ? 'عنصر فحص' : 'items'}
                    </div>
                  )}
                </div>

                {/* Hover gradient line */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F97402] to-[#F13F33]"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <motion.button
          onClick={handleContinue}
          disabled={!selectedInspection}
          whileHover={selectedInspection ? { scale: 1.02 } : {}}
          whileTap={selectedInspection ? { scale: 0.98 } : {}}
          className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center gap-3 shadow-lg ${
            selectedInspection
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
