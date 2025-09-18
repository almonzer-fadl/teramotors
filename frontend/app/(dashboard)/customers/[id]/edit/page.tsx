'use client';

import CustomerForm from '@/components/forms/CustomerForm';
import { useParams } from 'next/navigation';

export default function EditCustomerPage() {
  const params = useParams();
  const { id } = params;

  return <CustomerForm customerId={id as string} />;
}