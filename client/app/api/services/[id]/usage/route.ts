import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import JobCard from '@/lib/models/JobCard';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';

export const GET = withTenantAuth(
  async (req: NextRequest, { params, tenantId }: { params: { id: string }, tenantId: string }) => {
    await connectToDatabase();

    const serviceId = params.id;

    // Find all job cards that include this service
    const jobCards = await JobCard.find({
      tenantId,
      'services.serviceId': serviceId,
    })
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year licensePlate')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      data: jobCards,
    });
  },
  { requireTenant: true }
);
