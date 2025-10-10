import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Invoice, JobCard } from '@/lib/models';
import { getServerSession } from "@/lib/auth-server";
import { ArabicPDFGenerator } from '@/lib/pdf-generator-arabic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let pdfGenerator: ArabicPDFGenerator | null = null;
  
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

    // Generate PDF using Puppeteer
    pdfGenerator = new ArabicPDFGenerator();
    const pdfBuffer = await pdfGenerator.generateInvoicePDF(invoice, jobCard, {
      language,
      includeQRCode,
      format,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
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
  } finally {
    // Clean up PDF generator
    if (pdfGenerator) {
      try {
        await pdfGenerator.close();
      } catch (closeError) {
        console.error('Error closing PDF generator:', closeError);
      }
    }
  }
}
