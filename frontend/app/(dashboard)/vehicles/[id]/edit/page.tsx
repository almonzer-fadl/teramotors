'use client';

import VehicleForm from '@/components/forms/VehicleForm';
import { useParams } from 'next/navigation';

export default function EditVehiclePage() {
  const params = useParams();
  const { id } = params;

  return <VehicleForm vehicleId={id as string} />;
}