/* eslint-disable @next/next/no-img-element */
"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import {
  Wrench,
  Car,
  Calendar,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Shield,
  Award,
  Users,
  Mail,
  Globe,
  Menu,
  X,
  User
} from "lucide-react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { LogoLoop } from "@/components/LogoLoop";
import { ThemeToggle } from "@/components/ui/theme-toggle";




// Animation Variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7 }
};

const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7 }
};

const floatingAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const scaleInAnimation = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.6 }
};

const pulseAnimation = {
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(249, 116, 2, 0.4)",
      "0 0 0 10px rgba(249, 116, 2, 0)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity
    }
  }
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
      className={`group relative overflow-hidden rounded-2xl shadow-lg dark:shadow-gray-900/50 hover:shadow-2xl dark:hover:shadow-gray-900/70 transition-all duration-300 hover:-translate-y-1 hover:scale-105 ${className}`}
    >
      <img
        src={src}
        alt={alt}
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
      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-[#F97402] dark:hover:text-[#F97402] transition-colors"
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">{i18n.language === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
}

export default function LandingPage() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const subscriptions = [
    {
      title: t("landing.subscriptions.basic.title"),
      features: [
        t("landing.subscriptions.basic.feature1"),
        t("landing.subscriptions.basic.feature2"),
        t("landing.subscriptions.basic.feature3"),
      ],
      price: t("landing.subscriptions.basic.price"),
    },
    {
      title: t("landing.subscriptions.standard.title"),
      features: [
        t("landing.subscriptions.standard.feature1"),
        t("landing.subscriptions.standard.feature2"),
        t("landing.subscriptions.standard.feature3"),
        t("landing.subscriptions.standard.feature4"),
      ],
      price: t("landing.subscriptions.standard.price"),
    },
    {
      title: t("landing.subscriptions.premium.title"),
      features: [
        t("landing.subscriptions.premium.feature1"),
        t("landing.subscriptions.premium.feature2"),
        t("landing.subscriptions.premium.feature3"),
        t("landing.subscriptions.premium.feature4"),
        t("landing.subscriptions.premium.feature5"),
      ],
      price: t("landing.subscriptions.premium.price"),
    },
    {
      title: t("landing.subscriptions.enterprise.title"),
      features: [
        t("landing.subscriptions.enterprise.feature1"),
        t("landing.subscriptions.enterprise.feature2"),
        t("landing.subscriptions.enterprise.feature3"),
        t("landing.subscriptions.enterprise.feature4"),
        t("landing.subscriptions.enterprise.feature5"),
        t("landing.subscriptions.enterprise.feature6"),
      ],
      price: t("landing.subscriptions.enterprise.price"),
    },
  ];

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
    className: 'w-full max-w-sm'
  };

  const rightTestimonials = [
    {
      src: '/Testimonials/1.png',
      alt: t('landing_missing.testimonial_1'),
      className: 'w-full max-w-xs'
    },
    {
      src: '/Testimonials/3.png',
      alt: t('landing_missing.testimonial_3'),
      className: 'w-full max-w-xs'
    },
    {
      src: '/Testimonials/4.png',
      alt: 'Professional auto repair service with excellent customer satisfaction',
      className: 'w-full max-w-xs'
    }
  ];

  const values = [
    t("landing.about.values.honesty"),
    t("landing.about.values.quality"),
    t("landing.about.values.warranty"),
    t("landing.about.values.convenience")
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800/50 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
                <img
                  src="/icon.png"
                  alt="TeraMotors Logo"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl mr-2 sm:mr-3 object-contain"
                />
                <div className="flex flex-col">
                  <span className="flex items-center space-x-2">
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#063479] dark:text-white drop-shadow-sm font-logo" style={{ letterSpacing: '0.04em' }}>
                      Tera
                      <span className="text-[#F97402]">Motors</span>
                    </span>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#063479] dark:text-gray-300 bg-blue-100 dark:bg-gray-800 rounded px-2 py-0.5 mt-1 self-start shadow-sm" style={{ letterSpacing: '0.15em' }}>
                    Auto Repair
                  </span>
                </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#subscriptions" className="text-gray-700 dark:text-gray-300 hover:text-[#F97402] dark:hover:text-[#F97402] transition-colors">{t("landing.subscriptions.title")}</a>
              <a href="#about" className="text-gray-700 dark:text-gray-300 hover:text-[#F97402] dark:hover:text-[#F97402] transition-colors">{t("landing.about.title")}</a>
              <a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-[#F97402] dark:hover:text-[#F97402] transition-colors">{t("landing.contact.title")}</a>
              <Link href="/portal/teramotors-default/login" className="text-gray-700 dark:text-gray-300 hover:text-[#F97402] dark:hover:text-[#F97402] transition-colors flex items-center gap-1">
                <User className="w-4 h-4" />
                Customer Portal
              </Link>
              <LanguageSwitch />
              <ThemeToggle />
              <a href="tel:+966590090612" className="text-[#F97402] font-semibold flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                +966590090612
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-3">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-[#F97402] dark:hover:text-[#F97402] transition-colors"
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
            <a
              href="#subscriptions"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-gray-700 dark:text-gray-300 hover:text-[#F97402] dark:hover:text-[#F97402] transition-colors font-medium"
            >
              {t("landing.subscriptions.title")}
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-gray-700 dark:text-gray-300 hover:text-[#F97402] dark:hover:text-[#F97402] transition-colors font-medium"
            >
              {t("landing.about.title")}
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-gray-700 dark:text-gray-300 hover:text-[#F97402] dark:hover:text-[#F97402] transition-colors font-medium"
            >
              {t("landing.contact.title")}
            </a>
            <Link
              href="/portal/teramotors-default/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-gray-700 dark:text-gray-300 hover:text-[#F97402] dark:hover:text-[#F97402] transition-colors font-medium"
            >
              <User className="w-4 h-4" />
              Customer Portal
            </Link>
            <div className="py-2">
              <LanguageSwitch />
            </div>
            <a
              href="tel:+966590090612"
              className="flex items-center py-3 px-4 bg-[#F97402] text-white rounded-lg font-semibold hover:bg-[#d6352a] transition-colors"
            >
              <Phone className="w-5 h-5 mr-2" />
              +966590090612
            </a>
          </div>
        </motion.div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#063479] via-[#052a5f] to-slate-900 dark:from-slate-950 dark:via-gray-900 dark:to-black text-white py-12 sm:py-16 md:py-24">
        {/* TODO: Add hero background image of workshop */}
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#F97402]/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl"></div>

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
                  className="inline-flex items-center px-3 py-2 sm:px-4 rounded-full bg-[#F97402]/20 border border-[#F97402]/30 text-[#F97402] text-xs sm:text-sm font-medium"
                >
                  <Wrench className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  {t('landing_missing.professional_auto_repair')}
                </motion.div>
                <motion.h1
                  variants={fadeInUp}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent"
                >
                  {t("landing.hero.title")}
                </motion.h1>
                <motion.p variants={fadeInUp} className="text-base sm:text-lg md:text-xl text-blue-100 leading-relaxed max-w-lg">
                  {t("landing.hero.subtitle")}
                </motion.p>
                <motion.p variants={fadeInUp} className="text-sm sm:text-base md:text-lg text-blue-200/80 leading-relaxed max-w-xl">
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
                  href="tel:+966590090612"
                  className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#F97402] to-[#d6352a] text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-[#F97402]/25 transition-all duration-300 hover:-translate-y-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Phone className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  {t("landing.hero.call_now")}
                </motion.a>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/portal/teramotors-default/login"
                    className="group relative inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                  >
                    <User className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Customer Portal
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
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl sm:rounded-3xl"></div>
                <div className="relative text-center">
                  <motion.div
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#F97402] to-[#d6352a] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg"
                    variants={floatingAnimation}
                    animate="animate"
                  >
                    <Car className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-4">{t('landing_missing.professional_service')}</h3>
                  <p className="text-blue-100 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg">{t('landing_missing.trusted_by_thousands')}</p>

                  <motion.div
                    className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    <motion.div
                      variants={scaleInAnimation}
                      className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6"
                    >
                      <div className="text-2xl sm:text-2xl md:text-3xl font-bold text-white">
                        <Counter end={15} />
                      </div>
                      <div className="text-xs sm:text-sm text-blue-200">{t('landing_missing.years_experience')}</div>
                    </motion.div>
                    <motion.div
                      variants={scaleInAnimation}
                      className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6"
                    >
                      <div className="text-2xl sm:text-2xl md:text-3xl font-bold text-white">100%</div>
                      <div className="text-xs sm:text-sm text-blue-200">{t('landing_missing.satisfaction')}</div>
                    </motion.div>
                    <motion.div
                      variants={scaleInAnimation}
                      className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6"
                    >
                      <div className="text-2xl sm:text-2xl md:text-3xl font-bold text-white">24/7</div>
                      <div className="text-xs sm:text-sm text-blue-200">{t('landing_missing.support_24_7')}</div>
                    </motion.div>
                    <motion.div
                      variants={scaleInAnimation}
                      className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6"
                    >
                      <div className="text-2xl sm:text-2xl md:text-3xl font-bold text-white">
                        <Counter end={15000} />
                      </div>
                      <div className="text-xs sm:text-sm text-blue-200">{t('landing_missing.happy_customers')}</div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Subscriptions Section */}
      <section id="subscriptions" className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 transition-colors">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%23f3f4f6%22%20fill-opacity%3D%220.3%22%3E%3Cpath%20d%3D%22M20%2020c0-5.5-4.5-10-10-10s-10%204.5-10%2010%204.5%2010%2010%2010%2010-4.5%2010-10zm10%200c0-5.5-4.5-10-10-10s-10%204.5-10%2010%204.5%2010%2010%2010%2010-4.5%2010-10z%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20 dark:opacity-5"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full bg-[#F97402]/10 border border-[#F97402]/20 text-[#F97402] text-sm font-medium mb-6"
              variants={floatingAnimation}
              animate="animate"
            >
              <Award className="w-4 h-4 mr-2" />
              {t('landing_missing.our_subscriptions')}
            </motion.div>
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t("landing.subscriptions.title")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t("landing.subscriptions.subtitle")}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {subscriptions.map((subscription, index) => (
              <motion.div
                key={index}
                className="group relative"
                variants={staggerItem}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#F97402]/5 to-[#063479]/5 dark:from-[#F97402]/10 dark:to-[#063479]/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <motion.div
                  className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg dark:shadow-gray-900/50 hover:shadow-2xl dark:hover:shadow-gray-900/70 transition-all duration-500 border border-gray-100 dark:border-gray-700 h-full flex flex-col"
                  whileHover={{ scale: 1.02, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {index === 2 && (
                    <motion.div
                      className="absolute inset-0 rounded-3xl"
                      variants={pulseAnimation}
                      animate="animate"
                      style={{ pointerEvents: 'none' }}
                    />
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-[#F97402] transition-colors">
                    {subscription.title}
                  </h3>
                  <ul className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 flex-grow">
                    {subscription.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        className="flex items-center mb-2"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: featureIndex * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <CheckCircle className="w-5 h-5 text-[#F97402] mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mt-auto">
                    {subscription.price}
                  </div>
                </motion.div>
              </motion.div>
            ))}
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
      <section id="about" className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={slideInLeft}
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {t("landing.about.title")}
              </h2>
              <h3 className="text-2xl font-semibold text-[#F97402] mb-6">
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
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg dark:shadow-gray-900/50"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={slideInRight}
            >
              {/* TODO: Add workshop team photo */}
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
                    className="flex items-start space-x-3"
                    variants={staggerItem}
                  >
                    <CheckCircle className="w-6 h-6 text-[#F97402] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{value}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23f3f4f6%22%20fill-opacity%3D%220.3%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40 dark:opacity-5"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#F97402]/5 to-transparent dark:from-[#F97402]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[#063479]/5 to-transparent dark:from-[#063479]/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full bg-[#F97402]/10 border border-[#F97402]/20 text-[#F97402] text-sm font-medium mb-6"
              variants={floatingAnimation}
              animate="animate"
            >
              <Star className="w-4 h-4 mr-2" />
              {t('landing_missing.trusted_by_thousands')}
            </motion.div>
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t("landing.testimonials.title")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t("landing.testimonials.subtitle")}
            </p>
          </motion.div>

          {/* Left-Right Layout */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* Left side - Image 2 */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <TestimonialImage
                src={leftTestimonial.src}
                alt={leftTestimonial.alt}
                className={leftTestimonial.className}
              />
            </motion.div>

            {/* Right side - Images 1, 3, 4 */}
            <motion.div
              className="flex flex-wrap justify-center items-center gap-4"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
            >
              {rightTestimonials.map((image, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                >
                  <TestimonialImage
                    src={image.src}
                    alt={image.alt}
                    className={image.className}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#063479] via-[#052a5f] to-slate-900 dark:from-gray-900 dark:via-gray-950 dark:to-gray-950 text-white overflow-hidden transition-colors">

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {t("landing.contact.title")}
          </motion.h2>
          <motion.p
            className="text-lg text-blue-100 dark:text-blue-300 mb-8"
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
            {/* Phone Card */}
            <motion.a
              href="tel:+966590090612"
              className="group bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-white/10 dark:border-gray-700 hover:bg-white/10 dark:hover:bg-gray-700/50 hover:border-white/20 dark:hover:border-gray-600 transition-all duration-300"
              variants={staggerItem}
              whileHover={{ scale: 1.05, y: -4 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#F97402] to-[#d6352a] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{t('landing_missing.call_us')}</h4>
                  <p className="text-blue-200 dark:text-blue-300 text-xs">{t("landing.contact.phone")}</p>
                </div>
              </div>
            </motion.a>

            {/* Email Card */}
            <motion.a
              href="mailto:info@teramotors.com"
              className="group bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-white/10 dark:border-gray-700 hover:bg-white/10 dark:hover:bg-gray-700/50 hover:border-white/20 dark:hover:border-gray-600 transition-all duration-300"
              variants={staggerItem}
              whileHover={{ scale: 1.05, y: -4 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#F97402] to-[#d6352a] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{t("landing.contact.book_online")}</h4>
                  <p className="text-blue-200 dark:text-blue-300 text-xs">info@teramotors.com</p>
                </div>
              </div>
            </motion.a>

            {/* Location Card */}
            <motion.a
              href="https://www.google.com/maps/place/%D8%AA%D9%8A%D8%B1%D8%A7+%D9%84%D8%B5%D9%8A%D8%A7%D9%86%D8%A9+%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%B1%D8%A7%D8%AA%E2%80%AD/@24.8410326,46.8204813,15z/data=!4m19!1m10!3m9!1s0x3e2e55b9d4a57a9f:0xc0bc4c555c8e6e02!2z2KrZitix2Kcg2YTYtdmK2KfZhtipINin2YTYs9mK2KfYsdin2Ko!8m2!3d24.8409092!4d46.8205118!10e5!14m1!1BCgIgAQ!16s%2Fg%2F11x6ymw6b2!3m7!1s0x3e2e55b9d4a57a9f:0xc0bc4c555c8e6e02!8m2!3d24.8409092!4d46.8205118!9m1!1b1!16s%2Fg%2F11x6ymw6b2?entry=ttu&g_ep=EgoyMDI1MTAxNC4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/5 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-white/10 dark:border-gray-700 hover:bg-white/10 dark:hover:bg-gray-700/50 hover:border-white/20 dark:hover:border-gray-600 transition-all duration-300"
              variants={staggerItem}
              whileHover={{ scale: 1.05, y: -4 }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#F97402] to-[#d6352a] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{t('landing_missing.visit_our_shop')}</h4>
                  <p className="text-blue-200 dark:text-blue-300 text-xs">{t("landing.contact.address")}</p>
                </div>
              </div>
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
            <div className="flex items-center mb-3">
                <img
                  src="/icon.png"
                  alt="TeraMotors Logo"
                  className="w-10 h-10 rounded-lg mr-3 object-contain"
                />
                <div className="flex flex-col">
                  <span className="flex items-center space-x-2">
                    <span className="text-xl font-extrabold tracking-tight text-white drop-shadow-sm font-logo" style={{ letterSpacing: '0.04em' }}>
                      Tera
                      <span className="text-[#F97402]">Motors</span>
                    </span>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-300 dark:text-gray-400 bg-gray-700 dark:bg-gray-800 rounded px-2 py-0.5 mt-1 self-start shadow-sm" style={{ letterSpacing: '0.15em' }}>
                    Auto Repair
                  </span>
                </div>
            </div>
              <p className="text-gray-400 dark:text-gray-500 leading-relaxed mb-6 max-w-md">
                {t("landing.about.description")}
              </p>
              <div className="flex space-x-4">
                <a href="tel:+966590090612" className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">
                  <Phone className="w-5 h-5" />
                </a>
                <a href="mailto:info@teramotors.com" className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-base font-semibold mb-3 text-white dark:text-gray-100">{t('landing_missing.subscriptions')}</h4>
              <div className="space-y-1">
                <a href="#subscriptions" className="block text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors text-sm">{t('landing_missing.basic_plan')}</a>
                <a href="#subscriptions" className="block text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors text-sm">{t('landing_missing.premium_plan')}</a>
                <a href="#subscriptions" className="block text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors text-sm">{t('landing_missing.enterprise_plan')}</a>
                <a href="#subscriptions" className="block text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors text-sm">{t('landing_missing.custom_plan')}</a>
              </div>
            </div>
            <div>
              <h4 className="text-base font-semibold mb-3 text-white dark:text-gray-100">{t('landing_missing.contact_info')}</h4>
              <div className="space-y-1 text-gray-400 dark:text-gray-500 text-sm">
                <p>{t("landing.contact.address")}</p>
                <p>{t("landing.contact.phone")}</p>
                <p>{t("landing.contact.email")}</p>
                <div className="pt-2 space-y-1">
                  <Link
                    href="/portal/teramotors-default/login"
                    className="flex items-center gap-1 text-blue-400 hover:text-white dark:hover:text-gray-300 transition-colors font-medium text-sm"
                  >
                    <User className="w-4 h-4" />
                    Customer Portal
                  </Link>
                  <Link
                    href="/login"
                    className="block text-[#F97402] hover:text-white dark:hover:text-gray-300 transition-colors font-medium text-sm"
                  >
                    Staff Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 dark:border-gray-700 mt-6 pt-4 text-center text-gray-400 dark:text-gray-500 text-sm">
            <p>&copy; 2024 TeraMotors Auto Repair. {t('landing_missing.all_rights_reserved')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
