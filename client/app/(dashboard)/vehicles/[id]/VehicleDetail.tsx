'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function VehicleDetail({ vehicleId }: { vehicleId: string }) {
  const { t } = useTranslation('common');
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getVehicle() {
      if (!vehicleId) return;
      const res = await fetch(`/api/vehicles/${vehicleId}`);
      if (!res.ok) {
        setVehicle(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setVehicle(data);
      setLoading(false);
    }
    getVehicle();
  }, [vehicleId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!vehicle) {
    return <div>Vehicle not found</div>;
  }

  return (
    <div className="p-6">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{vehicle.year} {vehicle.make} {vehicle.model}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>{t('vehicles.vin')}</strong> {vehicle.vin}</p>
            <p><strong>{t('vehicles.license_plate')}:</strong> {vehicle.licensePlate}</p>
            <p><strong>{t('vehicles.mileage')}:</strong> {vehicle.mileage}</p>
          </div>
          <div>
            <p><strong>{t('vehicles.owner')}:</strong> <Link href={`/customers/${vehicle.customerId._id}`} className="text-indigo-600 hover:text-indigo-900">{vehicle.customerId.firstName} {vehicle.customerId.lastName}</Link></p>
            <p><strong>{t('vehicles.engine')}</strong> {vehicle.engineType}</p>
            <p><strong>{t('vehicles.transmission')}:</strong> {vehicle.transmission}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">{t('vehicles.service_history')}</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vehicles.date')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vehicles.service')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vehicles.cost')}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vehicles.mileage')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicle.serviceHistory.map((service: any) => (
              <tr key={service._id}>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(service.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{service.serviceId.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">${service.cost}</td>
                <td className="px-6 py-4 whitespace-nowrap">{service.mileage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}