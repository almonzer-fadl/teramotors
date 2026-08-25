"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import {
  Wrench,
  Car,
  Phone,
  MapPin,
  CheckCircle,
  Star,
  Award,
  Mail,
  Globe,
  Menu,
  X,
  User,
  Cog,
  Disc,
  Gauge,
  Zap,
  Snowflake,
  Droplets,
  ShieldCheck,
  MessageCircle
} from "lucide-react";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { LogoLoop } from "@/components/LogoLoop";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const WHATSAPP_URL = "https://wa.me/601167709123";
const WHATSAPP_PHONE = "+60 11-6770 9123";

// Animation Variants
const fadeInUp: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const slideInLeft: Variants = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.7 } }
};

const slideInRight: Variants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.7 } }
};

const floatingAnimation: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
};

const scaleInAnimation: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
};

// Counter Component for Stats
function Counter({ end }: { end: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const duration = 2;
    const increment = end / (duration * 60);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [inView, end]);

  return <div ref={ref}>{count}+</div>;
}

function TestimonialImage({ src, alt, className }: { src: string, alt: string, className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.6 }}
      className={`group relative overflow-hidden rounded-3xl shadow-lg dark:shadow-gray-900/50 hover:shadow-2xl dark:hover:shadow-gray-900/70 transition-all duration-300 hover:-translate-y-1 hover:scale-105 ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={500}
        height={500}
        className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-110"
      />
    </motion.div>
  );
}

function LanguageSwitch() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">{i18n.language === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
}

export default function LandingPage() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const companyLogos = [
    { src: "/logos/City-ambulance.svg", alt: "City Ambulance", width: 120, height: 40 },
    { src: "/logos/1.png", alt: "Partner Company", width: 120, height: 40 },
    { src: "/logos/2.png", alt: "Sweater SA", width: 120, height: 40 },
    { src: "/logos/3.jpeg", alt: "TeraVisions", width: 120, height: 40 },
    { src: "/logos/4.jpg", alt: "University of Dar es Salaam", width: 120, height: 40 }
  ];

  const leftTestimonial = {
    src: '/Testimonials/2.png',
    alt: t('landing_missing.testimonial_2'),
    className: 'w-full max-w-md'
  };

  const rightTopTestimonial = {
    src: '/Testimonials/1.png',
    alt: t('landing_missing.testimonial_1'),
    className: 'w-full'
  };

  const rightBottomTestimonials = [
    {
      src: '/Testimonials/3.png',
      alt: t('landing_missing.testimonial_3'),
      className: 'w-full'
    },
    {
      src: '/Testimonials/4.png',
      alt: t('landing.testimonials.alt_4'),
      className: 'w-full'
    }
  ];

  const values = [
    t("landing.about.values.honesty"),
    t("landing.about.values.quality"),
    t("landing.about.values.warranty"),
    t("landing.about.values.convenience")
  ];

  const services = [
    { key: 'engine_repair', icon: Cog },
    { key: 'brake_service', icon: Disc },
    { key: 'transmission', icon: Gauge },
    { key: 'electrical', icon: Zap },
    { key: 'ac_heating', icon: Snowflake },
    { key: 'suspension', icon: Car },
    { key: 'oil_change', icon: Droplets },
    { key: 'inspection', icon: ShieldCheck }
  ];

  const navLinks = [
    { href: '#services', label: t("landing.services.title") },
    { href: '#about', label: t("landing.about.title") },
    { href: '#contact', label: t("landing.contact.title") }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-white dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm dark:shadow-gray-800/50 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center">
                <Image
                  src="/tenant-logos/teramotors-logo-transparent.png"
                  alt="TeraMotor Logo"
                  width={56}
                  height={56}
                  className="w-12 h-12 sm:w-14 sm:h-14 me-2 sm:me-3 object-contain"
                />
                <div className="flex flex-col">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#063479] dark:text-white drop-shadow-sm font-logo" style={{ letterSpacing: '0.04em' }}>
                    Tera
                    <span className="text-[#2563EB] dark:text-[#60A5FA]">Motor</span>
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-[#063479] dark:text-gray-300 bg-blue-50 dark:bg-gray-800 rounded px-2 py-0.5 mt-1 self-start shadow-sm" style={{ letterSpacing: '0.15em' }}>
                    {t('landing.header.auto_repair')}
                  </span>
                </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-gray-700 dark:text-gray-300 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors font-medium">
                  {link.label}
                </a>
              ))}
              <Link href="/portal/teramotors-default/login" className="text-gray-700 dark:text-gray-300 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors flex items-center gap-1 font-medium">
                {t('landing.header.customer_portal')}
              </Link>
              <LanguageSwitch />
              <ThemeToggle />
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#063479] text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                <MessageCircle className="w-4 h-4" />
                {WHATSAPP_PHONE}
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <motion.div
          initial={false}
          animate={{ height: mobileMenuOpen ? 'auto' : 0 }}
          className="md:hidden overflow-hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-700 dark:text-gray-300 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/portal/teramotors-default/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-gray-700 dark:text-gray-300 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors font-medium"
            >
              {t('landing.header.customer_portal')}
            </Link>
            <div className="py-2">
              <LanguageSwitch />
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#2563EB] to-[#063479] text-white rounded-xl font-semibold transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              {WHATSAPP_PHONE}
            </a>
          </div>
        </motion.div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#041E42] via-[#063479] to-[#0A4DD8] dark:from-slate-950 dark:via-gray-900 dark:to-black text-white py-16 sm:py-20 md:py-28">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-sky-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/15 to-transparent rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8">
              <motion.div
                className="space-y-4 sm:space-y-6"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
              >
                <motion.div
                  variants={fadeInUp}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs sm:text-sm font-medium backdrop-blur-sm"
                >
                  <Wrench className="w-3 h-3 sm:w-4 sm:h-4 me-2" />
                  {t('landing_missing.professional_auto_repair')}
                </motion.div>
                <motion.h1
                  variants={fadeInUp}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent"
                >
                  {t("landing.hero.title")}
                </motion.h1>
                <motion.p variants={fadeInUp} className="text-base sm:text-lg md:text-xl text-sky-100 leading-relaxed max-w-lg">
                  {t("landing.hero.subtitle")}
                </motion.p>
                <motion.p variants={fadeInUp} className="text-sm sm:text-base md:text-lg text-sky-200/80 leading-relaxed max-w-xl">
                  {t("landing.hero.description")}
                </motion.p>
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <motion.a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-[#063479] font-bold rounded-2xl hover:shadow-2xl hover:shadow-sky-400/25 transition-all duration-300 hover:-translate-y-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle className="w-5 h-5 me-2 group-hover:scale-110 transition-transform" />
                  {t("landing.hero.call_now")}
                </motion.a>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/portal/teramotors-default/login"
                    className="group relative inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                  >
                    <User className="w-5 h-5 me-2 group-hover:scale-110 transition-transform" />
                    {t('landing.header.customer_portal')}
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              className="relative mt-8 lg:mt-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
                <div className="relative text-center">
                  <motion.div
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-sky-400 to-[#063479] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg shadow-sky-500/30"
                    variants={floatingAnimation}
                    animate="animate"
                  >
                    <Car className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-4">{t('landing_missing.professional_service')}</h3>
                  <p className="text-sky-100 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg">{t('landing_missing.trusted_by_thousands')}</p>

                  <motion.div
                    className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    <motion.div
                      variants={scaleInAnimation}
                      className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 sm:p-4 md:p-6"
                    >
                      <div className="text-2xl sm:text-2xl md:text-3xl font-bold text-white">
                        <Counter end={15} />
                      </div>
                      <div className="text-xs sm:text-sm text-sky-200">{t('landing_missing.years_experience')}</div>
                    </motion.div>
                    <motion.div
                      variants={scaleInAnimation}
                      className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 sm:p-4 md:p-6"
                    >
                      <div className="text-2xl sm:text-2xl md:text-3xl font-bold text-white">{t('landing.hero.satisfaction_value')}</div>
                      <div className="text-xs sm:text-sm text-sky-200">{t('landing_missing.satisfaction')}</div>
                    </motion.div>
                    <motion.div
                      variants={scaleInAnimation}
                      className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 sm:p-4 md:p-6"
                    >
                      <div className="text-2xl sm:text-2xl md:text-3xl font-bold text-white">{t('landing.hero.support_value')}</div>
                      <div className="text-xs sm:text-sm text-sky-200">{t('landing_missing.support_24_7')}</div>
                    </motion.div>
                    <motion.div
                      variants={scaleInAnimation}
                      className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 sm:p-4 md:p-6"
                    >
                      <div className="text-2xl sm:text-2xl md:text-3xl font-bold text-white">
                        <Counter end={15000} />
                      </div>
                      <div className="text-xs sm:text-sm text-sky-200">{t('landing_missing.happy_customers')}</div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-b from-white to-sky-50/60 dark:from-gray-900 dark:to-gray-950 transition-colors">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14 sm:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-[#2563EB] dark:text-sky-300 text-sm font-medium mb-6"
              variants={floatingAnimation}
              animate="animate"
            >
              <Award className="w-4 h-4 me-2" />
              {t('landing_missing.our_services')}
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-[#063479] to-[#2563EB] bg-clip-text text-transparent">
              {t("landing.services.title")}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t("landing.services.subtitle")}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {services.map(({ key, icon: Icon }) => {
              const serviceTitle = t(`landing.services.${key}.title`);
              const serviceDescription = t(`landing.services.${key}.description`);
              return (
                <motion.div
                  key={key}
                  variants={staggerItem}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-[#063479]/10 dark:from-blue-500/20 dark:to-[#063479]/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <motion.div
                    className="relative bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-lg dark:shadow-gray-900/50 hover:shadow-2xl dark:hover:shadow-gray-900/70 transition-all duration-500 border border-gray-100 dark:border-gray-700 h-full flex flex-col"
                    whileHover={{ scale: 1.02, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-[#2563EB] to-[#063479] rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-[#2563EB] dark:group-hover:text-sky-300 transition-colors">
                      {serviceTitle}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                      {serviceDescription}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Company Logos Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{t('landing_missing.trusted_by_leading_organizations')}</h2>
          </div>
        </div>
        <div className="relative">
          <LogoLoop
            logos={companyLogos}
            speed={60}
            direction="left"
            logoHeight={80}
            gap={64}
            pauseOnHover={true}
            fadeOut={false}
            scaleOnHover={false}
          />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={slideInLeft}
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-[#063479] to-[#2563EB] bg-clip-text text-transparent">
                {t("landing.about.title")}
              </h2>
              <h3 className="text-2xl font-semibold text-[#2563EB] dark:text-sky-300 mb-6">
                {t("landing.about.subtitle")}
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                {t("landing.about.description")}
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                {t("landing.about.mission")}
              </p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-sky-50 to-blue-50/50 dark:from-gray-800 dark:to-gray-800/50 rounded-3xl p-8 shadow-lg dark:shadow-gray-900/50 border border-blue-100 dark:border-gray-700"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={slideInRight}
            >
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('landing_missing.why_choose_us')}
              </h3>
              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3"
                    variants={staggerItem}
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-[#2563EB] to-[#063479] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{value}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-sky-50/50 to-white dark:from-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-transparent dark:from-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[#063479]/10 to-transparent dark:from-[#063479]/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-[#2563EB] dark:text-sky-300 text-sm font-medium mb-6"
              variants={floatingAnimation}
              animate="animate"
            >
              <Star className="w-4 h-4 me-2" />
              {t('landing_missing.trusted_by_thousands')}
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 bg-gradient-to-r from-[#063479] to-[#2563EB] bg-clip-text text-transparent">
              {t("landing.testimonials.title")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t("landing.testimonials.subtitle")}
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <motion.div
              className="flex-shrink-0 w-full lg:w-2/5"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <TestimonialImage
                src={leftTestimonial.src}
                alt={leftTestimonial.alt}
                className={`${leftTestimonial.className} h-full`}
              />
            </motion.div>

            <motion.div
              className="flex-1 w-full"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div variants={staggerItem}>
                <TestimonialImage
                  src={rightTopTestimonial.src}
                  alt={rightTopTestimonial.alt}
                  className={`${rightTopTestimonial.className} mb-4`}
                />
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rightBottomTestimonials.map((image, index) => (
                  <motion.div key={index} variants={staggerItem}>
                    <TestimonialImage
                      src={image.src}
                      alt={image.alt}
                      className={image.className}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#041E42] via-[#063479] to-[#0A4DD8] dark:from-gray-900 dark:via-gray-950 dark:to-gray-950 text-white overflow-hidden transition-colors">

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {t("landing.contact.title")}
          </motion.h2>
          <motion.p
            className="text-lg text-sky-100 dark:text-sky-300 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {t("landing.contact.subtitle")}
          </motion.p>

          {/* Contact Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* WhatsApp Card */}
            <motion.a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10 dark:border-gray-700 hover:bg-white/10 dark:hover:bg-gray-700/50 hover:border-white/20 dark:hover:border-gray-600 transition-all duration-300"
              variants={staggerItem}
              whileHover={{ scale: 1.05, y: -4 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-[#063479] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{t('landing_missing.call_us')}</h4>
                  <p className="text-sky-200 dark:text-sky-300 text-xs">{t("landing.contact.phone")}</p>
                </div>
              </div>
            </motion.a>

            {/* Email Card */}
            <motion.a
              href="mailto:info@teramotors.com"
              className="group bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10 dark:border-gray-700 hover:bg-white/10 dark:hover:bg-gray-700/50 hover:border-white/20 dark:hover:border-gray-600 transition-all duration-300"
              variants={staggerItem}
              whileHover={{ scale: 1.05, y: -4 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-[#063479] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{t("landing.contact.book_online")}</h4>
                  <p className="text-sky-200 dark:text-sky-300 text-xs">{t('landing.contact.email_address')}</p>
                </div>
              </div>
            </motion.a>

            {/* Location Card */}
            <motion.a
              href="https://www.google.com/maps/place/%D8%AA%D9%8A%D8%B1%D8%A7+%D9%84%D8%B5%D9%8A%D8%A7%D9%86%D8%A9+%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%B1%D8%A7%D8%AA%E2%80%AD/@24.8410326,46.8204813,15z/data=!4m19!1m10!3m9!1s0x3e2e55b9d4a57a9f:0xc0bc4c555c8e6e02!2z2KrZitix2Kcg2YTYtdmK2KfZhtipINin2YTYs9mK2KfYsdin2Ko!8m2!3d24.8409092!4d46.8205118!10e5!14m1!1BCgIgAQ!16s%2Fg%2F11x6ymw6b2!3m7!1s0x3e2e55b9d4a57a9f:0xc0bc4c555c8e6e02!8m2!3d24.8409092!4d46.8205118!9m1!1b1!16s%2Fg%2F11x6ymw6b2?entry=ttu&g_ep=EgoyMDI1MTAxNC4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10 dark:border-gray-700 hover:bg-white/10 dark:hover:bg-gray-700/50 hover:border-white/20 dark:hover:border-gray-600 transition-all duration-300"
              variants={staggerItem}
              whileHover={{ scale: 1.05, y: -4 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-[#063479] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{t('landing_missing.visit_our_shop')}</h4>
                  <p className="text-sky-200 dark:text-sky-300 text-xs">{t("landing.contact.address")}</p>
                </div>
              </div>
            </motion.a>
          </motion.div>

          <motion.div
            className="mt-10 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <iframe
              src="https://maps.google.com/maps?q=24.8409092,46.8205118&z=17&output=embed"
              width="100%"
              height="350"
              className="border-0 rounded-3xl shadow-lg"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 dark:bg-black text-white py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
            <div className="flex items-center mb-3">
                <Image
                  src="/tenant-logos/teramotors-logo-transparent.png"
                  alt="TeraMotor Logo"
                  width={40}
                  height={40}
                  className="w-12 h-12 me-3 object-contain"
                />
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold tracking-tight text-white drop-shadow-sm font-logo" style={{ letterSpacing: '0.04em' }}>
                    Tera
                    <span className="text-[#60A5FA]">Motor</span>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 bg-gray-800 rounded px-2 py-0.5 mt-1 self-start shadow-sm" style={{ letterSpacing: '0.15em' }}>
                    {t('landing.header.auto_repair')}
                  </span>
                </div>
            </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                {t("landing.about.description")}
              </p>
              <div className="flex gap-4">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#60A5FA] transition-colors" aria-label="WhatsApp">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href="mailto:info@teramotors.com" className="text-gray-400 hover:text-[#60A5FA] transition-colors" aria-label="Email">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="https://maps.google.com/maps?q=24.8409092,46.8205118&z=17&output=embed" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#60A5FA] transition-colors" aria-label="Location">
                  <MapPin className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-base font-semibold mb-3 text-white">{t("landing.services.title")}</h4>
              <div className="space-y-1">
                <a href="#services" className="block text-gray-400 hover:text-[#60A5FA] transition-colors text-sm">{t("landing.services.title")}</a>
                <a href="#about" className="block text-gray-400 hover:text-[#60A5FA] transition-colors text-sm">{t("landing.about.title")}</a>
                <a href="#contact" className="block text-gray-400 hover:text-[#60A5FA] transition-colors text-sm">{t("landing.contact.title")}</a>
                <Link href="/portal/teramotors-default/login" className="block text-gray-400 hover:text-[#60A5FA] transition-colors text-sm">
                  {t('landing.header.customer_portal')}
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-base font-semibold mb-3 text-white">{t('landing_missing.contact_info')}</h4>
              <div className="space-y-1 text-gray-400 text-sm">
                <p>{t("landing.contact.address")}</p>
                <p>{t("landing.contact.phone")}</p>
                <p>{t("landing.contact.email")}</p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="block text-[#60A5FA] hover:text-white transition-colors font-medium text-sm"
                  >
                    {t('landing.footer.staff_login')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-4 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} {t('landing.footer.company_name')}. {t('landing_missing.all_rights_reserved')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
