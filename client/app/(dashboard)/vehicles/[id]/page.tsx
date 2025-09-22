import { notFound } from 'next/navigation';
import VehicleDetail from './VehicleDetail';

async function getVehicle(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/vehicles/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    return notFound();
  }
  return res.json();
}

export default async function VehicleDetailPage({ params }: { params: { id: string } }) {
  const vehicle = await getVehicle(params.id);

  return <VehicleDetail vehicle={vehicle} />;
}