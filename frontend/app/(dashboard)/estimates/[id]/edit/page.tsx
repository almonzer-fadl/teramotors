'use client'

import EstimateForm from '@/components/forms/EstimateForm'

export default function EditEstimatePage({ params }: { params: { id: string } }) {
  return <EstimateForm estimateId={params.id} />
}
