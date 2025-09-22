/* eslint-disable @next/next/no-async-client-component */
'use client'
import AppointmentForm from '@/components/forms/AppointmentForm';

export default async function EditAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AppointmentForm appointmentId={id} />;
}
