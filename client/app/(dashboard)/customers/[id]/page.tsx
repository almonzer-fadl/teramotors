'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: Address;
  notes?: string;
  vehicles: Vehicle[];
}

export default function CustomerDetailPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (id) {
      const fetchCustomer = async (customerId: string) => {
        try {
          const res = await fetch(`/api/customers/${customerId}`, {
            cache: 'no-store',
          });
          if (!res.ok) {
            return notFound();
          }
          const data = await res.json();
          setCustomer(data);
        } catch (error) {
          console.error('Failed to fetch customer', error);
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer(id as string);
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!customer) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center">
              <button
                onClick={() => window.history.back()}
                className="mr-6 p-3 text-gray-400 hover:text-[#F13F33] transition-all duration-300 rounded-2xl hover:bg-gray-100 group"
              >
                <svg className="h-6 w-6 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {customer.firstName} {customer.lastName}
                </h1>
                <p className="mt-3 text-xl text-gray-600">
                  Customer Details
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden mb-8">
          <div className="px-8 py-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Personal Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50/80 rounded-2xl">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{customer.email}</p>
                </div>
                <div className="p-4 bg-gray-50/80 rounded-2xl">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Phone</p>
                  <p className="text-lg font-semibold text-gray-900">{customer.phone}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50/80 rounded-2xl">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Address</p>
                  <p className="text-lg font-semibold text-gray-900">{customer.address?.street}</p>
                  <p className="text-sm text-gray-600">{customer.address?.city}, {customer.address?.state} {customer.address?.zipCode}</p>
                </div>
              </div>
            </div>
            {customer.notes && (
              <div className="mt-8 p-4 bg-gray-50/80 rounded-2xl">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Notes</p>
                <p className="text-lg text-gray-900">{customer.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="px-8 py-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-[#063479] to-[#052a5f] rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1m-1-1V8a1 1 0 00-1-1H9m4 8V8a1 1 0 00-1-1H9" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Vehicles</h2>
            </div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Make</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Model</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Year</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">License Plate</th>
                    <th scope="col" className="relative px-6 py-4">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-gray-200">
                  {customer.vehicles.map((vehicle: any) => (
                    <tr key={vehicle._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{vehicle.make}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{vehicle.model}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{vehicle.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{vehicle.licensePlate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          href={`/vehicles/${vehicle._id}`} 
                          className="inline-flex items-center px-4 py-2 text-sm font-bold text-[#F13F33] hover:text-[#d6352a] hover:bg-[#F13F33]/5 rounded-xl transition-all duration-300"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
