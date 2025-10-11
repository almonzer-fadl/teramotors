import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Invoice, JobCard } from '@/lib/models';
import { getServerSession } from "@/lib/auth-server";
import { ServerlessPDFGenerator } from '@/lib/pdf-generator-serverless';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;
    
    // Get language from query parameter or default to Arabic
    const url = new URL(request.url);
    const language = (url.searchParams.get('lang') || 'ar') as 'ar' | 'en';
    const includeQRCode = url.searchParams.get('qr') !== 'false';
    const format = (url.searchParams.get('format') || 'A4') as 'A4' | 'Letter';

    const invoice = await Invoice.findById(id)
      .populate('customerId')
      .populate('vehicleId', 'make model year licensePlate');

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    let jobCard: any = null;
    if (invoice.jobCardId) {
      jobCard = await JobCard.findById(invoice.jobCardId)
        .populate('services.serviceId')
        .populate('partsUsed.partId');
    }

    // Generate PDF using serverless PDF generator
    const pdfGenerator = new ServerlessPDFGenerator();
    const pdfBuffer = await pdfGenerator.generateInvoicePDF(invoice, jobCard, {
      language,
      includeQRCode,
      format
    });

    const filename = `invoice-${id}-${language}-${new Date().toISOString().split('T')[0]}.pdf`;

    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

  } catch (error) {
    console.error('Error generating Arabic PDF:', error);
    return NextResponse.json({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
