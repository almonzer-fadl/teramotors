import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { auth } from '@/lib/auth';
import Invoice from '@/lib/models/Invoice';
import JobCard from '@/lib/models/JobCard';
import { pdf } from '@react-pdf/renderer';
import InvoiceDocument from '@/components/pdf/InvoiceDocument';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await connectToDatabase();

    const language = (new URL(request.url).searchParams.get('lang') || 'en') as 'en' | 'ar';

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

    const doc = <InvoiceDocument invoice={invoice.toObject()} jobCard={jobCard?.toObject?.() || jobCard} language={language} />;
    const pdfStream = await pdf(doc).toBlob();

    return new Response(pdfStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${String(invoice._id).slice(-6)}-${language}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating Invoice PDF:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate PDF' }), { status: 500 });
  }
}


