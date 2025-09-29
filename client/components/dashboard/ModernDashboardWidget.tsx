"use client";

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
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

const ModernDashboardWidget: React.FC<ModernDashboardWidgetProps> = ({ 
  tiles
}) => {
  const { t, i18n } = useTranslation("common");
  const isArabic = i18n.language === 'ar';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      {tiles.map((tile, index) => {
        const Icon = tile.icon;
        return (
          <Link
            key={index}
            href={tile.route}
            className="group flex flex-col items-center justify-center p-6 hover:scale-105 transition-transform duration-300"
          >
            <div className={`w-32 h-32 ${tile.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-3`}>
              <Icon className="w-16 h-16 text-white" />
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                {isArabic ? tile.title : tile.titleEn}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default ModernDashboardWidget;
