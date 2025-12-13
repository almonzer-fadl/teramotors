'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Shield } from 'lucide-react';
import { fadeInUp } from '@/lib/dashboard-animations';
import { useSession } from '@/lib/hooks/useSession';
import { signOut } from '@/lib/simple-auth-client';
import { roleDisplayNames } from '@/lib/roles';
import { useTranslation } from 'react-i18next';

export default function AccountSettings() {
  const { t, i18n } = useTranslation('common');
  const { user } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isRTL = i18n.language === 'ar';

  const handleSignOut = async () => {
    if (confirm(t('settings.account.sign_out_confirm', 'Are you sure you want to sign out?'))) {
      setIsSigningOut(true);
      await signOut();
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Account Info */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center me-4">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.account.title', 'Account Information')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.account.description', 'Your account details and settings')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.account.name', 'Name')}</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.account.email', 'Email')}</p>
              <p className="font-medium text-gray-900 dark:text-white">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.account.role', 'Role')}</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {roleDisplayNames[user?.role as keyof typeof roleDisplayNames] || user?.role}
              </p>
            </div>
            <Shield className="w-5 h-5 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Sign Out Section */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-800/30 border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center me-4">
            <LogOut className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.account.sign_out', 'Sign Out')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('settings.account.sign_out_description', 'End your current session')}</p>
          </div>
        </div>

        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-6">
          <p className="text-sm text-red-800 dark:text-red-300">
            {t('settings.account.sign_out_warning', "Signing out will end your current session. You'll need to log in again to access your account.")}
          </p>
        </div>

        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSigningOut ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2"></div>
              {t('settings.account.signing_out', 'Signing Out...')}
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 me-2" />
              {t('settings.account.sign_out', 'Sign Out')}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
