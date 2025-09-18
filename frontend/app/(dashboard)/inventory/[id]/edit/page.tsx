'use client';

import PartForm from '@/components/forms/PartForm';
import { useParams } from 'next/navigation';

export default function EditPartPage() {
  const params = useParams();
  const { id } = params;

  return <PartForm partId={id as string} />;
}