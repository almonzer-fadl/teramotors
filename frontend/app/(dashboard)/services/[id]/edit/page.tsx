'use client';

import ServiceForm from '@/components/forms/ServiceForm';
import { useParams } from 'next/navigation';

export default function EditServicePage() {
  const params = useParams();
  const { id } = params;

  return <ServiceForm serviceId={id as string} />;
}