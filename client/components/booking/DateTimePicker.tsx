'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, AlertCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

interface DateTimePickerProps {
  tenantSlug: string;
  serviceId: string;
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const slotVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.03,
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  }),
};

export function DateTimePicker({
  tenantSlug,
  serviceId,
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

  const isArabic = language === 'ar';

  // Generate available dates (from tomorrow to advanceBookingDays)
  const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= advanceBookingDays; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const availableDates = getAvailableDates();

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
      const response = await fetch(
        `/api/public/tenants/${tenantSlug}/available-slots?date=${dateStr}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }

      const data = await response.json();
      setAvailableSlots(data.slots || []);
    } catch (err: any) {
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

      {/* Date Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isArabic ? 'اختر التاريخ' : 'Select Date'}
          </h3>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3"
        >
          {availableDates.map((date, index) => {
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            return (
              <motion.button
                key={index}
                variants={itemVariants}
                onClick={() => setSelectedDate(date)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`relative p-4 rounded-xl border-2 text-center transition-all overflow-hidden ${
                  isSelected
                    ? 'border-[#F97402] bg-gradient-to-br from-[#F97402]/10 to-[#F13F33]/10 shadow-lg shadow-[#F97402]/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-[#F97402]/30'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="selectedDate"
                    className="absolute inset-0 bg-gradient-to-br from-[#F97402]/5 to-[#F13F33]/5"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative z-10">
                  <div className={`text-xs font-medium ${isSelected ? 'text-[#F97402]' : 'text-gray-600 dark:text-gray-400'}`}>
                    {date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-2xl font-bold mt-1 ${isSelected ? 'text-[#F97402]' : 'text-gray-900 dark:text-white'}`}>
                    {date.getDate()}
                  </div>
                  <div className={`text-xs font-medium mt-1 ${isSelected ? 'text-[#F13F33]' : 'text-gray-600 dark:text-gray-400'}`}>
                    {date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { month: 'short' })}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Time Slot Selection */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-10"
          >
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
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3"
              >
                {availableSlots.map((slot, index) => {
                  const isSelected = selectedTimeSlot === slot.start;
                  return (
                    <motion.button
                      key={index}
                      custom={index}
                      variants={slotVariants}
                      onClick={() => slot.available && setSelectedTimeSlot(slot.start)}
                      disabled={!slot.available}
                      whileHover={slot.available ? { scale: 1.05, y: -2 } : {}}
                      whileTap={slot.available ? { scale: 0.95 } : {}}
                      className={`relative p-4 rounded-xl border-2 text-center transition-all overflow-hidden ${
                        isSelected
                          ? 'border-[#F97402] bg-gradient-to-br from-[#F97402]/10 to-[#F13F33]/10 shadow-lg shadow-[#F97402]/20'
                          : slot.available
                          ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-[#F97402]/30'
                          : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="selectedTime"
                          className="absolute inset-0 bg-gradient-to-br from-[#F97402]/5 to-[#F13F33]/5"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <div className="relative z-10">
                        <div className={`text-lg font-bold ${isSelected ? 'text-[#F97402]' : slot.available ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                          {formatTime(slot.start)}
                        </div>
                        {!slot.available && (
                          <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                            {isArabic ? 'محجوز' : 'Booked'}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
              className="w-full px-5 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97402] focus:border-transparent bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
              rows={4}
              placeholder={
                isArabic
                  ? 'أخبرنا بأي تفاصيل إضافية عن السيارة أو الخدمة المطلوبة'
                  : 'Tell us any additional details about your vehicle or service needed'
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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <ArrowLeft className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} />
          {isArabic ? 'رجوع' : 'Back'}
        </motion.button>
        <motion.button
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTimeSlot}
          whileHover={selectedDate && selectedTimeSlot ? { scale: 1.02 } : {}}
          whileTap={selectedDate && selectedTimeSlot ? { scale: 0.98 } : {}}
          className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center gap-3 shadow-lg ${
            selectedDate && selectedTimeSlot
              ? 'bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white hover:shadow-xl hover:shadow-[#F97402]/25'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          {isArabic ? 'التالي' : 'Continue'}
          <ArrowRight className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} />
        </motion.button>
      </motion.div>
    </div>
  );
}
