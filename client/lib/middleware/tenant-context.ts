import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/simple-auth';
import { validateTenantActive } from '@/lib/tenant-utils';

export interface TenantContext {
  tenantId: string;
  userId: string;
  userRole: string;
}

export async function getTenantContext(
  _req: NextRequest
): Promise<TenantContext | null> {
  const session = await getServerSession();

  if (!session?.user) {
    return null;
  }

  const tenantId = session.user.tenantId;

  if (!tenantId) {
    if (session.user.role === 'SUPER_ADMIN') {
      return {
        tenantId: '',
        userId: session.user.id,
        userRole: session.user.role,
      };
    }

    return null;
  }

  const isActive = await validateTenantActive(tenantId);
  if (!isActive) {
    return null;
  }

  return {
    tenantId,
    userId: session.user.id,
    userRole: session.user.role,
  };
}

export function requireTenantContext() {
  return async (req: NextRequest) => {
    const context = await getTenantContext(req);

    if (!context) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid tenant context' },
        { status: 401 }
      );
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-tenant-id', context.tenantId);
    requestHeaders.set('x-user-id', context.userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  };
}
