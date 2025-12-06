'use client';

import { useState } from 'react';
import type { BookingCustomerInput, BookingVehicleInput } from '@/lib/validation/booking';

interface CustomerFormProps {
  onSubmit: (customer: BookingCustomerInput, vehicle: BookingVehicleInput) => void;
  onBack: () => void;
  isSubmitting: boolean;
  language?: 'ar' | 'en';
}

export function CustomerForm({ onSubmit, onBack, isSubmitting, language = 'en' }: CustomerFormProps) {
  const isArabic = language === 'ar';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    language: language,
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: new Date().getFullYear(),
    licensePlate: '',
    vin: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.firstName.trim().length < 2) {
      newErrors.firstName = isArabic
        ? 'الاسم الأول يجب أن يكون حرفين على الأقل'
        : 'First name must be at least 2 characters';
    }

    if (formData.lastName.trim().length < 2) {
      newErrors.lastName = isArabic
        ? 'اسم العائلة يجب أن يكون حرفين على الأقل'
        : 'Last name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = isArabic ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address';
    }

    if (formData.phone.length < 10) {
      newErrors.phone = isArabic
        ? 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل'
        : 'Phone number must be at least 10 digits';
    }

    if (formData.vehicleMake.trim().length < 2) {
      newErrors.vehicleMake = isArabic ? 'ماركة السيارة مطلوبة' : 'Vehicle make is required';
    }

    if (formData.vehicleModel.trim().length < 1) {
      newErrors.vehicleModel = isArabic ? 'موديل السيارة مطلوب' : 'Vehicle model is required';
    }

    const currentYear = new Date().getFullYear();
    if (formData.vehicleYear < 1900 || formData.vehicleYear > currentYear + 1) {
      newErrors.vehicleYear = isArabic ? 'سنة الصنع غير صحيحة' : 'Invalid vehicle year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const customer: BookingCustomerInput = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      language: formData.language as 'ar' | 'en',
    };

    const vehicle: BookingVehicleInput = {
      make: formData.vehicleMake,
      model: formData.vehicleModel,
      year: Number(formData.vehicleYear),
      licensePlate: formData.licensePlate || undefined,
      vin: formData.vin || undefined,
    };

    onSubmit(customer, vehicle);
  };

  const inputClass = (fieldName: string) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
      errors[fieldName]
        ? 'border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:ring-blue-600'
    }`;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">
        {isArabic ? 'معلوماتك' : 'Your Information'}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Customer Information */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">
            {isArabic ? 'المعلومات الشخصية' : 'Personal Information'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'الاسم الأول' : 'First Name'} *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={inputClass('firstName')}
                required
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'اسم العائلة' : 'Last Name'} *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={inputClass('lastName')}
                required
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'البريد الإلكتروني' : 'Email'} *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass('email')}
                required
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'رقم الهاتف' : 'Phone Number'} *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={inputClass('phone')}
                placeholder="+966xxxxxxxxx"
                required
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">
            {isArabic ? 'معلومات السيارة' : 'Vehicle Information'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'الماركة' : 'Make'} *
              </label>
              <input
                type="text"
                name="vehicleMake"
                value={formData.vehicleMake}
                onChange={handleChange}
                className={inputClass('vehicleMake')}
                placeholder={isArabic ? 'مثال: تويوتا' : 'e.g., Toyota'}
                required
              />
              {errors.vehicleMake && (
                <p className="text-red-500 text-sm mt-1">{errors.vehicleMake}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'الموديل' : 'Model'} *
              </label>
              <input
                type="text"
                name="vehicleModel"
                value={formData.vehicleModel}
                onChange={handleChange}
                className={inputClass('vehicleModel')}
                placeholder={isArabic ? 'مثال: كامري' : 'e.g., Camry'}
                required
              />
              {errors.vehicleModel && (
                <p className="text-red-500 text-sm mt-1">{errors.vehicleModel}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'سنة الصنع' : 'Year'} *
              </label>
              <input
                type="number"
                name="vehicleYear"
                value={formData.vehicleYear}
                onChange={handleChange}
                className={inputClass('vehicleYear')}
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />
              {errors.vehicleYear && (
                <p className="text-red-500 text-sm mt-1">{errors.vehicleYear}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'رقم اللوحة' : 'License Plate'} ({isArabic ? 'اختياري' : 'Optional'})
              </label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                className={inputClass('licensePlate')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                {isArabic ? 'رقم الهيكل (VIN)' : 'VIN'} ({isArabic ? 'اختياري' : 'Optional'})
              </label>
              <input
                type="text"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                className={inputClass('vin')}
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isArabic ? 'رجوع' : 'Back'}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            )}
            {isSubmitting
              ? isArabic
                ? 'جاري الحجز...'
                : 'Booking...'
              : isArabic
              ? 'تأكيد الحجز'
              : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}
