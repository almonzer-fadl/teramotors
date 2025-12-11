'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, AlertCircle, ArrowRight, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateTimePickerProps {
  tenantSlug: string;
  inspectionTemplateId?: string;
  serviceId?: string;
  advanceBookingDays: number;
  onSelect: (appointmentDate: Date, startTime: Date, notes?: string) => void;
  onBack: () => void;
  language?: 'ar' | 'en';
}

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

const slotVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (custom: unknown) => {
    const index = typeof custom === 'number' ? custom : 0;
    return {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.03,
        type: 'spring' as const,
        stiffness: 300,
        damping: 24,
      },
    };
  },
};

export function DateTimePicker({
  tenantSlug,
  inspectionTemplateId,
  advanceBookingDays,
  onSelect,
  onBack,
  language = 'en',
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const isArabic = language === 'ar';

  // Generate calendar grid for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateAvailable = (date: Date | null) => {
    if (!date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + advanceBookingDays);

    date.setHours(0, 0, 0, 0);

    return date >= tomorrow && date <= maxDate;
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const calendarDays = getCalendarDays();
  const weekDays = isArabic
    ? ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async (date: Date) => {
    setIsLoadingSlots(true);
    setError(null);
    setSelectedTimeSlot(null);

    try {
      const dateStr = date.toISOString().split('T')[0];
      const url = `/api/public/tenants/${tenantSlug}/available-slots?date=${dateStr}`;
      console.log('Fetching slots from:', url);

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch available slots');
      }

      const data = await response.json();
      console.log('Received slots data:', data);
      setAvailableSlots(data.slots || []);
    } catch (err: any) {
      console.error('Error fetching slots:', err);
      setError(err.message || 'Failed to load available time slots');
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleContinue = () => {
    if (selectedDate && selectedTimeSlot) {
      onSelect(selectedDate, new Date(selectedTimeSlot), notes);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-8"
      >
        {isArabic ? 'اختر التاريخ والوقت' : 'Choose Date & Time'}
      </motion.h2>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isArabic ? 'اختر التاريخ' : 'Select Date'}
            </h3>
          </div>

          {/* Month/Year Navigation */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigateMonth('prev')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 hover:bg-gradient-to-br hover:from-[#F97402]/10 hover:to-[#F13F33]/10"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </motion.button>

            <div className="text-center min-w-[160px]">
              <h4 className="text-lg font-bold bg-gradient-to-r from-[#F97402] to-[#F13F33] bg-clip-text text-transparent">
                {currentMonth.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h4>
            </div>

            <motion.button
              onClick={() => navigateMonth('next')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 hover:bg-gradient-to-br hover:from-[#F97402]/10 hover:to-[#F13F33]/10"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="text-center text-sm font-bold text-gray-500 dark:text-gray-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-7 gap-2"
          >
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isAvailable = isDateAvailable(date);
              const isTodayDate = isToday(date);

              return (
                <motion.button
                  key={index}
                  variants={itemVariants}
                  onClick={() => isAvailable && setSelectedDate(date)}
                  disabled={!isAvailable}
                  whileHover={isAvailable ? { scale: 1.1, y: -2 } : {}}
                  whileTap={isAvailable ? { scale: 0.95 } : {}}
                  className={`relative aspect-square rounded-xl text-center overflow-hidden flex items-center justify-center ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/30 border-2 border-[#F97402]'
                      : isAvailable
                      ? 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-[#F97402] hover:bg-gradient-to-br hover:from-[#F97402]/10 hover:to-[#F13F33]/10'
                      : isTodayDate
                      ? 'bg-gray-100 dark:bg-gray-800 border-2 border-blue-400 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-700 cursor-not-allowed'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="selectedDateBg"
                      className="absolute inset-0 bg-gradient-to-br from-[#F97402] to-[#F13F33]"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10">
                    <div className={`text-lg font-bold ${
                      isSelected
                        ? 'text-white'
                        : isAvailable
                        ? 'text-gray-900 dark:text-white'
                        : isTodayDate
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-300 dark:text-gray-700'
                    }`}>
                      {date.getDate()}
                    </div>
                    {isTodayDate && !isSelected && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </motion.div>

      {/* Time Slot Selection */}
      {selectedDate && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isArabic ? 'اختر الوقت' : 'Select Time'}
            </h3>
          </div>

          {isLoadingSlots ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <Loader2 className="w-12 h-12 text-[#F97402] animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {isArabic ? 'جاري تحميل الأوقات المتاحة...' : 'Loading available times...'}
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800"
            >
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mb-4" />
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            </motion.div>
          ) : availableSlots.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-gray-200 dark:border-gray-700"
            >
              <CalendarIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {isArabic ? 'لا توجد أوقات متاحة في هذا التاريخ' : 'No available times on this date'}
              </p>
            </motion.div>
          ) : (
            <div
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3"
            >
              {availableSlots.map((slot, index) => {
                const isSelected = selectedTimeSlot === slot.start;

                const handleTimeSlotClick = () => {
                  if (slot.available) {
                    setSelectedTimeSlot(slot.start);
                  }
                };

                return (
                  <button
                    key={`${slot.start}-${index}`}
                    onClick={handleTimeSlotClick}
                    disabled={!slot.available}
                    className={`relative p-4 rounded-xl border-2 text-center overflow-hidden transition-all ${
                      isSelected
                        ? 'border-[#F97402] bg-gradient-to-br from-[#F97402]/20 to-[#F13F33]/20 shadow-lg shadow-[#F97402]/30'
                        : slot.available
                        ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-[#F97402]/50 hover:bg-gradient-to-br hover:from-[#F97402]/10 hover:to-[#F13F33]/10'
                        : 'border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {isSelected && (
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-[#F97402]/10 to-[#F13F33]/10"
                      />
                    )}
                    <div className="relative z-10">
                      <div className={`text-lg font-bold leading-tight ${
                        isSelected
                          ? 'text-[#F97402]'
                          : slot.available
                          ? 'text-gray-900 dark:text-gray-100'
                          : 'text-gray-500'
                      }`}>
                        {formatTime(slot.start)}
                      </div>
                      {!slot.available && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                          {isArabic ? 'محجوز' : 'Booked'}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <AnimatePresence>
        {selectedTimeSlot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-10"
          >
            <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {isArabic ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97402] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-all shadow-md resize-none"
              rows={4}
              placeholder={
                isArabic
                  ? 'أخبرنا بأي تفاصيل إضافية عن السيارة أو الفحص المطلوب'
                  : 'Tell us any additional details about your vehicle or inspection needed'
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-between gap-4"
      >
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02, x: -3 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:bg-gradient-to-br hover:from-gray-100/80 hover:to-gray-200/80 dark:hover:from-gray-700/80 dark:hover:to-gray-800/80 flex items-center gap-2 shadow-lg"
        >
          <ArrowLeft className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} />
          {isArabic ? 'رجوع' : 'Back'}
        </motion.button>
        <motion.button
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTimeSlot}
          whileHover={selectedDate && selectedTimeSlot ? { scale: 1.02, x: 3 } : {}}
          whileTap={selectedDate && selectedTimeSlot ? { scale: 0.98 } : {}}
          className={`px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 shadow-lg backdrop-blur-xl ${
            selectedDate && selectedTimeSlot
              ? 'bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white hover:shadow-xl hover:shadow-[#F97402]/30'
              : 'bg-gray-200/80 dark:bg-gray-700/80 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          {isArabic ? 'التالي' : 'Continue'}
          <ArrowRight className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} />
        </motion.button>
      </motion.div>
    </div>
  );
}
