"use client";

import { signIn } from "@/lib/simple-auth-client";
import Link from "next/link";
import Image from "next/image";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

function LoginForm() {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const registered = searchParams.get("registered");
  const router = useRouter();

  // Show success message if just registered
  useEffect(() => {
    if (registered === "true") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [registered]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn(email, password);

      if (result.success) {
        // Redirect SUPER_ADMIN to admin panel, others to dashboard or callback
        const redirectUrl = result.user?.role === 'SUPER_ADMIN'
          ? '/admin'
          : callbackUrl;
        router.push(redirectUrl);
      } else {
        setError(result.error || t('ui.invalid_email_or_password'));
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#063479] to-[#052a5f] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#F97402]/20 to-transparent rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.25, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <motion.div
        className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-[#F13F33]/10 to-transparent rounded-full blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/"
          className="absolute -top-16 left-0 flex items-center text-white/80 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 me-2 group-hover:-translate-x-1 transition-transform" />
          {t('landing_missing.back_to_home')}
        </Link>

        <motion.div
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700 relative"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Theme Toggle */}
          <div className="absolute top-6 right-6">
            <ThemeToggle />
          </div>
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-[#F97402] to-[#F13F33] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#F97402]/25"
              variants={itemVariants}
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Image
                src="/icon.png"
                alt="TeraMotors Logo"
                width={64}
                height={64}
                className="w-14 h-14 object-contain rounded-xl"
                priority
              />
            </motion.div>
            <motion.h1
              className="text-3xl font-bold text-gray-900 dark:text-white mb-3"
              variants={itemVariants}
            >
              {t('landing_missing.workshop_portal')}
            </motion.h1>
            <motion.p
              className="text-gray-600 dark:text-gray-300 text-base"
              variants={itemVariants}
            >
              {t('landing_missing.sign_in_to_manage')}
            </motion.p>
          </motion.div>

          {/* Success Message */}
          <AnimatePresence mode="wait">
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-green-50/90 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-2xl text-green-700 dark:text-green-300 text-sm backdrop-blur-sm flex items-center"
              >
                <CheckCircle2 className="w-5 h-5 me-3 text-green-500" />
                <span>{t('auth.workshop_created_success')}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mb-6 p-4 bg-red-50/90 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-2xl text-red-700 dark:text-red-300 text-sm backdrop-blur-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-700 dark:text-white">
                {t('landing_missing.email_address')}
              </label>
              <div className="relative group">
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-800 backdrop-blur-sm group-hover:border-gray-300 dark:group-hover:border-gray-600"
                  placeholder={t('ui.enter_your_email')}
                />
              </div>
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-semibold text-gray-700 dark:text-white">
                {t('landing_missing.password')}
              </label>
              <div className="relative group">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-4 pr-12 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-800 backdrop-blur-sm group-hover:border-gray-300 dark:group-hover:border-gray-600"
                  placeholder={t('ui.enter_your_password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white py-4 px-6 rounded-2xl font-semibold shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 me-2 animate-spin" />
                  {t('landing_missing.signing_in')}
                </div>
              ) : (
                t('ui.access_workshop_portal')
              )}
            </motion.button>
          </form>

          {/* Links */}
          <motion.div
            className="mt-8 text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/forgot-password"
              className="text-[#063479] dark:text-gray-300 hover:text-[#F97402] dark:hover:text-[#F97402] font-semibold text-sm transition-colors duration-300 block"
            >
              {t('landing_missing.forgot_your_password')}
            </Link>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                            {t('auth.no_account_yet')}
                          </p>
                          <Link href="/register">
                            <motion.span
                              className="inline-flex items-center px-5 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-sm rounded-xl transition-all duration-300"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Sparkles className="w-4 h-4 me-2 text-[#F97402]" />
                              {t('auth.create_workshop_cta')}
                            </motion.span>
                          </Link>            </div>
          </motion.div>
        </motion.div>

        {/* Features */}
        <motion.div
          className="mt-8 grid grid-cols-3 gap-4 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { value: t('auth.stats.workshops_value'), label: t('auth.stats.workshops') },
            { value: t('auth.stats.uptime_value'), label: t('auth.stats.uptime') },
            { value: t('auth.stats.support_value'), label: t('auth.stats.support') },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-white/80"
            >
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#063479] to-[#052a5f] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
          <motion.div
            className="w-12 h-12 border-4 border-white/20 border-t-[#F97402] rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
