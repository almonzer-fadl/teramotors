'use client'

import InspectionForm from '@/components/forms/InspectionForm'

export default function EditInspectionPage({ params }: { params: { id: string } }) {
  return <InspectionForm inspectionId={params.id} />
}
