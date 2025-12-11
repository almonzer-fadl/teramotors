import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import WorkLog from '@/lib/models/WorkLog';
import WhatsAppMessage from '@/lib/models/WhatsAppMessage';
import User from '@/lib/models/User';
import Customer from '@/lib/models/Customer';
import JobCard from '@/lib/models/JobCard';
import Vehicle from '@/lib/models/Vehicle';
import Appointment from '@/lib/models/Appointment';
import Service from '@/lib/models/Service';
import Part from '@/lib/models/Part';
import Invoice from '@/lib/models/Invoice';
import Estimate from '@/lib/models/Estimate';
import Payment from '@/lib/models/Payment';
import VehicleInspection from '@/lib/models/VehicleInspection';
import InspectionTemplate from '@/lib/models/InspectionTemplate';
import Tenant from '@/lib/models/Tenant';
import { getServerSession } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Super Admin access required' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const tenantSlug = body?.tenantSlug || 'teramotors-default';

    await connectToDatabase();

    let tenant = await Tenant.findOne({ slug: tenantSlug });

    if (!tenant) {
      tenant = await Tenant.create({
        name: 'TeraMotors',
        slug: tenantSlug,
        status: 'active',
        companyInfo: {
          name: 'شركه تيرا فيجنز',
          vatNumber: '314211338900003',
          address: { city: 'Riyadh', country: 'SA' },
        },
        subscription: {
          plan: 'enterprise',
          startDate: new Date(),
          maxUsers: 100,
          maxVehicles: 10000,
        },
      });
    }

    const tenantId = tenant._id;

    let workLogsUpdated = 0;
    let whatsappMessagesUpdated = 0;
    const collectionUpdates: Record<string, number> = {};
    const errors: string[] = [];

    const collections = [
      { name: 'Customers', model: Customer },
      { name: 'Vehicles', model: Vehicle },
      { name: 'Appointments', model: Appointment },
      { name: 'JobCards', model: JobCard },
      { name: 'Services', model: Service },
      { name: 'Parts', model: Part },
      { name: 'Invoices', model: Invoice },
      { name: 'Estimates', model: Estimate },
      { name: 'Payments', model: Payment },
      { name: 'VehicleInspections', model: VehicleInspection },
      { name: 'InspectionTemplates', model: InspectionTemplate },
      { name: 'Users', model: User },
    ];

    for (const collection of collections) {
      try {
        const result = await collection.model.updateMany(
          { tenantId: { $exists: false } },
          { $set: { tenantId } }
        );
        collectionUpdates[collection.name] = result.modifiedCount || 0;
      } catch (err) {
        errors.push(`${collection.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Migrate WorkLogs - get tenantId from the associated User
    try {
      const workLogs = await WorkLog.find({ tenantId: { $exists: false } });

      for (const workLog of workLogs) {
        try {
          const user = await User.findById(workLog.userId).select('tenantId');
          const derivedTenantId = user?.tenantId || tenantId;
          await WorkLog.findByIdAndUpdate(workLog._id, { tenantId: derivedTenantId });
          workLogsUpdated++;
        } catch (err) {
          errors.push(`WorkLog ${workLog._id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    } catch (err) {
      errors.push(`WorkLog migration failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    // Migrate WhatsAppMessages - get tenantId from the associated Customer
    try {
      const messages = await WhatsAppMessage.find({ tenantId: { $exists: false } });

      for (const message of messages) {
        try {
          const customer = await Customer.findById(message.customerId).select('tenantId');
          const derivedTenantId = customer?.tenantId || tenantId;
          await WhatsAppMessage.findByIdAndUpdate(message._id, { tenantId: derivedTenantId });
          whatsappMessagesUpdated++;
        } catch (err) {
          errors.push(`WhatsAppMessage ${message._id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    } catch (err) {
      errors.push(`WhatsAppMessage migration failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    return NextResponse.json({
      message: 'Migration completed',
      tenantId,
      tenantSlug,
      collectionUpdates,
      workLogsUpdated,
      whatsappMessagesUpdated,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error migrating tenant IDs:', error);
    return NextResponse.json({
      error: 'Failed to migrate tenant IDs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
