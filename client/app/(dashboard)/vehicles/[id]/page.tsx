'use client';

import { useParams } from 'next/navigation';
import VehicleDetail from './VehicleDetail';

export default function VehicleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return <VehicleDetail vehicleId={id} />;
}
