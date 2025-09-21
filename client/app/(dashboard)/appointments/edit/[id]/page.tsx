
import AppointmentForm from '@/components/forms/AppointmentForm';

export default function EditAppointmentPage({ params }: { params: { id: string } }) {
  return (
    <AppointmentForm appointmentId={params.id} />
  );
}
