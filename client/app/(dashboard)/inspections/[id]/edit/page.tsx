'use client'

import InspectionForm from '@/components/forms/InspectionForm'
import { useParams } from 'next/navigation'

export default function EditInspectionPage() {
  const params = useParams();
  const id = params.id as string;
  return <InspectionForm inspectionId={id} />
}