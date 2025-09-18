
import { notFound } from 'next/navigation';
import Link from 'next/link';

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

  return (
    <div className="p-6">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{vehicle.year} {vehicle.make} {vehicle.model}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>VIN:</strong> {vehicle.vin}</p>
            <p><strong>License Plate:</strong> {vehicle.licensePlate}</p>
            <p><strong>Mileage:</strong> {vehicle.mileage}</p>
          </div>
          <div>
            <p><strong>Owner:</strong> <Link href={`/customers/${vehicle.customerId._id}`} className="text-indigo-600 hover:text-indigo-900">{vehicle.customerId.firstName} {vehicle.customerId.lastName}</Link></p>
            <p><strong>Engine:</strong> {vehicle.engineType}</p>
            <p><strong>Transmission:</strong> {vehicle.transmission}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Service History</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mileage</th>
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
