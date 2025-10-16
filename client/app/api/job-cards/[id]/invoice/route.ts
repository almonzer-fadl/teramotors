import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from '@/lib/auth-server';
import { Invoice } from '@/lib/models';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { id } = await params;
    const invoice = await Invoice.findOne({ jobCardId: id });
    return NextResponse.json({ invoice: invoice || null });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

