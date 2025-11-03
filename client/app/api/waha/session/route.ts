import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { WahaSessionService } from '@/lib/services/WahaSessionService';

const wahaApiUrl = process.env.WAHA_API_URL || 'http://localhost:3000';
const wahaSessionName = process.env.WAHA_SESSION_NAME || 'teramotors';

const sessionService = new WahaSessionService({
  apiUrl: wahaApiUrl,
  apiKey: process.env.WAHA_API_KEY
});

// GET - Get session info
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const sessionInfo = await sessionService.getSession(wahaSessionName);
      return NextResponse.json(sessionInfo);
    } catch (error: any) {
      // If session doesn't exist (404 or 422), create it
      if (error.response?.status === 404 || error.response?.status === 422) {
        console.log('Session does not exist, creating it...');
        const newSession = await sessionService.createSession(wahaSessionName);
        return NextResponse.json(newSession);
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error getting Waha session:', error);
    return NextResponse.json({
      error: 'Failed to get session',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Create or start session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    if (action === 'start') {
      const sessionInfo = await sessionService.startSession(wahaSessionName);
      return NextResponse.json(sessionInfo);
    } else if (action === 'stop') {
      await sessionService.stopSession(wahaSessionName);
      return NextResponse.json({ success: true });
    } else {
      // Create session
      const sessionInfo = await sessionService.createSession(wahaSessionName);
      return NextResponse.json(sessionInfo);
    }
  } catch (error: any) {
    console.error('Error managing Waha session:', error);
    return NextResponse.json({
      error: 'Failed to manage session',
      details: error.message
    }, { status: 500 });
  }
}
