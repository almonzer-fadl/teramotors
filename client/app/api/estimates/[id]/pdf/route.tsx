
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Estimate from '@/lib/models/Estimate';
import { getServerSession } from "@/lib/auth-server";
import { pdf } from '@react-pdf/renderer';
import EstimateDocument from '@/components/pdf/EstimateDocument';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();

    const estimate = await Estimate.findById(id)
      .populate('customerId')
      .populate('vehicleId')
      .populate('services.serviceId');

    if (!estimate) {
      return new Response(JSON.stringify({ error: 'Estimate not found' }), { status: 404 });
    }

    const doc = <EstimateDocument estimate={estimate.toObject()} />;
    const pdfStream = await pdf(doc).toBlob();

    return new Response(pdfStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="estimate-${estimate._id.slice(-6)}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate PDF' }), { status: 500 });
  }
}
