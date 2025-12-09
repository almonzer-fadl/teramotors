'use client';

import { useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomerSession } from '@/lib/hooks/useCustomerSession';
import { Loader2, User, Car, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import LanguageSwitcher from '@/components/dashboard/LanguageSwitcher';

function PortalLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useCustomerSession();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { t } = useTranslation(['dashboard']);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/portal/${params.slug}/login`);
    }
  }, [isLoading, isAuthenticated, router, params.slug]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-[#F97402]" />
      </div>
    );
  }

  const navItems = [
    { href: `/portal/${params.slug}/profile`, label: t('profile.title'), icon: User },
    { href: `/portal/${params.slug}/vehicles`, label: t('vehicles.title'), icon: Car },
    { href: `/portal/${params.slug}/appointments`, label: t('appointments.title'), icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-100/50 dark:bg-gray-900/90 text-gray-900 dark:text-white p-8">
        <div className="flex justify-end gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
        </div>
        <main className="flex-1 flex items-center justify-center">
          {children}
        </main>
    </div>
  );
}

export default PortalLayout;
