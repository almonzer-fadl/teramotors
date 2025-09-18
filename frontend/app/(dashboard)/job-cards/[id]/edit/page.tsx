'use client'

import JobCardForm from '@/components/forms/JobCardForm'

export default function EditJobCardPage({ params }: { params: { id: string } }) {
  return <JobCardForm jobCardId={params.id} />
}
