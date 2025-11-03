import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { WahaSessionService } from '@/lib/services/WahaSessionService';

const wahaApiUrl = process.env.WAHA_API_URL || 'http://localhost:3000';
const wahaSessionName = process.env.WAHA_SESSION_NAME || 'teramotors';

const sessionService = new WahaSessionService({
  apiUrl: wahaApiUrl,
  apiKey: process.env.WAHA_API_KEY
});

// GET - Get QR code
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const qrData = await sessionService.getQRCode(wahaSessionName);
    return NextResponse.json({ qr: qrData });
  } catch (error: any) {
    console.error('Error getting QR code:', error);
    return NextResponse.json({
      error: 'Failed to get QR code',
      details: error.message
    }, { status: 500 });
  }
}
