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
    
    // Get language from query parameter or default to English
    const url = new URL(request.url);
    const language = url.searchParams.get('lang') || 'en';
    const isRTL = language === 'ar';
    
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
      qrCodeData: invoice.zatca?.qrCode,
      language,
      isRTL
    });

    // Add print functionality to the HTML
    const htmlWithPrint = html.replace('</body>', `
      <script>
        // Auto-print when page loads
        window.onload = function() {
          window.print();
        };
      </script>
    </body>`);

    return new Response(htmlWithPrint, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating Invoice PDF:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate PDF' }), { status: 500 });
  }
}


