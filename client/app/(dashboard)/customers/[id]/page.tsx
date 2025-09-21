
import { notFound } from 'next/navigation';
import Link from 'next/link';

async function getCustomer(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/customers/${id}`, {
    cache: 'no-store', // Fetch fresh data for each request
  });
  if (!res.ok) {
    return notFound();
  }
  return res.json();
}

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getCustomer(params.id);

  return (
    <div className="p-6">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{customer.firstName} {customer.lastName}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Email:</strong> {customer.email}</p>
            <p><strong>Phone:</strong> {customer.phone}</p>
          </div>
          <div>
            <p><strong>Address:</strong></p>
            <p>{customer.address?.street}</p>
            <p>{customer.address?.city}, {customer.address?.state} {customer.address?.zipCode}</p>
          </div>
        </div>
        {customer.notes && (
          <div className="mt-4">
            <p><strong>Notes:</strong></p>
            <p>{customer.notes}</p>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Vehicles</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Make</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customer.vehicles.map((vehicle: any) => (
              <tr key={vehicle._id}>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.make}</td>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.model}</td>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.year}</td>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.licensePlate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/vehicles/${vehicle._id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
