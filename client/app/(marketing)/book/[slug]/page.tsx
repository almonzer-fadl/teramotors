import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import Tenant from '@/lib/models/Tenant';
import Service from '@/lib/models/Service';
import { BookingWizard } from '@/components/booking/BookingWizardModern';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-md mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/30">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-3">
            Online Booking Not Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            Online booking is currently not enabled for {tenant.companyInfo.name}. Please
            contact them directly.
          </p>
          {tenant.companyInfo.phone && (
            <div className="mt-8 p-4 bg-gradient-to-br from-[#F97402]/5 to-[#F13F33]/5 dark:from-[#F97402]/10 dark:to-[#F13F33]/10 rounded-2xl border-2 border-[#F97402]/20">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Contact:</p>
              <a
                href={`tel:${tenant.companyInfo.phone}`}
                className="text-2xl font-bold bg-gradient-to-r from-[#F97402] to-[#F13F33] bg-clip-text text-transparent"
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-md mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-500/30">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-3">
            No Services Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
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
