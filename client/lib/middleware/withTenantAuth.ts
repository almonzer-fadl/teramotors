import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, type AuthSession } from '@/lib/simple-auth';
import { validateTenantActive } from '@/lib/tenant-utils';

export type TenantAuthOptions = {
  requireTenant?: boolean;
  allowedRoles?: string[];
  allowSuperAdmin?: boolean;
};

// Extend AuthSession to include tenantId on user
interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId?: string;
}

interface ExtendedSession {
  user: ExtendedUser;
}

type HandlerContext = {
  session: ExtendedSession;
  tenantId: string;
  params?: Record<string, string>;
};

type TenantHandler = (
  req: NextRequest,
  context: HandlerContext
) => Promise<NextResponse>;

export function withTenantAuth(
  handler: TenantHandler,
  options: TenantAuthOptions = {}
) {
  return async (req: NextRequest, context: { params?: any } = {}) => {
    const {
      requireTenant = true,
      allowedRoles = [],
      allowSuperAdmin = false,
    } = options;

    const authSession = await getServerSession();

    if (!authSession?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // Cast to extended session type
    const session = authSession as unknown as ExtendedSession;
    const userRole = session.user.role;

    if (userRole === 'SUPER_ADMIN' && allowSuperAdmin) {
      return handler(req, { session, tenantId: '', params: context.params });
    }

    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(userRole as string)
    ) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    const tenantId = session.user.tenantId;

    if (requireTenant && !tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized - No tenant assigned' },
        { status: 401 }
      );
    }

    if (tenantId) {
      const isActive = await validateTenantActive(tenantId);
      if (!isActive) {
        return NextResponse.json(
          { error: 'Forbidden - Tenant is not active' },
          { status: 403 }
        );
      }
    }

    return handler(req, {
      session,
      tenantId: tenantId || '',
      params: context.params,
    });
  };
}
