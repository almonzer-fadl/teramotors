import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import Tenant from '@/lib/models/Tenant';
import Service from '@/lib/models/Service';
import { BookingWizard } from '@/components/booking/BookingWizard';

interface BookingPageProps {
  params: {
    slug: string;
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { slug } = params;

  await connectToDatabase();

  // Find tenant by slug
  const tenant = await Tenant.findOne({ slug, status: 'active' }).lean();

  if (!tenant) {
    notFound();
  }

  // Check if booking is enabled
  if (!tenant.bookingSettings?.enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Online Booking Not Available
          </h1>
          <p className="text-gray-600">
            Online booking is currently not enabled for {tenant.companyInfo.name}. Please
            contact them directly.
          </p>
          {tenant.companyInfo.phone && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-2">Contact:</p>
              <a
                href={`tel:${tenant.companyInfo.phone}`}
                className="text-blue-600 font-semibold text-lg"
              >
                {tenant.companyInfo.phone}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Get active services for booking
  const services = await Service.find({
    tenantId: tenant._id,
    isActive: true,
    bookingEnabled: true,
  })
    .select('name description category laborRate laborHours estimatedDuration')
    .lean();

  if (services.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Services Available</h1>
          <p className="text-gray-600">
            There are currently no services available for online booking.
          </p>
        </div>
      </div>
    );
  }

  // Convert MongoDB objects to plain objects
  const plainServices = services.map((service) => ({
    ...service,
    _id: service._id?.toString(),
    tenantId: service.tenantId?.toString(),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <BookingWizard
        tenantSlug={slug}
        tenantName={tenant.companyInfo.name}
        services={plainServices as any}
        bookingSettings={{
          workingHours: tenant.bookingSettings.workingHours,
          appointmentDuration: tenant.bookingSettings.appointmentDuration,
          advanceBookingDays: tenant.bookingSettings.advanceBookingDays,
          requireApproval: tenant.bookingSettings.requireApproval,
        }}
        language={tenant.settings?.locale?.startsWith('ar') ? 'ar' : 'en'}
      />
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BookingPageProps) {
  const { slug } = params;

  await connectToDatabase();
  const tenant = await Tenant.findOne({ slug }).select('name companyInfo').lean();

  if (!tenant) {
    return {
      title: 'Booking Not Found',
    };
  }

  return {
    title: `Book Appointment - ${tenant.companyInfo.name}`,
    description: `Book an online appointment with ${tenant.companyInfo.name}. Quick and easy online booking.`,
  };
}
