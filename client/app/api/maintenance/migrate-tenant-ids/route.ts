import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import WorkLog from '@/lib/models/WorkLog';
import WhatsAppMessage from '@/lib/models/WhatsAppMessage';
import User from '@/lib/models/User';
import Customer from '@/lib/models/Customer';
import JobCard from '@/lib/models/JobCard';
import { getServerSession } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    let workLogsUpdated = 0;
    let whatsappMessagesUpdated = 0;
    const errors: string[] = [];

    // Migrate WorkLogs - get tenantId from the associated User
    try {
      const workLogs = await WorkLog.find({ tenantId: { $exists: false } });

      for (const workLog of workLogs) {
        try {
          const user = await User.findById(workLog.userId).select('tenantId');
          if (user && user.tenantId) {
            await WorkLog.findByIdAndUpdate(workLog._id, { tenantId: user.tenantId });
            workLogsUpdated++;
          } else {
            errors.push(`WorkLog ${workLog._id}: Could not find user or tenantId`);
          }
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
          if (customer && customer.tenantId) {
            await WhatsAppMessage.findByIdAndUpdate(message._id, { tenantId: customer.tenantId });
            whatsappMessagesUpdated++;
          } else {
            errors.push(`WhatsAppMessage ${message._id}: Could not find customer or tenantId`);
          }
        } catch (err) {
          errors.push(`WhatsAppMessage ${message._id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    } catch (err) {
      errors.push(`WhatsAppMessage migration failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    return NextResponse.json({
      message: 'Migration completed',
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
