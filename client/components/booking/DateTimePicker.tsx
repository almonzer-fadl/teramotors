'use client';

import { useState, useEffect } from 'react';

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
      <h2 className="text-2xl font-semibold mb-6">
        {isArabic ? 'اختر التاريخ والوقت' : 'Choose Date & Time'}
      </h2>

      {/* Date Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">
          {isArabic ? 'اختر التاريخ' : 'Select Date'}
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {availableDates.map((date, index) => {
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-xs text-gray-600">
                  {date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { weekday: 'short' })}
                </div>
                <div className="text-lg font-semibold mt-1">{date.getDate()}</div>
                <div className="text-xs text-gray-600">
                  {date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { month: 'short' })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slot Selection */}
      {selectedDate && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">
            {isArabic ? 'اختر الوقت' : 'Select Time'}
          </h3>

          {isLoadingSlots ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">
                {isArabic ? 'جاري تحميل الأوقات المتاحة...' : 'Loading available times...'}
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              {isArabic
                ? 'لا توجد أوقات متاحة في هذا التاريخ'
                : 'No available times on this date'}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {availableSlots.map((slot, index) => {
                const isSelected = selectedTimeSlot === slot.start;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedTimeSlot(slot.start)}
                    disabled={!slot.available}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : slot.available
                        ? 'border-gray-200 hover:border-blue-300'
                        : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="font-semibold">{formatTime(slot.start)}</div>
                    {!slot.available && (
                      <div className="text-xs text-red-600 mt-1">
                        {isArabic ? 'محجوز' : 'Booked'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {selectedTimeSlot && (
        <div className="mb-8">
          <label className="block text-lg font-medium mb-2">
            {isArabic ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows={4}
            placeholder={
              isArabic
                ? 'أخبرنا بأي تفاصيل إضافية عن السيارة أو الخدمة المطلوبة'
                : 'Tell us any additional details about your vehicle or service needed'
            }
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          {isArabic ? 'رجوع' : 'Back'}
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTimeSlot}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {isArabic ? 'التالي' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
