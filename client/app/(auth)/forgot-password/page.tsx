'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  Headphones,
  Clock
} from 'lucide-react';

const highlights = [
  { icon: ShieldCheck, key: 'auth.forgot_highlight_secure_title', descKey: 'auth.forgot_highlight_secure_desc' },
  { icon: Headphones, key: 'auth.forgot_highlight_support_title', descKey: 'auth.forgot_highlight_support_desc' },
  { icon: Clock, key: 'auth.forgot_highlight_fast_title', descKey: 'auth.forgot_highlight_fast_desc' }
];

export default function ForgotPasswordPage() {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        throw new Error();
      }

      setSubmittedEmail(email);
      setSent(true);
    } catch (err) {
      setError(t('auth.reset_link_error'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#041E42] to-[#052a5f] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.04%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#F97402]/20 to-transparent rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-10 -left-10 w-[420px] h-[420px] bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-10 items-center">
        <motion.div
          className="hidden lg:flex flex-col gap-8 bg-white/5 border border-white/10 rounded-3xl p-10 text-white backdrop-blur-2xl shadow-2xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <Image
                src="/icon.png"
                alt="TeraMotors Logo"
                width={56}
                height={56}
                className="w-12 h-12 object-contain rounded-xl"
                priority
              />
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-white/70">{t('landing_missing.workshop_portal')}</p>
              <p className="text-xl font-semibold">TeraMotors</p>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">
              {t('auth.reset_access_heading')}
            </h2>
            <p className="text-white/80 leading-relaxed">
              {t('auth.reset_access_description')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {highlights.map(({ icon: Icon, key, descKey }) => (
              <div key={key} className="bg-white/5 rounded-2xl border border-white/10 p-4">
                <Icon className="w-6 h-6 text-white mb-3" />
                <p className="font-semibold mb-1">{t(key)}</p>
                <p className="text-sm text-white/70">{t(descKey)}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/60">{t('auth.support_stat_label')}</p>
              <p className="text-2xl font-semibold">{t('auth.support_stat_value')}</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div>
              <p className="text-xs uppercase tracking-widest text-white/60">{t('auth.response_stat_label')}</p>
              <p className="text-2xl font-semibold">{t('auth.response_stat_value')}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/30 dark:border-gray-800 relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute top-6 right-6">
            <ThemeToggle />
          </div>

          <Link
            href="/login"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 me-2" />
            {t('auth.back_to_login')}
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#F97402] to-[#F13F33] rounded-2xl flex items-center justify-center shadow-lg shadow-[#F97402]/30">
              <Image
                src="/icon.png"
                alt="TeraMotors Logo"
                width={56}
                height={56}
                className="w-12 h-12 object-contain rounded-xl"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('auth.forgot_your_password')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {t('auth.forgot_password_prompt')}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/40 dark:border-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {sent ? (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('auth.check_inbox_title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('auth.check_inbox_description', { email: submittedEmail || t('auth.email') })}
                </p>
              </div>

              <Link
                href="/login"
                className="w-full bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-xl hover:shadow-[#F97402]/30 transition-all duration-300 flex items-center justify-center"
              >
                {t('auth.cta_return_login')}
              </Link>

              <p className="text-center text-sm text-gray-500 dark:text-gray-300">
                {t('auth.need_help')}{" "}
                <a href="tel:+966553022102" className="font-semibold text-[#F97402] hover:underline">
                  {t('auth.contact_support')}
                </a>
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 bg-white/80 dark:bg-gray-900/70"
                    placeholder={t('ui.enter_your_email_address')}
                  />
                </div>

                <button
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-xl hover:shadow-[#F97402]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      {t('auth.sending')}
                    </div>
                  ) : (
                    t('auth.send_reset_link')
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-300 space-y-1">
                <p>{t('auth.need_help')}</p>
                <a
                  href="tel:+966553022102"
                  className="font-semibold text-[#063479] dark:text-[#F97402] hover:underline inline-flex items-center gap-1"
                >
                  {t('auth.contact_support')}
                </a>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
