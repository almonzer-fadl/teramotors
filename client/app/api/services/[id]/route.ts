import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Service from '@/lib/models/Service';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';

// GET /api/services/[id] - Get single service
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId, params }) => {
    await connectToDatabase();

    // Filter by BOTH id AND tenantId
    const service = await Service.findOne({
      _id: params?.id,
      tenantId,
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  },
  { requireTenant: true }
);

// PUT /api/services/[id] - Update service
export const PUT = withTenantAuth(
  async (req: NextRequest, { tenantId, params }) => {
    await connectToDatabase();

    const body = await req.json();

    // Update only if belongs to tenant
    const service = await Service.findOneAndUpdate(
      { _id: params?.id, tenantId },
      body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, service });
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);

// DELETE /api/services/[id] - Soft delete service
export const DELETE = withTenantAuth(
  async (req: NextRequest, { tenantId, params }) => {
    await connectToDatabase();

    // Soft delete by setting isActive to false
    const service = await Service.findOneAndUpdate(
      { _id: params?.id, tenantId },
      { isActive: false },
      { new: true }
    );

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
