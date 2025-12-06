'use client';

import { useState } from 'react';
import { ServiceSelector } from './ServiceSelector';
import { DateTimePicker } from './DateTimePicker';
import { CustomerForm } from './CustomerForm';
import { BookingConfirmation } from './BookingConfirmation';
import type { IService } from '@/lib/models/Service';
import type { BookingCustomerInput, BookingVehicleInput } from '@/lib/validation/booking';

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

  const renderProgressBar = () => {
    const stepLabels = {
      service: isArabic ? 'اختر الخدمة' : 'Select Service',
      datetime: isArabic ? 'اختر التاريخ والوقت' : 'Choose Date & Time',
      customer: isArabic ? 'معلوماتك' : 'Your Information',
      confirmation: isArabic ? 'التأكيد' : 'Confirmation',
    };

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    index <= currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="mt-2 text-xs font-medium text-gray-600">
                  {stepLabels[step]}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-2">
          {isArabic ? `حجز موعد - ${tenantName}` : `Book Appointment - ${tenantName}`}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {isArabic
            ? 'احجز موعدك عبر الإنترنت في بضع خطوات سهلة'
            : 'Book your appointment online in a few easy steps'}
        </p>

        {renderProgressBar()}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

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
      </div>
    </div>
  );
}
