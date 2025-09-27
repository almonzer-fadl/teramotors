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
    <nav aria-label={t('ui.breadcrumb')} className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link 
            href="/dashboard" 
            className="flex items-center text-gray-500 hover:text-[#F13F33] transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
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
              <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              <Link 
                href={href} 
                className={`${
                  isLast 
                    ? 'font-semibold text-[#063479]' 
                    : 'text-gray-500 hover:text-[#F13F33] transition-colors'
                }`}
              >
                {title}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
