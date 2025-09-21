'use client';

import { useState, useEffect } from 'react';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dayjsLocalizer(dayjs);

interface Appointment {
  _id: string;
  title: string;
  start: Date;
  end: Date;
}

export default function AppointmentsCalendarPage() {
  const [events, setEvents] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        const formattedEvents = data.map((apt: any) => ({
          _id: apt._id,
          title: `${apt.vehicleId.make} ${apt.vehicleId.model} - ${apt.serviceId.name}`,
          start: new Date(apt.appointmentDate),
          end: new Date(new Date(apt.appointmentDate).getTime() + 60 * 60 * 1000), // Assuming 1 hour duration
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Appointments Calendar</h1>
      <div style={{ height: '70vh' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
        />
      </div>
    </div>
  );
}
