import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { JobCard } from '@/lib/models'
import mongoose from 'mongoose'
import { getServerSession } from '@/lib/auth-server'

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || !(session.user as any)?.tenantId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase()

    // Ensure all models are registered

    const recent = await JobCard.find({
      status: { $in: ['pending', 'in-progress'] },
      tenantId: (session.user as any).tenantId
    })
      .sort({ createdAt: -1 })
      .limit(9)
      .populate('customerId', 'firstName lastName')
      .populate('vehicleId', 'make model year')
      .populate('services.serviceId', 'name')
      .lean();

    const shaped = recent.map((jc: any) => ({
      _id: jc._id,
      customer: {
        fullName: `${jc.customerId?.firstName || ''} ${jc.customerId?.lastName || ''}`.trim(),
      },
      vehicle: {
        make: jc.vehicleId?.make || '',
        model: jc.vehicleId?.model || '',
        year: jc.vehicleId?.year || null,
      },
      services: (jc.services || []).map((s: any) => ({
        service: { name: s.serviceId?.name || '' },
      })),
      status: jc.status,
      createdAt: jc.createdAt,
    }));

    return NextResponse.json(shaped, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching recent job cards' }, { status: 500 })
  }
}
