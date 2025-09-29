/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { signIn } from "@/lib/simple-auth-client";
import { useRouter } from "next/navigation";
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
  Settings,
  Zap,
  WrenchIcon,
  CarIcon,
  Cog,
  Thermometer,
  Gauge,
  Wrench as WrenchIcon2,
  FileText,
  Mail,
  Globe
} from "lucide-react";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { t } = useTranslation();

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
        router.push("/dashboard");
      } else {
        setError(result.error || t("auth.invalid_email_or_password"));
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Wrench className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          {t("landing.login.title")}
        </h2>
        <p className="text-gray-600 text-base">
          {t("landing.login.subtitle")}
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50/90 border border-red-200 rounded-2xl text-red-700 text-sm backdrop-blur-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            {t("auth.email")}
          </label>
          <div className="relative">
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm"
              placeholder={t('ui.enter_your_email')}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            {t("auth.password")}
          </label>
          <div className="relative">
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm"
              placeholder={t('ui.enter_your_password')}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#F13F33] to-[#d6352a] text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-xl hover:shadow-[#F13F33]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center hover:-translate-y-0.5"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {t("auth.signing_in")}
            </div>
          ) : (
            t("landing.login.sign_in")
          )}
        </button>
      </form>
      
      <div className="mt-8 text-center space-y-3">
        <Link
          href="/forgot-password"
          className="text-[#063479] hover:text-[#F13F33] font-semibold text-sm block transition-colors duration-300"
        >
          {t("auth.forgot_password")}
        </Link>
      </div>
    </div>
  );
}

function ServiceCard({ icon: Icon, title, description }: { 
  icon: React.ComponentType<{ className?: string }>, 
  title: string, 
  description: string 
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="w-16 h-16 bg-[#F13F33] rounded-xl flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string, label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold mb-2">{number}</div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );
}

function TestimonialCard({ name, role, content }: { name: string, role: string, content: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
      </div>
      <p className="text-gray-700 mb-4 italic">"{content}"</p>
      <div>
        <div className="font-semibold text-gray-900">{name}</div>
        <div className="text-sm text-gray-500">{role}</div>
      </div>
    </div>
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
      className="flex items-center space-x-2 text-gray-700 hover:text-[#F13F33] transition-colors"
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">{i18n.language === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
}

export default function LandingPage() {
  const { t } = useTranslation();

  const services = [
    {
      icon: Settings,
      title: t("landing.services.engine_repair.title"),
      description: t("landing.services.engine_repair.description")
    },
    {
      icon: Shield,
      title: t("landing.services.brake_service.title"),
      description: t("landing.services.brake_service.description")
    },
    {
      icon: Cog,
      title: t("landing.services.transmission.title"),
      description: t("landing.services.transmission.description")
    },
    {
      icon: Zap,
      title: t("landing.services.electrical.title"),
      description: t("landing.services.electrical.description")
    },
    {
      icon: Thermometer,
      title: t("landing.services.ac_heating.title"),
      description: t("landing.services.ac_heating.description")
    },
    {
      icon: Gauge,
      title: t("landing.services.suspension.title"),
      description: t("landing.services.suspension.description")
    },
    {
      icon: WrenchIcon2,
      title: t("landing.services.oil_change.title"),
      description: t("landing.services.oil_change.description")
    },
    {
      icon: FileText,
      title: t("landing.services.inspection.title"),
      description: t("landing.services.inspection.description")
    }
  ];

  const stats = [
    { number: "15+", label: t("landing.about.experience") },
    { number: "100%", label: t("landing.about.customer_satisfaction") },
    { number: "12", label: t("landing.about.warranty") },
    { number: "50+", label: t("landing.about.certified_techs") }
  ];

  const testimonials = [
    {
      name: t('testimonials.sarah_johnson.name'),
      role: t('testimonials.sarah_johnson.role'),
      content: t('landing_missing.testimonial_1')
    },
    {
      name: t('testimonials.mike_chen.name'),
      role: t('testimonials.mike_chen.role'),
      content: t('landing_missing.testimonial_2')
    },
    {
      name: t('testimonials.lisa_rodriguez.name'),
      role: t('testimonials.lisa_rodriguez.role'),
      content: t('landing_missing.testimonial_3')
    }
  ];

  const values = [
    t("landing.about.values.honesty"),
    t("landing.about.values.quality"),
    t("landing.about.values.warranty"),
    t("landing.about.values.convenience")
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
                <img 
                  src="/icon.png" 
                  alt="TeraMotors Logo" 
                  className="w-14 h-14 rounded-xl mr-3 object-contain"
                />
                <div className="flex flex-col">
                  <span className="flex items-center space-x-2">
                    <span className="text-3xl font-extrabold tracking-tight text-[#063479] drop-shadow-sm font-logo" style={{ letterSpacing: '0.04em' }}>
                      Tera
                      <span className="text-[#F13F33]">Motors</span>
                    </span>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#063479] bg-blue-100 rounded px-2 py-0.5 mt-1 self-start shadow-sm" style={{ letterSpacing: '0.15em' }}>
                    Auto Repair
                  </span>
                </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-700 hover:text-[#F13F33] transition-colors">{t("landing.services.title")}</a>
              <a href="#about" className="text-gray-700 hover:text-[#F13F33] transition-colors">{t("landing.about.title")}</a>
              <a href="#contact" className="text-gray-700 hover:text-[#F13F33] transition-colors">{t("landing.contact.title")}</a>
              <LanguageSwitch />
              <a href="tel:+15551234567" className="text-[#F13F33] font-semibold flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                (555) 123-4567
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#063479] to-[#052a5f] text-white py-24">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#F13F33]/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#F13F33]/20 border border-[#F13F33]/30 text-[#F13F33] text-sm font-medium">
                  <Wrench className="w-4 h-4 mr-2" />
                  {t('landing_missing.professional_auto_repair')}
                </div>
                <h1 className="text-6xl font-bold leading-tight bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                  {t("landing.hero.title")}
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
                  {t("landing.hero.subtitle")}
                </p>
                <p className="text-lg text-blue-200/80 leading-relaxed max-w-xl">
                  {t("landing.hero.description")}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="tel:+15551234567" 
                  className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#F13F33] to-[#d6352a] text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-[#F13F33]/25 transition-all duration-300 hover:-translate-y-1"
                >
                  <Phone className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  {t("landing.hero.call_now")}
                </a>
                <a 
                  href="#services" 
                  className="group inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
                >
                  {t("landing.hero.book_appointment")}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

             
            </div>
            
            <div className="relative">
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
                <div className="relative text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Car className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">{t('landing_missing.professional_service')}</h3>
                  <p className="text-blue-100 mb-8 text-lg">{t('landing_missing.trusted_by_thousands')}</p>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                      <div className="text-3xl font-bold text-white">15+</div>
                      <div className="text-sm text-blue-200">{t('landing_missing.years_experience')}</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                      <div className="text-3xl font-bold text-white">100%</div>
                      <div className="text-sm text-blue-200">{t('landing_missing.satisfaction')}</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                      <div className="text-3xl font-bold text-white">24/7</div>
                      <div className="text-sm text-blue-200">{t('landing_missing.support_24_7')}</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                      <div className="text-3xl font-bold text-white">5K+</div>
                      <div className="text-sm text-blue-200">{t('landing_missing.happy_customers')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%23f3f4f6%22%20fill-opacity%3D%220.3%22%3E%3Cpath%20d%3D%22M20%2020c0-5.5-4.5-10-10-10s-10%204.5-10%2010%204.5%2010%2010%2010%2010-4.5%2010-10zm10%200c0-5.5-4.5-10-10-10s-10%204.5-10%2010%204.5%2010%2010%2010%2010-4.5%2010-10z%22/%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#F13F33]/10 border border-[#F13F33]/20 text-[#F13F33] text-sm font-medium mb-6">
              <Wrench className="w-4 h-4 mr-2" />
              {t('landing_missing.our_services')}
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              {t("landing.services.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t("landing.services.subtitle")}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#F13F33]/5 to-[#063479]/5 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 border border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#F13F33] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#F13F33] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StatCard key={index} number={stat.number} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {t("landing.about.title")}
              </h2>
              <h3 className="text-2xl font-semibold text-[#F13F33] mb-6">
                {t("landing.about.subtitle")}
              </h3>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                {t("landing.about.description")}
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                {t("landing.about.mission")}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                {t('landing_missing.why_choose_us')}
              </h3>
              <div className="space-y-4">
                {values.map((value, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-[#F13F33] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("landing.testimonials.title")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("landing.testimonials.subtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                name={testimonial.name}
                role={testimonial.role}
                content={testimonial.content}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-24 bg-gradient-to-br from-[#063479] via-[#052a5f] to-slate-900 text-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#F13F33]/10 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#F13F33]/20 border border-[#F13F33]/30 text-[#F13F33] text-sm font-medium mb-8">
                <Phone className="w-4 h-4 mr-2" />
                {t('landing_missing.get_in_touch')}
              </div>
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                {t("landing.contact.title")}
              </h2>
              <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                {t("landing.contact.subtitle")}
              </p>
              
              <div className="grid grid-cols-1 gap-8 mb-12">
                <div className="flex items-start space-x-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{t('landing_missing.visit_our_shop')}</h4>
                    <p className="text-blue-200">{t("landing.contact.address")}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{t('landing_missing.call_us')}</h4>
                    <p className="text-blue-200">{t("landing.contact.phone")}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{t('landing_missing.working_hours')}</h4>
                    <p className="text-blue-200">{t("landing.contact.hours")}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="tel:+15551234567"
                  className="group bg-gradient-to-r from-[#F13F33] to-[#d6352a] text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-[#F13F33]/25 transition-all duration-300 text-center flex items-center justify-center hover:-translate-y-1"
                >
                  <Phone className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  {t("landing.contact.call_us")}
                </a>
                <a
                  href="mailto:info@teramotors.com"
                  className="group border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300 text-center backdrop-blur-sm"
                >
                  <Mail className="w-5 h-5 mr-2 inline group-hover:scale-110 transition-transform" />
                  {t("landing.contact.book_online")}
                </a>
              </div>
            </div>
            
            <div className="lg:mt-16 flex justify-center items-center">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-2 border border-white/20 shadow-2xl w-full max-w-md">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{t('landing_missing.workshop_portal')}</h3>
                    <p className="text-gray-300 text-sm">{t('landing_missing.staff_management_access')}</p>
                  </div>
                  <Suspense fallback={<div className="animate-pulse bg-white/20 rounded-2xl w-full h-96"></div>}>
                    <LoginForm />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <img 
                  src="/small-logo.jpeg" 
                  alt="TeraMotors Logo" 
                  className="w-14 h-14 rounded-xl mr-3 object-contain bg-white p-1"
                />
                <div>
                  <h3 className="text-2xl font-bold">TeraMotors</h3>
                  <p className="text-gray-400">Auto Repair</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                {t("landing.about.description")}
              </p>
              <div className="flex space-x-4">
                <a href="tel:+15551234567" className="text-gray-400 hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </a>
                <a href="mailto:info@teramotors.com" className="text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">{t('landing_missing.services')}</h4>
              <div className="space-y-2">
                <a href="#services" className="block text-gray-400 hover:text-white transition-colors">{t('landing_missing.engine_repair')}</a>
                <a href="#services" className="block text-gray-400 hover:text-white transition-colors">{t('landing_missing.brake_service')}</a>
                <a href="#services" className="block text-gray-400 hover:text-white transition-colors">{t('landing_missing.transmission')}</a>
                <a href="#services" className="block text-gray-400 hover:text-white transition-colors">{t('landing_missing.electrical')}</a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">{t('landing_missing.contact_info')}</h4>
              <div className="space-y-2 text-gray-400">
                <p>{t("landing.contact.address")}</p>
                <p>{t("landing.contact.phone")}</p>
                <p>{t("landing.contact.email")}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TeraMotors Auto Repair. {t('landing_missing.all_rights_reserved')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
