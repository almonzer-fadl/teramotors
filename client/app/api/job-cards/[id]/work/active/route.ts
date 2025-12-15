import { getServerSession } from '@/lib/auth-server'
import { connectToDatabase } from '@/lib/db'
import WorkLog from '@/lib/models/WorkLog'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const tenantId = (session.user as any).tenantId
    if (!tenantId) {
      return Response.json({ error: 'Tenant ID not found' }, { status: 400 })
    }

    const { id } = await context.params
    const logs = await WorkLog.find({ tenantId, jobCardId: id, endedAt: { $exists: false } })
      .populate('userId', 'firstName lastName displayName role')
      .sort({ startedAt: -1 })

    return Response.json({ logs })
  } catch (e) {
    return Response.json({ error: 'Failed to fetch active logs' }, { status: 500 })
  }
}


