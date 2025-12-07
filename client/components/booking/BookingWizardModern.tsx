'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ServiceSelector } from './ServiceSelector';
import { DateTimePicker } from './DateTimePicker';
import { CustomerForm } from './CustomerForm';
import { BookingConfirmation } from './BookingConfirmation';
import type { IService } from '@/lib/models/Service';
import type { BookingCustomerInput, BookingVehicleInput } from '@/lib/validation/booking';
import { Check } from 'lucide-react';

interface BookingWizardProps {
  tenantSlug: string;
  tenantName: string;
  services: IService[];
  bookingSettings: {
    workingHours: any;
    appointmentDuration: number;
    advanceBookingDays: number;
    requireApproval: boolean;
  };
  language?: 'ar' | 'en';
}

export type WizardStep = 'service' | 'datetime' | 'customer' | 'confirmation';

interface BookingState {
  serviceId?: string;
  appointmentDate?: Date;
  startTime?: Date;
  notes?: string;
  customer?: BookingCustomerInput;
  vehicle?: BookingVehicleInput;
  confirmationNumber?: string;
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
  services,
  bookingSettings,
  language = 'en',
}: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('service');
  const [bookingData, setBookingData] = useState<BookingState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isArabic = language === 'ar';

  const steps: WizardStep[] = ['service', 'datetime', 'customer', 'confirmation'];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleServiceSelect = (serviceId: string) => {
    setBookingData({ ...bookingData, serviceId });
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
          serviceId: bookingData.serviceId,
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
    service: isArabic ? 'اختر الخدمة' : 'Select Service',
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#F97402] to-[#F13F33] bg-clip-text text-transparent mb-4">
            {isArabic ? `حجز موعد` : `Book Appointment`}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {tenantName}
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isArabic
              ? 'احجز موعدك عبر الإنترنت في بضع خطوات سهلة'
              : 'Book your appointment online in a few easy steps'}
          </p>
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
            {currentStep === 'service' && (
              <ServiceSelector
                services={services}
                onSelect={handleServiceSelect}
                language={language}
              />
            )}

            {currentStep === 'datetime' && bookingData.serviceId && (
              <DateTimePicker
                tenantSlug={tenantSlug}
                serviceId={bookingData.serviceId}
                advanceBookingDays={bookingSettings.advanceBookingDays}
                onSelect={handleDateTimeSelect}
                onBack={handleBack}
                language={language}
              />
            )}

            {currentStep === 'customer' && (
              <CustomerForm
                onSubmit={handleCustomerSubmit}
                onBack={handleBack}
                isSubmitting={isSubmitting}
                language={language}
              />
            )}

            {currentStep === 'confirmation' && bookingData.confirmationNumber && (
              <BookingConfirmation
                confirmationNumber={bookingData.confirmationNumber}
                appointmentDate={bookingData.appointmentDate!}
                startTime={bookingData.startTime!}
                serviceName={services.find(s => s._id?.toString() === bookingData.serviceId)?.name || ''}
                requiresApproval={bookingSettings.requireApproval}
                tenantName={tenantName}
                language={language}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
