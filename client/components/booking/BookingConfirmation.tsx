'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Clock, Wrench, Printer, Home, AlertCircle, Sparkles } from 'lucide-react';

interface BookingConfirmationProps {
  confirmationNumber: string;
  appointmentDate: Date;
  startTime: Date;
  serviceName: string;
  requiresApproval: boolean;
  tenantName: string;
  language?: 'ar' | 'en';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
      delay: 0.2,
    },
  },
};

const sparkleVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: (i: number) => ({
    scale: [0, 1, 0],
    opacity: [0, 1, 0],
    transition: {
      duration: 2,
      delay: i * 0.2,
      repeat: Infinity,
      repeatDelay: 1,
    },
  }),
};

export function BookingConfirmation({
  confirmationNumber,
  appointmentDate,
  startTime,
  serviceName,
  requiresApproval,
  tenantName,
  language = 'en',
}: BookingConfirmationProps) {
  const isArabic = language === 'ar';

  const formattedDate = appointmentDate.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = startTime.toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-center max-w-2xl mx-auto"
    >
      {/* Success Icon with Sparkles */}
      <motion.div variants={itemVariants} className="relative mb-8">
        <div className="relative inline-block">
          {/* Sparkles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={sparkleVariants}
              initial="initial"
              animate="animate"
              className="absolute"
              style={{
                top: `${Math.sin((i * Math.PI) / 3) * 80 + 40}px`,
                left: `${Math.cos((i * Math.PI) / 3) * 80 + 40}px`,
              }}
            >
              <Sparkles className="w-6 h-6 text-[#F97402]" />
            </motion.div>
          ))}

          {/* Main Icon */}
          <motion.div
            variants={iconVariants}
            className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={3} />
            </motion.div>

            {/* Pulse Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-green-400"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        variants={itemVariants}
        className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-4"
      >
        {requiresApproval
          ? isArabic
            ? 'تم استلام طلب الحجز!'
            : 'Booking Request Received!'
          : isArabic
          ? 'تم تأكيد الحجز!'
          : 'Booking Confirmed!'}
      </motion.h2>

      {/* Approval Status */}
      <motion.div variants={itemVariants} className="mb-8">
        {requiresApproval ? (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-800 dark:text-yellow-200 font-medium text-left">
              {isArabic
                ? 'موعدك قيد المراجعة. سنرسل لك بريدًا إلكترونيًا عند تأكيد الموعد.'
                : 'Your appointment is pending approval. We will send you an email once confirmed.'}
            </p>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
            {isArabic
              ? 'تم تأكيد موعدك بنجاح. لقد أرسلنا رسالة تأكيد إلى بريدك الإلكتروني.'
              : 'Your appointment has been confirmed. We have sent a confirmation email to your inbox.'}
          </p>
        )}
      </motion.div>

      {/* Confirmation Details Card */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-[#F97402]/5 to-[#F13F33]/5 dark:from-[#F97402]/10 dark:to-[#F13F33]/10 border-2 border-[#F97402]/20 rounded-3xl p-8 mb-8 shadow-xl"
      >
        {/* Confirmation Number */}
        <div className="mb-6 pb-6 border-b-2 border-[#F97402]/20">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
            {isArabic ? 'رقم التأكيد' : 'Confirmation Number'}
          </p>
          <motion.p
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
            className="text-4xl font-bold bg-gradient-to-r from-[#F97402] to-[#F13F33] bg-clip-text text-transparent"
          >
            {confirmationNumber}
          </motion.p>
        </div>

        {/* Service */}
        <div className="mb-6 pb-6 border-b-2 border-[#F97402]/20">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-5 h-5 text-[#F97402]" />
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {isArabic ? 'الخدمة' : 'Service'}
            </p>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{serviceName}</p>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-[#F97402]" />
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {isArabic ? 'التاريخ' : 'Date'}
              </p>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formattedDate}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-[#F97402]" />
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {isArabic ? 'الوقت' : 'Time'}
              </p>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formattedTime}</p>
          </div>
        </div>
      </motion.div>

      {/* Important Information */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 mb-8 text-left border-2 border-gray-200 dark:border-gray-700"
      >
        <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <div className="w-1.5 h-6 bg-gradient-to-b from-[#F97402] to-[#F13F33] rounded-full" />
          {isArabic ? 'معلومات مهمة:' : 'Important Information:'}
        </h3>
        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 bg-[#F97402] rounded-full mt-2 flex-shrink-0" />
            <span className="font-medium">
              {isArabic
                ? 'يرجى الاحتفاظ برقم التأكيد للرجوع إليه'
                : 'Please keep your confirmation number for reference'}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 bg-[#F97402] rounded-full mt-2 flex-shrink-0" />
            <span className="font-medium">
              {isArabic
                ? 'يرجى الوصول قبل 10 دقائق من موعدك'
                : 'Please arrive 10 minutes before your appointment time'}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-2 h-2 bg-[#F97402] rounded-full mt-2 flex-shrink-0" />
            <span className="font-medium">
              {isArabic
                ? 'إذا كنت بحاجة إلى إلغاء أو إعادة جدولة، يرجى الاتصال بنا مسبقًا'
                : 'If you need to cancel or reschedule, please contact us in advance'}
            </span>
          </li>
        </ul>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
        <motion.button
          onClick={() => window.print()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-4 border-2 border-[#F97402] text-[#F97402] rounded-xl font-semibold hover:bg-[#F97402]/5 transition-all flex items-center justify-center gap-3"
        >
          <Printer className="w-5 h-5" />
          {isArabic ? 'طباعة' : 'Print'}
        </motion.button>

        <motion.button
          onClick={() => (window.location.href = '/')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-4 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#F97402]/25 hover:shadow-xl hover:shadow-[#F97402]/30"
        >
          <Home className="w-5 h-5" />
          {isArabic ? 'العودة إلى الصفحة الرئيسية' : 'Back to Home'}
        </motion.button>
      </motion.div>

      {/* Thank You Message */}
      <motion.p
        variants={itemVariants}
        className="mt-10 text-gray-600 dark:text-gray-400 text-lg font-medium"
      >
        {isArabic ? `شكراً لاختيارك ${tenantName}` : `Thank you for choosing ${tenantName}`}
      </motion.p>
    </motion.div>
  );
}
