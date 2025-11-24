import { NextRequest, NextResponse } from 'next/server';
import { SearchService, SearchFilters } from '@/lib/search';
import { getServerSession } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');

    if (!query.trim()) {
      return NextResponse.json({ results: [] });
    }

    const filters: SearchFilters = {};

    if (type) {
      filters.type = type.split(',');
    }

    if (dateFrom) {
      filters.dateFrom = new Date(dateFrom);
    }

    if (dateTo) {
      filters.dateTo = new Date(dateTo);
    }

    if (status) {
      filters.status = status.split(',');
    }

    const results = await SearchService.globalSearch(query, filters, limit);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed', results: [] }, { status: 500 });
  }
}
