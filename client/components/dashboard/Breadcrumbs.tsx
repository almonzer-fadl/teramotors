'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Breadcrumbs = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment);
  const { t } = useTranslation();

  // Don't show breadcrumbs on the dashboard index
  if (pathSegments.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label={t('ui.breadcrumb')}
      className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 sm:px-6 lg:px-8 py-4"
    >
      <ol className="flex items-center space-x-1 text-sm">
        <li>
          <Link
            href="/dashboard"
            className="flex items-center px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-[#F97402] dark:hover:text-[#F97402] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <Home className="w-4 h-4 me-1.5" />
            {t("dashboard.title")}
          </Link>
        </li>
        {pathSegments.map((segment, index) => {
          const href = '/' + pathSegments.slice(0, index + 1).join('/');
          const isLast = index === pathSegments.length - 1;
          // Capitalize the first letter of the segment
          const title = segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <li key={href} className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600 mx-1" />
              {isLast ? (
                <span className="px-3 py-1.5 rounded-lg font-semibold text-[#F97402] bg-[#F97402]/10 dark:bg-[#F97402]/20">
                  {title}
                </span>
              ) : (
                <Link
                  href={href}
                  className="px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-[#F97402] dark:hover:text-[#F97402] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  {title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
