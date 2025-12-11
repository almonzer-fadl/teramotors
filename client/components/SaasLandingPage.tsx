"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Car,
  FileText,
  Users,
  BarChart3,
  Calendar,
  Shield,
  Menu,
  X,
  ArrowRight,
  Star,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import LanguageSwitcher from "@/components/dashboard/LanguageSwitcher";

const statsConfig = [
  { value: "500+", labelKey: "marketing.stats.workshops" },
  { value: "50K+", labelKey: "marketing.stats.invoices" },
  { value: "99.9%", labelKey: "marketing.stats.uptime" },
  { value: "24/7", labelKey: "marketing.stats.support" },
];

const featureConfig = [
  { icon: Car, titleKey: "marketing.features.vehicle_management.title", descriptionKey: "marketing.features.vehicle_management.description" },
  { icon: FileText, titleKey: "marketing.features.smart_invoicing.title", descriptionKey: "marketing.features.smart_invoicing.description" },
  { icon: Users, titleKey: "marketing.features.customer_portal.title", descriptionKey: "marketing.features.customer_portal.description" },
  { icon: BarChart3, titleKey: "marketing.features.analytics_dashboard.title", descriptionKey: "marketing.features.analytics_dashboard.description" },
  { icon: Calendar, titleKey: "marketing.features.appointment_booking.title", descriptionKey: "marketing.features.appointment_booking.description" },
  { icon: Shield, titleKey: "marketing.features.inventory_control.title", descriptionKey: "marketing.features.inventory_control.description" },
];

const testimonialConfig = [
  { quoteKey: "marketing.testimonials.quote1", authorKey: "marketing.testimonials.author1", roleKey: "marketing.testimonials.role1" },
  { quoteKey: "marketing.testimonials.quote2", authorKey: "marketing.testimonials.author2", roleKey: "marketing.testimonials.role2" },
  { quoteKey: "marketing.testimonials.quote3", authorKey: "marketing.testimonials.author3", roleKey: "marketing.testimonials.role3" },
];

const pricingConfig = [
  { tierKey: "marketing.pricing.free_tier", priceKey: "marketing.pricing.free" },
  { tierKey: "marketing.pricing.basic", priceKey: "marketing.pricing.basic" },
  { tierKey: "marketing.pricing.pro", priceKey: "marketing.pricing.pro" },
];

export default function SaasLandingPage() {
  const { t } = useTranslation("common");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-gradient-to-b from-white via-[#FDF7F3] to-white text-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 dark:bg-gray-950/90 border-b border-gray-200/60 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F97402] to-[#F13F33] flex items-center justify-center text-white font-bold">
              TM
            </div>
            <span className="text-lg font-semibold">{t("marketing.header.company_name")}</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700 dark:text-gray-300">
            <a href="#features" className="hover:text-[#F97402] transition">{t("marketing.navigation.features")}</a>
            <a href="#pricing" className="hover:text-[#F97402] transition">{t("marketing.navigation.pricing")}</a>
            <a href="#testimonials" className="hover:text-[#F97402] transition">{t("marketing.navigation.testimonials")}</a>
            <Link href="/login" className="text-gray-500 hover:text-[#F97402] transition">{t("marketing.navigation.sign_in")}</Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
              <Link href="/register" className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#063479] to-[#052a5f] text-white shadow-lg shadow-[#063479]/30 hover:shadow-xl transition">
                {t("marketing.navigation.start_trial")}
              </Link>
            </div>
          </nav>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-700 dark:text-gray-200">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 px-4 py-4 space-y-4 text-sm font-medium">
            <a href="#features" className="block" onClick={() => setMenuOpen(false)}>{t("marketing.navigation.features")}</a>
            <a href="#pricing" className="block" onClick={() => setMenuOpen(false)}>{t("marketing.navigation.pricing")}</a>
            <a href="#testimonials" className="block" onClick={() => setMenuOpen(false)}>{t("marketing.navigation.testimonials")}</a>
            <Link href="/login" onClick={() => setMenuOpen(false)} className="block">{t("marketing.navigation.sign_in")}</Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <Link href="/register" onClick={() => setMenuOpen(false)} className="block text-center px-4 py-2 rounded-xl bg-gradient-to-r from-[#063479] to-[#052a5f] text-white shadow">
              {t("marketing.navigation.start_trial")}
            </Link>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FDF1E8] text-[#F97402] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#F97402]" />
                {t("marketing.hero.zatca_badge")}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {t("marketing.hero.title")} <span className="text-[#F97402]">{t("marketing.hero.title_highlight")}</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {t("marketing.hero.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white font-semibold shadow-lg shadow-[#F97402]/30 hover:shadow-xl transition">
                  {t("marketing.hero.cta_start_trial")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:border-[#F97402] hover:text-[#F97402] transition">
                  {t("marketing.hero.cta_watch_demo")}
                </Link>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("marketing.hero.trial_info")}</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#F97402]/20 to-[#F13F33]/10 blur-3xl" />
              <div className="relative rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl p-6">
                <div className="text-sm font-semibold text-gray-500 mb-2">{t("marketing.hero.dashboard_preview")}</div>
                <div className="rounded-2xl bg-gradient-to-br from-[#063479] to-[#052a5f] p-6 text-white shadow-xl h-64 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-white/70">{t("marketing.hero.dashboard_subtitle")}</p>
                    <h3 className="text-2xl font-bold mt-2">{t("marketing.header.company_name")}</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {statsConfig.map((stat) => (
                      <div key={stat.labelKey} className="bg-white/10 rounded-xl p-3">
                        <p className="text-xl font-bold">{stat.value}</p>
                        <p className="text-xs text-white/70">{t(stat.labelKey)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-white dark:bg-gray-950 border-y border-gray-200 dark:border-gray-800">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center px-6">
            {statsConfig.map((stat) => (
              <div key={stat.labelKey}>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t(stat.labelKey)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <p className="text-xs font-semibold tracking-widest text-[#F97402]">{t("marketing.features.section_label")}</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                {t("marketing.features.section_title")}{" "}
                <span className="text-[#F97402]">{t("marketing.features.section_title_highlight")}</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{t("marketing.features.section_subtitle")}</p>
            </div>
            <div className="mt-12 grid md:grid-cols-2 gap-6">
              {featureConfig.map(({ icon: Icon, titleKey, descriptionKey }) => (
                <div key={titleKey} className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 p-6 shadow-sm hover:shadow-lg transition">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F97402] to-[#F13F33] text-white flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t(titleKey)}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t(descriptionKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <p className="text-xs font-semibold tracking-widest text-[#F97402]">{t("marketing.pricing.section_label")}</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{t("marketing.pricing.section_title")}</h2>
              <p className="text-gray-600 dark:text-gray-300">{t("marketing.pricing.section_subtitle")}</p>
            </div>
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              {pricingConfig.map(({ tierKey }, idx) => (
                <div key={tierKey} className={`rounded-3xl border ${idx === 1 ? "border-[#F97402]" : "border-gray-200 dark:border-gray-800"} bg-white dark:bg-gray-900/70 p-6 shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t(`${tierKey}.name`)}</h3>
                    {idx === 1 && (
                      <span className="text-xs font-semibold text-[#F97402] bg-[#F97402]/10 px-3 py-1 rounded-full">
                        {t("marketing.pricing.most_popular")}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t(`${tierKey}.description`)}</p>
                  <div className="mt-6">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{idx === 0 ? "SAR 0" : idx === 1 ? "SAR 249" : "SAR 499"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("marketing.pricing.per_month")}</p>
                  </div>
                  <Link href="/register" className={`mt-6 block text-center px-4 py-3 rounded-2xl font-semibold ${idx === 1 ? "bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/30" : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-[#F97402] hover:text-[#F97402]"}`}>
                    {t("marketing.pricing.get_started")}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <p className="text-xs font-semibold tracking-widest text-[#F97402]">{t("marketing.testimonials.section_label")}</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{t("marketing.testimonials.section_title")}</h2>
          </div>
          <div className="mt-12 max-w-6xl mx-auto grid md:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8">
            {testimonialConfig.map(({ quoteKey, authorKey, roleKey }) => (
              <div key={quoteKey} className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 p-6 text-left shadow-sm">
                <Star className="w-10 h-10 text-[#F97402] mb-4" />
                <p className="text-gray-700 dark:text-gray-300 italic">{t(quoteKey)}</p>
                <div className="mt-4">
                  <p className="font-semibold text-gray-900 dark:text-white">{t(authorKey)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t(roleKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center rounded-3xl bg-gradient-to-r from-[#063479] to-[#052a5f] text-white p-10 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold">
              {t("marketing.cta.title")} <span className="text-[#F97402]">{t("marketing.cta.title_highlight")}</span>
            </h2>
            <p className="mt-4 text-white/80">{t("marketing.cta.description")}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="px-6 py-3 rounded-2xl bg-white text-[#063479] font-semibold shadow-lg hover:shadow-xl transition">
                {t("marketing.cta.cta_start_trial")}
              </Link>
              <Link href="/contact" className="px-6 py-3 rounded-2xl border border-white/40 text-white font-semibold hover:bg-white/10 transition">
                {t("marketing.cta.contact_sales")}
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/70">{t("marketing.cta.no_credit_card")}</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>{t("marketing.footer.description")}</p>
        <p className="mt-2">{t("marketing.footer.made_in")}</p>
        <p className="mt-1 text-xs">&copy; {new Date().getFullYear()} {t("marketing.footer.company_name")} • {t("marketing.footer.all_rights_reserved")}</p>
      </footer>
    </div>
  );
}
