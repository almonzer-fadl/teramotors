'use client';

interface BookingConfirmationProps {
  confirmationNumber: string;
  appointmentDate: Date;
  startTime: Date;
  serviceName: string;
  requiresApproval: boolean;
  tenantName: string;
  language?: 'ar' | 'en';
}

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
    <div className="text-center">
      {/* Success Icon */}
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-12 h-12 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        {requiresApproval
          ? isArabic
            ? 'تم استلام طلب الحجز!'
            : 'Booking Request Received!'
          : isArabic
          ? 'تم تأكيد الحجز!'
          : 'Booking Confirmed!'}
      </h2>

      {requiresApproval ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            {isArabic
              ? 'موعدك قيد المراجعة. سنرسل لك بريدًا إلكترونيًا عند تأكيد الموعد.'
              : 'Your appointment is pending approval. We will send you an email once confirmed.'}
          </p>
        </div>
      ) : (
        <p className="text-gray-600 mb-6">
          {isArabic
            ? 'تم تأكيد موعدك بنجاح. لقد أرسلنا رسالة تأكيد إلى بريدك الإلكتروني.'
            : 'Your appointment has been confirmed. We have sent a confirmation email to your inbox.'}
        </p>
      )}

      {/* Confirmation Details */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              {isArabic ? 'رقم التأكيد' : 'Confirmation Number'}
            </p>
            <p className="text-2xl font-bold text-blue-600">{confirmationNumber}</p>
          </div>

          <div className="border-t border-blue-200 pt-4">
            <p className="text-sm text-gray-600 mb-1">{isArabic ? 'الخدمة' : 'Service'}</p>
            <p className="text-lg font-semibold">{serviceName}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-blue-200 pt-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">{isArabic ? 'التاريخ' : 'Date'}</p>
              <p className="font-semibold">{formattedDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">{isArabic ? 'الوقت' : 'Time'}</p>
              <p className="font-semibold">{formattedTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Information */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
        <h3 className="font-semibold text-lg mb-3">
          {isArabic ? 'معلومات مهمة:' : 'Important Information:'}
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>
              {isArabic
                ? 'يرجى الاحتفاظ برقم التأكيد للرجوع إليه'
                : 'Please keep your confirmation number for reference'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>
              {isArabic
                ? 'يرجى الوصول قبل 10 دقائق من موعدك'
                : 'Please arrive 10 minutes before your appointment time'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>
              {isArabic
                ? 'إذا كنت بحاجة إلى إلغاء أو إعادة جدولة، يرجى الاتصال بنا مسبقًا'
                : 'If you need to cancel or reschedule, please contact us in advance'}
            </span>
          </li>
        </ul>
      </div>

      {/* Print/Share Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          {isArabic ? 'طباعة' : 'Print'}
        </button>

        <button
          onClick={() => (window.location.href = '/')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {isArabic ? 'العودة إلى الصفحة الرئيسية' : 'Back to Home'}
        </button>
      </div>

      {/* Contact Info */}
      <p className="mt-8 text-gray-600 text-sm">
        {isArabic
          ? `شكراً لاختيارك ${tenantName}`
          : `Thank you for choosing ${tenantName}`}
      </p>
    </div>
  );
}
