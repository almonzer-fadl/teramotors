import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@/lib/search';
import { getServerSession } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!query.trim()) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = await SearchService.getSearchSuggestions(query, limit);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Search suggestions API error:', error);
    return NextResponse.json({ error: 'Failed to get suggestions', suggestions: [] }, { status: 500 });
  }
}
