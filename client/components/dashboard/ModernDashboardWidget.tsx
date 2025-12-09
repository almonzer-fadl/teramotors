"use client";

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Users,
  Car,
  Package,
  BarChart3,
  ClipboardList,
  FileText,
  CreditCard,
  Search,
  Calendar,
  Clock,
  Bell,
  TrendingUp
} from 'lucide-react';

interface DashboardTile {
  title: string;
  titleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  count: number | string;
  route: string;
}

interface ModernDashboardWidgetProps {
  tiles: DashboardTile[];
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

// Color mapping to gradients for premium look
const colorToGradient: Record<string, string> = {
  'bg-blue-600': 'from-blue-500 via-blue-600 to-blue-700',
  'bg-pink-500': 'from-pink-400 via-pink-500 to-pink-600',
  'bg-green-600': 'from-emerald-500 via-green-600 to-green-700',
  'bg-purple-600': 'from-purple-500 via-purple-600 to-purple-700',
  'bg-indigo-600': 'from-indigo-500 via-indigo-600 to-indigo-700',
  'bg-blue-700': 'from-blue-600 via-blue-700 to-blue-800',
  'bg-orange-500': 'from-orange-400 via-orange-500 to-orange-600',
  'bg-amber-600': 'from-amber-500 via-amber-600 to-amber-700',
  'bg-yellow-600': 'from-yellow-500 via-yellow-600 to-yellow-700',
  'bg-blue-800': 'from-blue-700 via-blue-800 to-blue-900',
  'bg-green-500': 'from-green-400 via-green-500 to-green-600',
  'bg-gray-600': 'from-gray-500 via-gray-600 to-gray-700',
};

const ModernDashboardWidget: React.FC<ModernDashboardWidgetProps> = ({
  tiles
}) => {
  const { t, i18n } = useTranslation("common");
  const isArabic = i18n.language === 'ar';

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {tiles.map((tile, index) => {
        const Icon = tile.icon;
        const gradientClass = colorToGradient[tile.color] || 'from-gray-500 via-gray-600 to-gray-700';

        return (
          <motion.div
            key={index}
            variants={itemVariants}
          >
            <Link
              href={tile.route}
              className="group flex flex-col items-center justify-center"
            >
              <motion.div
                className={`
                  relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32
                  bg-gradient-to-br ${gradientClass}
                  rounded-3xl flex items-center justify-center mb-3
                  shadow-lg
                  overflow-hidden
                `}
                whileHover={{
                  scale: 1.08,
                  rotate: 2,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 17
                  }
                }}
                whileTap={{
                  scale: 0.95,
                  rotate: -1
                }}
              >
                {/* Shine overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  initial={{ boxShadow: "0 0 0 0 rgba(255,255,255,0)" }}
                  whileHover={{
                    boxShadow: "0 0 30px 5px rgba(255,255,255,0.3)",
                    transition: { duration: 0.3 }
                  }}
                />

                <Icon className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white drop-shadow-lg relative z-10" />
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
              >
                <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                  {isArabic ? tile.title : tile.titleEn}
                </span>
              </motion.div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default ModernDashboardWidget;
