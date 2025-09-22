'use client'

import JobCardForm from '@/components/forms/JobCardForm'
import { useParams } from 'next/navigation'

export default function EditJobCardPage() {
  const params = useParams();
  const id = params.id as string;
  return <JobCardForm jobCardId={id} />
}