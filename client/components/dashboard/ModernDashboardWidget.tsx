"use client";

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion, type Variants } from 'framer-motion';

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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    }
  }
};

const itemVariants: Variants = {
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
      stiffness: 300,
      damping: 25
    }
  }
};

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
      className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4"
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
              className="group flex flex-col items-center justify-center text-center"
            >
              <motion.div
                className={`
                  relative w-20 h-20 sm:w-24 sm:h-24
                  flex items-center justify-center
                  bg-gradient-to-br ${gradientClass}
                  border border-white/20
                  rounded-2xl
                  shadow-lg
                  overflow-hidden
                `}
                whileHover={{
                  scale: 1.08,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 15
                  }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
                <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg relative z-10" />
              </motion.div>

              <div className="mt-2 w-full">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200 truncate">
                  {isArabic ? tile.title : tile.titleEn}
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default ModernDashboardWidget;
