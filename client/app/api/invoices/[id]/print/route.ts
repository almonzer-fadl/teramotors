import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Invoice, JobCard, Part, Service, Customer, Vehicle } from '@/lib/models';
import { generateInvoiceHTML } from '@/lib/pdf-generator-html';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    await connectToDatabase();

    const invoice = await Invoice.findById(id)
      .populate('customerId')
      .populate('vehicleId');

    if (!invoice) {
      return new Response(JSON.stringify({ error: 'Invoice not found' }), { status: 404 });
    }

    let jobCard: any = null;
    if (invoice.jobCardId) {
      jobCard = await JobCard.findById(invoice.jobCardId)
        .populate('services.serviceId')
        .populate('partsUsed.partId');
    }

    const html = await generateInvoiceHTML({
      invoice: invoice.toObject(),
      jobCard: jobCard?.toObject?.() || jobCard,
      qrCodeData: invoice.zatca?.qrCode
    });

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating Invoice HTML:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate HTML' }), { status: 500 });
  }
}
