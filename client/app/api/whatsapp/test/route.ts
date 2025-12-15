import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { connectToDatabase } from '@/lib/db';
import Tenant from '@/lib/models/Tenant';

export const GET = withTenantAuth(
  async (_req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    try {
      const tenant = await Tenant.findById(tenantId)
        .select('integrations.whatsapp')
        .lean();

      const instanceId = tenant?.integrations?.whatsapp?.instanceId;
      const token = tenant?.integrations?.whatsapp?.token;

      if (!instanceId || !token) {
        return NextResponse.json({
          configured: false,
          connected: false,
          messageKey: 'whatsapp.integration.not_configured_detail'
        });
      }

      const statusUrl = `https://api.ultramsg.com/${instanceId}/instance/status?token=${token}`;
      let connected = false;
      let providerMessage = 'Unable to verify Ultramsg status.';

      try {
        const statusResponse = await fetch(statusUrl, { method: 'GET' });
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          connected = statusData.status === 'online';
          providerMessage = statusData.status || providerMessage;
        } else {
          providerMessage = `Ultramsg responded with ${statusResponse.status}`;
        }
      } catch (statusError) {
        providerMessage = (statusError as Error).message || providerMessage;
      }

      return NextResponse.json({
        configured: true,
        connected,
        message: providerMessage
      });
    } catch (error) {
      return NextResponse.json(
        {
          configured: false,
          connected: false,
          messageKey: 'whatsapp.integration.test_failed'
        },
        { status: 500 }
      );
    }
  },
  { requireTenant: true, allowedRoles: ['admin'] }
);
