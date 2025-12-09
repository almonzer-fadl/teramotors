'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, Car, User, Wrench, DollarSign, X } from 'lucide-react';
import StatusBadge from '@/components/dashboard/StatusBadge';
import Modal from '@/components/dashboard/Modal';
import { useToast } from '@/lib/hooks/useToast';
import { useTranslation } from 'react-i18next';

interface Appointment {
  _id: string;
  customerId: { _id: string; firstName: string; lastName: string; };
  vehicleId: { _id: string; make: string; model: string; year: number; };
  mechanicId: { _id: string; firstName: string; lastName: string; };
  serviceId: { _id: string; name: string; };
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  estimatedCost: number;
}

export default function AppointmentDetailPage() {
  const { t } = useTranslation('common');
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { id } = params;

  useEffect(() => {
    if (id) {
      fetchAppointment(id as string);
    }
  }, [id]);

  const fetchAppointment = async (appointmentId: string) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`);
      if (!res.ok) {
        return notFound();
      }
      const data = await res.json();
      setAppointment(data);
    } catch (error) {
      console.error('Failed to fetch appointment', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!appointment) return;

    try {
      const res = await fetch(`/api/appointments/${appointment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (res.ok) {
        addToast(t('appointments.appointment_cancelled_successfully'), 'success');
        router.push('/appointments');
      } else {
        addToast(t('appointments.failed_to_cancel_appointment'), 'error');
      }
    } catch (error) {
      console.error('Failed to cancel appointment', error);
      addToast(t('appointments.failed_to_cancel_appointment'), 'error');
    } finally {
      setCancelModalOpen(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!appointment) {
    return notFound();
  }

  return (
    <div className="p-6">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">{t('appointments.appointment_details')}</h1>
            <StatusBadge status={appointment.status} />
          </div>
          {appointment.status === 'scheduled' && (
            <button 
              onClick={() => setCancelModalOpen(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center"
            >
              <X className="h-4 w-4 me-2" />
              {t('appointments.cancel_appointment')}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">{t('appointments.customer_vehicle')}</h2>
            <p><User className="inline-block h-4 w-4 me-2" /> <Link href={`/customers/${appointment.customerId._id}`} className="text-indigo-600 hover:text-indigo-900">{appointment.customerId.firstName} {appointment.customerId.lastName}</Link></p>
            <p><Car className="inline-block h-4 w-4 me-2" /> <Link href={`/vehicles/${appointment.vehicleId._id}`} className="text-indigo-600 hover:text-indigo-900">{appointment.vehicleId.year} {appointment.vehicleId.make} {appointment.vehicleId.model}</Link></p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">{t('appointments.service_mechanic')}</h2>
            <p><Wrench className="inline-block h-4 w-4 me-2" /> {appointment.serviceId.name}</p>
            <p><User className="inline-block h-4 w-4 me-2" /> {appointment.mechanicId.firstName} {appointment.mechanicId.lastName}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">{t('appointments.date_time')}</h2>
            <p><Calendar className="inline-block h-4 w-4 me-2" /> {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
            <p><Clock className="inline-block h-4 w-4 me-2" /> {appointment.startTime} - {appointment.endTime}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">{t('appointments.cost')}</h2>
            <p><DollarSign className="inline-block h-4 w-4 me-2" /> {t('appointments.estimated')}: ${appointment.estimatedCost.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <Modal isOpen={isCancelModalOpen} onClose={() => setCancelModalOpen(false)} title={t('appointments.confirm_cancellation')}>
        <p>{t('appointments.confirm_cancellation_message')}</p>
        <div className="flex justify-end space-x-4 mt-4">
          <button onClick={() => setCancelModalOpen(false)} className="px-4 py-2 rounded-md border">{t('appointments.no')}</button>
          <button onClick={handleCancel} className="px-4 py-2 rounded-md bg-red-500 text-white">{t('appointments.yes_cancel')}</button>
        </div>
      </Modal>
    </div>
  );
}
