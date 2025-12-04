import { connectToDatabase } from '@/lib/db';
import Service from '@/lib/models/Service';
import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';

// GET /api/services - List services for tenant
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const isTemplate = searchParams.get('isTemplate') === 'true';

    // Build query with tenant filter
    const query: Record<string, unknown> = { tenantId, isActive: true };

    if (isTemplate) {
      query.isTemplate = true;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    if (category) {
      query.category = category;
    }

    const services = await Service.find(query).sort({ name: 1 });

    return NextResponse.json(services);
  },
  { requireTenant: true }
);

// POST /api/services - Create service for tenant
export const POST = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    const body = await req.json();

    // Check if service code already exists for this tenant
    if (body.code) {
      const existing = await Service.findOne({
        tenantId,
        code: body.code,
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Service code already exists' },
          { status: 400 }
        );
      }
    }

    const service = new Service({
      ...body,
      tenantId, // Always set tenantId from auth context
    });

    await service.save();

    return NextResponse.json({ success: true, service }, { status: 201 });
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
