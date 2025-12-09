'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InspectionTypeSelector } from './InspectionTypeSelector';
import { DateTimePicker } from './DateTimePicker';
import { CustomerForm } from './CustomerForm';
import { BookingConfirmation } from './BookingConfirmation';
import type { IInspectionTemplate } from '@/lib/models/InspectionTemplate';
import type { BookingCustomerInput, BookingVehicleInput } from '@/lib/validation/booking';
import { Check, Languages } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface BookingWizardProps {
  tenantSlug: string;
  tenantName: string;
  inspectionTemplates: IInspectionTemplate[];
  bookingSettings: {
    workingHours: any;
    appointmentDuration: number;
    advanceBookingDays: number;
    requireApproval: boolean;
  };
  language?: 'ar' | 'en';
}

export type WizardStep = 'inspection' | 'datetime' | 'customer' | 'confirmation';

interface BookingState {
  inspectionTemplateId?: string;
  appointmentDate?: Date;
  startTime?: Date;
  notes?: string;
  customer?: BookingCustomerInput;
  vehicle?: BookingVehicleInput;
  confirmationNumber?: string;
}

// Language Switcher Component
function LanguageSwitcher({ currentLang, onToggle }: { currentLang: string; onToggle: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-gray-800/50" />;
  }

  return (
    <motion.button
      onClick={onToggle}
      className="relative w-10 h-10 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-md flex items-center justify-center overflow-hidden hover:bg-white/70 dark:hover:bg-gray-700/50 transition-colors border border-gray-200/50 dark:border-gray-700/50"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${currentLang === 'en' ? 'Arabic' : 'English'}`}
    >
      <motion.span
        key={currentLang}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="text-sm font-bold bg-gradient-to-r from-[#F97402] to-[#F13F33] bg-clip-text text-transparent"
      >
        {currentLang === 'en' ? 'EN' : 'ع'}
      </motion.span>
    </motion.button>
  );
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

export function BookingWizard({
  tenantSlug,
  tenantName,
  inspectionTemplates,
  bookingSettings,
  language = 'en',
}: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('inspection');
  const [bookingData, setBookingData] = useState<BookingState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<'ar' | 'en'>(language);

  const isArabic = currentLanguage === 'ar';

  const steps: WizardStep[] = ['inspection', 'datetime', 'customer', 'confirmation'];
  const currentStepIndex = steps.indexOf(currentStep);

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'ar' : 'en';
    setCurrentLanguage(newLang);
    // Update document direction for RTL/LTR support
    if (typeof document !== 'undefined') {
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;
    }
  };

  const handleInspectionSelect = (inspectionTemplateId: string) => {
    setBookingData({ ...bookingData, inspectionTemplateId });
    setCurrentStep('datetime');
  };

  const handleDateTimeSelect = (appointmentDate: Date, startTime: Date, notes?: string) => {
    setBookingData({ ...bookingData, appointmentDate, startTime, notes });
    setCurrentStep('customer');
  };

  const handleCustomerSubmit = async (
    customer: BookingCustomerInput,
    vehicle: BookingVehicleInput
  ) => {
    setBookingData({ ...bookingData, customer, vehicle });
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/public/tenants/${tenantSlug}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectionTemplateId: bookingData.inspectionTemplateId,
          appointmentDate: bookingData.appointmentDate,
          startTime: bookingData.startTime,
          notes: bookingData.notes,
          customer,
          vehicle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      setBookingData({ ...bookingData, customer, vehicle, confirmationNumber: data.confirmationNumber });
      setCurrentStep('confirmation');
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const stepLabels = {
    inspection: isArabic ? 'اختر نوع الفحص' : 'Select Inspection',
    datetime: isArabic ? 'اختر التاريخ والوقت' : 'Choose Date & Time',
    customer: isArabic ? 'معلوماتك' : 'Your Information',
    confirmation: isArabic ? 'التأكيد' : 'Confirmation',
  };

  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;

            return (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      backgroundColor: isCompleted || isActive ? '#F97402' : '#e5e7eb',
                    }}
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                      isCompleted || isActive
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <Check className="w-6 h-6" />
                      </motion.div>
                    ) : (
                      index + 1
                    )}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F97402] to-[#F13F33] opacity-30"
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                    )}
                  </motion.div>
                  <span className={`mt-3 text-xs font-medium text-center ${
                    isCompleted || isActive
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {stepLabels[step]}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="relative flex-1 h-1 mx-4">
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-[#F97402] to-[#F13F33] rounded-full origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: index < currentStepIndex ? 1 : 0 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with Theme and Language Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start mb-8"
        >
          <div className="text-center flex-1">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#F97402] to-[#F13F33] bg-clip-text text-transparent mb-4">
              {isArabic ? `حجز موعد فحص` : `Book Inspection`}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {tenantName}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {isArabic
                ? 'احجز موعد فحص السيارة عبر الإنترنت في بضع خطوات سهلة'
                : 'Book your vehicle inspection online in a few easy steps'}
            </p>
          </div>

          {/* Theme and Language Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2 items-start"
          >
            <ThemeToggle />
            <LanguageSwitcher currentLang={currentLanguage} onToggle={toggleLanguage} />
          </motion.div>
        </motion.div>

        {renderProgressBar()}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mb-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-6 py-4 rounded-2xl shadow-lg"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            {...fadeInUp}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-8 md:p-12"
          >
            {currentStep === 'inspection' && (
              <InspectionTypeSelector
                inspectionTemplates={inspectionTemplates}
                onSelect={handleInspectionSelect}
                language={currentLanguage}
              />
            )}

            {currentStep === 'datetime' && bookingData.inspectionTemplateId && (
              <DateTimePicker
                tenantSlug={tenantSlug}
                inspectionTemplateId={bookingData.inspectionTemplateId}
                advanceBookingDays={bookingSettings.advanceBookingDays}
                onSelect={handleDateTimeSelect}
                onBack={handleBack}
                language={currentLanguage}
              />
            )}

            {currentStep === 'customer' && (
              <CustomerForm
                onSubmit={handleCustomerSubmit}
                onBack={handleBack}
                isSubmitting={isSubmitting}
                language={currentLanguage}
              />
            )}

            {currentStep === 'confirmation' && bookingData.confirmationNumber && (
              <BookingConfirmation
                confirmationNumber={bookingData.confirmationNumber}
                appointmentDate={bookingData.appointmentDate!}
                startTime={bookingData.startTime!}
                serviceName={inspectionTemplates.find(t => t._id?.toString() === bookingData.inspectionTemplateId)?.name || ''}
                requiresApproval={bookingSettings.requireApproval}
                tenantName={tenantName}
                language={currentLanguage}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
