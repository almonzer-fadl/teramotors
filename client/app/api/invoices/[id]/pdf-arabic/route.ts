import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "@/lib/auth-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const url = new URL(request.url);
    const language = 'ar'; // Fixed to Arabic for this route
    const includeQRCode = url.searchParams.get('qr') !== 'false';
    const format = (url.searchParams.get('format') || 'A4') as 'A4' | 'Letter';

    // Call server-side PDF generation (server doesn't require auth)
    const serverUrl = process.env.SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
    const serverResponse = await fetch(`${serverUrl}/api/invoices/${id}/pdf?lang=${language}&qr=${includeQRCode}&format=${format}`, {
      method: 'GET',
    });

    if (!serverResponse.ok) {
      const errorText = await serverResponse.text();
      console.error('Server error:', errorText);
      throw new Error(`Server responded with status: ${serverResponse.status} - ${errorText}`);
    }

    const pdfBuffer = await serverResponse.arrayBuffer();
    const filename = `invoice-${id}-${language}-${new Date().toISOString().split('T')[0]}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
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