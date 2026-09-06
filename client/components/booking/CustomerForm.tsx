'use client';

import { useState } from 'react';
import { useForm, FieldValues, UseFormRegister, FormState, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { User, Mail, Phone, Car, Calendar, Hash, FileText, ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import type { BookingCustomerInput, BookingVehicleInput } from '@/lib/validation/booking';

interface CustomerFormProps {
  onSubmit: (customer: BookingCustomerInput, vehicle: BookingVehicleInput) => void;
  onBack: () => void;
  isSubmitting: boolean;
  language?: 'ar' | 'en';
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

const formSchema = (isArabic: boolean) => z.object({
  firstName: z.string().min(2, { message: isArabic ? 'الاسم الأول يجب أن يكون حرفين على الأقل' : 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: isArabic ? 'اسم العائلة يجب أن يكون حرفين على الأقل' : 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: isArabic ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address' }),
  phone: z.string().min(10, { message: isArabic ? 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل' : 'Phone number must be at least 10 digits' }),
  language: z.enum(['en', 'ar']),
  vehicleMake: z.string().min(2, { message: isArabic ? 'ماركة السيارة مطلوبة' : 'Vehicle make is required' }),
  vehicleModel: z.string().min(1, { message: isArabic ? 'موديل السيارة مطلوب' : 'Vehicle model is required' }),
  vehicleYear: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().min(1900, { message: isArabic ? 'سنة الصنع غير صحيحة' : 'Invalid vehicle year' }).max(new Date().getFullYear() + 1, { message: isArabic ? 'سنة الصنع غير صحيحة' : 'Invalid vehicle year' })
  ),
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
});

type FormData = z.infer<ReturnType<typeof formSchema>>;

const InputField = ({
  name,
  label,
  icon: Icon,
  register,
  errors,
  watchedValue,
  type = 'text',
  placeholder,
  required = false,
  colSpan = 1,
}: {
  name: keyof FormData;
  label: string;
  icon: any;
  register: UseFormRegister<FormData>;
  errors: FormState<FormData>['errors'];
  watchedValue: string | number | undefined;
  type?: string;
  placeholder?: string;
  required?: boolean;
  colSpan?: number;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue =
    watchedValue !== undefined &&
    watchedValue !== null &&
    watchedValue.toString().length > 0;
  const hasError = !!errors[name];

  return (
    <motion.div variants={itemVariants} className={colSpan === 2 ? 'md:col-span-2' : ''}>
      <div className="relative">
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all ${hasError ? 'text-red-600 dark:text-red-400' : isFocused ? 'text-[#F97402]' : 'text-gray-400 dark:text-gray-500'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <input
          {...register(name, {
            valueAsNumber: type === 'number',
          })}
          type={type}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          min={name === 'vehicleYear' ? '1900' : undefined}
          max={name === 'vehicleYear' ? new Date().getFullYear() + 1 : undefined}
          className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none transition-all bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-transparent ${
            hasError
              ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
              : isFocused
              ? 'border-[#F97402] ring-2 ring-[#F97402]/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        />
        <label
          className={`absolute left-12 transition-all pointer-events-none bg-white dark:bg-gray-800/50
            ${
              hasValue || isFocused
                ? '-top-2.5 text-xs font-semibold px-2'
                : 'top-1/2 -translate-y-1/2 text-base'
            } 
            ${
              hasError
                ? 'text-red-600 dark:text-red-400'
                : isFocused
                ? 'text-[#F97402]'
                : 'text-gray-500 dark:text-gray-400'
            }`}
        >
          {label}
          {required && ' *'}
        </label>
      </div>
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-1.5 mt-2 text-red-600 dark:text-red-400 text-sm font-medium"
          >
            <AlertCircle className="w-4 h-4" />
            {errors[name]?.message}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


export function CustomerForm({ onSubmit, onBack, isSubmitting, language = 'en' }: CustomerFormProps) {
  const isArabic = language === 'ar';

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema(isArabic)) as Resolver<FormData>,
    defaultValues: {
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
    },
  });

  const watchedFields = watch();

  const processSubmit = (data: FormData) => {
    const customer: BookingCustomerInput = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      language: data.language,
    };

    const vehicle: BookingVehicleInput = {
      make: data.vehicleMake,
      model: data.vehicleModel,
      year: data.vehicleYear,
      licensePlate: data.licensePlate || undefined,
      vin: data.vin || undefined,
    };

    onSubmit(customer, vehicle);
  };

  return (
    <div>
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-8"
      >
        {isArabic ? 'معلوماتك' : 'Your Information'}
      </motion.h2>

      <form onSubmit={handleSubmit(processSubmit)}>
        {/* Customer Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isArabic ? 'المعلومات الشخصية' : 'Personal Information'}
            </h3>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <InputField name="firstName" label={isArabic ? 'الاسم الأول' : 'First Name'} icon={User} required register={register} errors={errors} watchedValue={watchedFields.firstName} />
            <InputField name="lastName" label={isArabic ? 'اسم العائلة' : 'Last Name'} icon={User} required register={register} errors={errors} watchedValue={watchedFields.lastName} />
            <InputField name="email" label={isArabic ? 'البريد الإلكتروني' : 'Email'} icon={Mail} type="email" required register={register} errors={errors} watchedValue={watchedFields.email} />
            <InputField name="phone" label={isArabic ? 'رقم الهاتف' : 'Phone Number'} icon={Phone} type="tel" placeholder="+966553022102" required register={register} errors={errors} watchedValue={watchedFields.phone} />
          </motion.div>
        </motion.div>

        {/* Vehicle Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
              <Car className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isArabic ? 'معلومات السيارة' : 'Vehicle Information'}
            </h3>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <InputField name="vehicleMake" label={isArabic ? 'الماركة' : 'Make'} icon={Car} placeholder={isArabic ? 'مثال: تويوتا' : 'e.g., Toyota'} required register={register} errors={errors} watchedValue={watchedFields.vehicleMake} />
            <InputField name="vehicleModel" label={isArabic ? 'الموديل' : 'Model'} icon={FileText} placeholder={isArabic ? 'مثال: كامري' : 'e.g., Camry'} required register={register} errors={errors} watchedValue={watchedFields.vehicleModel} />
            <InputField name="vehicleYear" label={isArabic ? 'سنة الصنع' : 'Year'} icon={Calendar} type="number" required register={register} errors={errors} watchedValue={watchedFields.vehicleYear} />
            <InputField name="licensePlate" label={`${isArabic ? 'رقم اللوحة' : 'License Plate'} (${isArabic ? 'اختياري' : 'Optional'})`} icon={Hash} register={register} errors={errors} watchedValue={watchedFields.licensePlate} />
            <InputField name="vin" label={`${isArabic ? 'رقم الهيكل (VIN)' : 'VIN'} (${isArabic ? 'اختياري' : 'Optional'})`} icon={Hash} colSpan={2} register={register} errors={errors} watchedValue={watchedFields.vin} />
          </motion.div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between gap-4"
        >
          <motion.button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <ArrowLeft className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} />
            {isArabic ? 'رجوع' : 'Back'}
          </motion.button>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            className="px-8 py-4 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white rounded-xl font-semibold text-lg transition-all disabled:opacity-70 flex items-center gap-3 shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/30"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting
              ? isArabic
                ? 'جاري الحجز...'
                : 'Booking...'
              : isArabic
              ? 'تأكيد الحجز'
              : 'Confirm Booking'}
            {!isSubmitting && <ArrowRight className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} />}
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
}
