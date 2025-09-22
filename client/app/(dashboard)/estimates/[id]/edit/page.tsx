'use client'

import EstimateForm from '@/components/forms/EstimateForm'
import { useParams } from 'next/navigation'

export default function EditEstimatePage() {
  const params = useParams();
  const id = params.id as string;
  return <EstimateForm estimateId={id} />
}
