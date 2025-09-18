
import PartForm from '@/components/forms/PartForm';

export default function EditPartPage({ params }: { params: { id: string } }) {
  return (
    <PartForm partId={params.id} />
  );
}
