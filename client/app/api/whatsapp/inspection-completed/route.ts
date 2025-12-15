import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from "@/lib/auth-server";
import { WhatsAppEventListeners } from '@/lib/services/WhatsAppEventListeners';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    const body = await request.json();
    const {
      customerId,
      vehicleMake,
      vehicleModel,
      itemsChecked,
      itemsNeedingAttention,
      inspectionFee,
      invoiceNumber,
      estimateTotal,
      serviceCount
    } = body;

    // Validate required fields
    if (!customerId || !vehicleMake || !vehicleModel || !invoiceNumber) {
      return NextResponse.json({
        error: 'Missing required fields',
        details: 'customerId, vehicleMake, vehicleModel, and invoiceNumber are required'
      }, { status: 400 });
    }

    // Send WhatsApp notification
    const whatsappListeners = WhatsAppEventListeners.getInstance();
    await whatsappListeners.onInspectionCompleted({
      customerId,
      vehicleMake,
      vehicleModel,
      itemsChecked: itemsChecked || 0,
      itemsNeedingAttention: itemsNeedingAttention || 0,
      inspectionFee: inspectionFee || 0,
      invoiceNumber,
      estimateTotal: estimateTotal || 0,
      serviceCount: serviceCount || 0
    });

    return NextResponse.json({
      success: true,
      message: 'WhatsApp notification sent successfully'
    }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: 'Failed to send WhatsApp notification',
      details: errorMessage
    }, { status: 500 });
  }
}
