"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView, AnimatePresence, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import LanguageSwitcher from "@/components/dashboard/LanguageSwitcher";
import {
  Car,
  Users,
  FileText,
  BarChart3,
  Shield,
  Clock,
  Zap,
  CheckCircle2,
  ArrowRight,
  Play,
  Star,
  ChevronDown,
  Globe,
  Smartphone,
  Building2,
  CreditCard,
  Calendar,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from "@/lib/subscription/tiers";

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  }
};

// Feature data with translation keys
const getFeatures = (t: any) => [
  {
    icon: Car,
    titleKey: "marketing.features.vehicle_management.title",
    descriptionKey: "marketing.features.vehicle_management.description",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: FileText,
    titleKey: "marketing.features.smart_invoicing.title",
    descriptionKey: "marketing.features.smart_invoicing.description",
    color: "from-emerald-500 to-green-600"
  },
  {
    icon: Users,
    titleKey: "marketing.features.customer_portal.title",
    descriptionKey: "marketing.features.customer_portal.description",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: BarChart3,
    titleKey: "marketing.features.analytics_dashboard.title",
    descriptionKey: "marketing.features.analytics_dashboard.description",
    color: "from-[#F97402] to-[#F13F33]"
  },
  {
    icon: Calendar,
    titleKey: "marketing.features.appointment_booking.title",
    descriptionKey: "marketing.features.appointment_booking.description",
    color: "from-pink-500 to-rose-600"
  },
  {
    icon: Shield,
    titleKey: "marketing.features.inventory_control.title",
    descriptionKey: "marketing.features.inventory_control.description",
    color: "from-indigo-500 to-indigo-600"
  },
];

const getStats = (t: any) => [
  { value: "500+", labelKey: "marketing.stats.workshops" },
  { value: "50K+", labelKey: "marketing.stats.invoices" },
  { value: "99.9%", labelKey: "marketing.stats.uptime" },
  { value: "24/7", labelKey: "marketing.stats.support" },
];

const getTestimonials = (t: any) => [
  {
    quoteKey: "marketing.testimonials.quote1",
    authorKey: "marketing.testimonials.author1",
    roleKey: "marketing.testimonials.role1",
    avatar: "/avatars/1.jpg"
  },
  {
    quoteKey: "marketing.testimonials.quote2",
    authorKey: "marketing.testimonials.author2",
    roleKey: "marketing.testimonials.role2",
    avatar: "/avatars/2.jpg"
  },
  {
    quoteKey: "marketing.testimonials.quote3",
    authorKey: "marketing.testimonials.author3",
    roleKey: "marketing.testimonials.role3",
    avatar: "/avatars/3.jpg"
  },
];

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  const { t } = useTranslation('common');

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Get translated data
  const features = getFeatures(t);
  const stats = getStats(t);
  const testimonials = getTestimonials(t);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/icon.png"
                alt={t('marketing.header.company_name')}
                width={44}
                height={44}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-contain"
                priority
              />
              <span className="ms-2 sm:ms-3 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                TeraMotors
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                {t('marketing.navigation.features')}
              </a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                {t('marketing.navigation.pricing')}
              </a>
              <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                {t('marketing.navigation.testimonials')}
              </a>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <LanguageSwitcher />
              <ThemeToggle />
              <Link href="#hero">
                <motion.button
                  className="text-gray-700 dark:text-gray-300 font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  {t('marketing.navigation.sign_in')}
                </motion.button>
              </Link>
              <Link href="/register">
                <motion.button
                  className="px-5 py-2.5 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white font-semibold rounded-xl shadow-lg shadow-[#F97402]/25"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('marketing.navigation.start_trial')}
                </motion.button>
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2 sm:gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
            >
              <div className="px-4 py-6 space-y-4">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                >
                  {t('marketing.navigation.features')}
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                >
                  {t('marketing.navigation.pricing')}
                </a>
                <a
                  href="#testimonials"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                >
                  {t('marketing.navigation.testimonials')}
                </a>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                  <Link href="#hero" className="block" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full py-3 text-gray-700 dark:text-gray-300 font-semibold hover:text-gray-900 dark:hover:text-white transition-colors text-center">
                      {t('marketing.navigation.sign_in')}
                    </button>
                  </Link>
                  <Link href="/register" className="block">
                    <button className="w-full py-3 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white font-semibold rounded-xl shadow-lg shadow-[#F97402]/25">
                      {t('marketing.navigation.start_trial')}
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section id="hero" ref={heroRef} className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-orange-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />

        {/* Animated blobs */}
        <motion.div
          className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#F97402]/20 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            style={{ y: heroY, opacity: heroOpacity }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-[#F97402] rounded-full text-sm font-semibold mb-8"
            >
              <Zap className="w-4 h-4 me-2" />
              {t('marketing.hero.zatca_badge')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white leading-tight"
            >
              {t('marketing.hero.title')}
              <span className="block bg-gradient-to-r from-[#F97402] to-[#F13F33] bg-clip-text text-transparent">
                {t('marketing.hero.title_highlight')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4"
            >
              {t('marketing.hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 px-4"
            >
              <Link href="/register" className="w-full sm:w-auto">
                <motion.button
                  className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white font-semibold text-base sm:text-lg rounded-2xl shadow-xl shadow-[#F97402]/25 flex items-center justify-center"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('marketing.hero.cta_start_trial')}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ms-2" />
                </motion.button>
              </Link>
              <motion.button
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold text-base sm:text-lg rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 me-2" />
                {t('marketing.hero.cta_watch_demo')}
              </motion.button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-sm text-gray-500 dark:text-gray-400"
            >
              {t('marketing.hero.trial_info')}
            </motion.p>
          </motion.div>

          {/* Hero Image/Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 sm:mt-16 lg:mt-24 relative px-4"
          >
            <div className="relative mx-auto max-w-5xl">
              <div className="bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-2xl">
                <div className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl overflow-hidden">
                  <div className="relative aspect-[16/9]">
                    <Image
                      src="/Dashboardpreview.png"
                      alt={t('marketing.hero.dashboard_preview_alt')}
                      fill
                      priority
                      sizes="(min-width: 1280px) 960px, (min-width: 768px) 80vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-gray-100 dark:border-gray-800 px-5 py-4">
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t('marketing.hero.dashboard_preview')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('marketing.hero.dashboard_subtitle')}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#F97402] to-[#F13F33] rounded-2xl flex items-center justify-center shadow-lg shadow-[#F97402]/25">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements - Hidden on mobile */}
              <motion.div
                className="hidden lg:block absolute -left-8 top-1/4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-200 dark:border-gray-700"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('marketing.hero.floating_invoice')}</p>
                    <p className="text-xs text-gray-500">{t('marketing.hero.floating_just_now')}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="hidden lg:block absolute -right-8 bottom-1/4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-200 dark:border-gray-700"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('marketing.hero.floating_vehicles')}</p>
                    <p className="text-xs text-gray-500">{t('marketing.hero.floating_this_week')}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-gray-400" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {stats.map((stat, index) => (
                <motion.div key={index} variants={fadeInUp} className="text-center">
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#F97402] to-[#F13F33] bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
                    {t(stat.labelKey)}
                  </p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 md:py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <motion.p variants={fadeInUp} className="text-[#F97402] font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              {t('marketing.features.section_label')}
            </motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              {t('marketing.features.section_title')}
              <span className="block">{t('marketing.features.section_title_highlight')}</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              {t('marketing.features.section_subtitle')}
            </motion.p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="group bg-white dark:bg-gray-800/50 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-xl dark:hover:shadow-lg dark:hover:shadow-gray-900/50"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t(feature.descriptionKey)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 md:py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <motion.p variants={fadeInUp} className="text-[#F97402] font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              {t('marketing.pricing.section_label')}
            </motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              {t('marketing.pricing.section_title')}
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 px-4">
              {t('marketing.pricing.section_subtitle')}
            </motion.p>

            {/* Billing Toggle */}
            <motion.div variants={fadeInUp} className="mt-6 sm:mt-8 flex items-center justify-center px-4">
              <div className="flex items-center bg-white dark:bg-gray-700 rounded-xl p-1 shadow-lg">
                <button
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  {t('marketing.pricing.monthly')}
                </button>
                <button
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center ${
                    billingCycle === 'annual'
                      ? 'bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                  onClick={() => setBillingCycle('annual')}
                >
                  {t('marketing.pricing.annual')}
                  <span className="ms-1 sm:ms-2 px-1.5 sm:px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    {t('marketing.pricing.save_discount')}
                  </span>
                </button>
              </div>
            </motion.div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(Object.entries(SUBSCRIPTION_TIERS) as [SubscriptionTier, typeof SUBSCRIPTION_TIERS.free][]).map(
                ([tier, config], index) => {
                  const price = billingCycle === 'annual' ? config.pricing.annual : config.pricing.monthly;

                  return (
                    <motion.div
                      key={tier}
                      variants={scaleIn}
                      className={`relative bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 ${
                        config.popular
                          ? 'border-[#F97402] shadow-xl shadow-[#F97402]/10 dark:shadow-[#F97402]/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {config.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <span className="px-4 py-1.5 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white text-xs font-bold rounded-full shadow-lg">
                            {t('marketing.pricing.most_popular')}
                          </span>
                        </div>
                      )}

                      <div className={`${config.popular ? 'pt-4' : ''}`}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {t(config.name)}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {t(config.description)}
                        </p>

                        <div className="mt-6">
                          {price === -1 ? (
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                              {t('marketing.pricing.custom')}
                            </p>
                          ) : price === 0 ? (
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                              {t('marketing.pricing.free')}
                            </p>
                          ) : (
                            <div className="flex items-baseline">
                              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                SAR {billingCycle === 'annual' ? Math.round(price / 12) : price}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 ms-1">/mo</span>
                            </div>
                          )}
                        </div>

                        <ul className="mt-6 space-y-3">
                          {config.features.slice(0, 5).map((feature, i) => (
                            <li key={i} className="flex items-start text-sm">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 me-2 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-300">{t(feature.name)}</span>
                            </li>
                          ))}
                        </ul>

                        <Link href="/register" className="block mt-8">
                          <motion.button
                            className={`w-full py-3 px-4 font-semibold rounded-xl transition-all ${
                              config.popular
                                ? 'bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {tier === 'enterprise' ? t('marketing.pricing.contact_sales') : t('marketing.pricing.get_started')}
                          </motion.button>
                        </Link>
                      </div>
                    </motion.div>
                  );
                }
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 sm:py-20 md:py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12 sm:mb-16">
            <motion.p variants={fadeInUp} className="text-[#F97402] font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              {t('marketing.testimonials.section_label')}
            </motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              {t('marketing.testimonials.section_title')}
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    "{t(testimonial.quoteKey)}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full" />
                    <div className="ms-4">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {t(testimonial.authorKey)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t(testimonial.roleKey)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-[#063479] to-[#052a5f] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              {t('marketing.cta.title')}
              <span className="block">{t('marketing.cta.title_highlight')}</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              {t('marketing.cta.description')}
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
              <Link href="/register" className="w-full sm:w-auto">
                <motion.button
                  className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white font-semibold text-base sm:text-lg rounded-2xl shadow-xl flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('marketing.cta.cta_start_trial')}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ms-2" />
                </motion.button>
              </Link>
              <motion.button
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/10 text-white font-semibold text-base sm:text-lg rounded-2xl border border-white/20 backdrop-blur-sm flex items-center justify-center"
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 me-2" />
                {t('marketing.cta.contact_sales')}
              </motion.button>
            </motion.div>
            <motion.p variants={fadeInUp} className="mt-4 sm:mt-6 text-xs sm:text-sm text-white/60">
              {t('marketing.cta.no_credit_card')}
            </motion.p>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 bg-gray-900 dark:bg-gray-950 text-gray-400 dark:text-gray-300 border-t border-gray-800 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div>
              <div className="flex items-center mb-6">
                <Image
                  src="/icon.png"
                  alt={t('marketing.header.company_name')}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-2xl object-contain"
                />
                <span className="ms-3 text-xl font-bold text-white">TeraMotors</span>
              </div>
              <p className="text-sm dark:text-gray-300">
                {t('marketing.footer.description')}
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 dark:text-white">{t('marketing.footer.product')}</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="dark:text-gray-300 dark:hover:text-[#F97402] hover:text-white transition-colors">{t('marketing.footer.features')}</a></li>
                <li><a href="#pricing" className="dark:text-gray-300 dark:hover:text-[#F97402] hover:text-white transition-colors">{t('marketing.footer.pricing')}</a></li>
                <li><a href="#" className="dark:text-gray-300 dark:hover:text-[#F97402] hover:text-white transition-colors">{t('marketing.footer.integrations')}</a></li>
                <li><a href="#" className="dark:text-gray-300 dark:hover:text-[#F9-7402] hover:text-white transition-colors">{t('marketing.footer.api')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 dark:text-white">{t('marketing.footer.resources')}</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="dark:text-gray-300 dark:hover:text-[#F97402] hover:text-white transition-colors">{t('marketing.footer.documentation')}</a></li>
                <li><a href="#" className="dark:text-gray-300 dark:hover:text-[#F97402] hover:text-white transition-colors">{t('marketing.footer.blog')}</a></li>
                <li><a href="#" className="dark:text-gray-300 dark:hover:text-[#F97402] hover:text-white transition-colors">{t('marketing.footer.support')}</a></li>
                <li><a href="#" className="dark:text-gray-300 dark:hover:text-[#F97402] hover:text-white transition-colors">{t('marketing.footer.status')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 dark:text-white">{t('marketing.footer.company')}</h4>
              <ul className="space-y-.3 text-sm">
                <li><a href="#" className="dark:text-gray-300 dark:hover:text-[#F97402] hover:text-white transition-colors">{t('marketing.footer.about')}</a></li>
                <li><a href="#" className="dark:text-gray-300 dark:hover:text-[#F97402] hover:text-white transition-colors">{t('marketing.footer.careers')}</a></li>
                <li><a href="#" className="dark:text-gray-300 dark:hover:text-[#F97402] hover:text-white transition-colors">{t('marketing.footer.privacy')}</a></li>
                <li><a href="#" className="dark:text-gray-300 dark:hover:text-[#F97402] hover:text-white transition-colors">{t('marketing.footer.terms')}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 dark:border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm">
              © {new Date().getFullYear()} TeraMotors. {t('marketing.footer.copyright')}
            </p>
            <p className="text-sm mt-4 md:mt-0">
              {t('marketing.footer.made_in')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
