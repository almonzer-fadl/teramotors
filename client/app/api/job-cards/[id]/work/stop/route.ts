import { getServerSession } from '@/lib/auth-server'
import { connectToDatabase } from '@/lib/db'
import WorkLog from '@/lib/models/WorkLog'

export async function POST(
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

    const active = await WorkLog.findOne({ tenantId, jobCardId: id, userId: session.user.id, endedAt: { $exists: false } })
    if (!active) return Response.json({ error: 'No active work log' }, { status: 400 })

    const endedAt = new Date()
    const durationMs = endedAt.getTime() - new Date(active.startedAt).getTime()

    active.endedAt = endedAt
    active.durationMs = durationMs
    await active.save()

    return Response.json({ success: true, workLog: active })
  } catch (e) {
    return Response.json({ error: 'Failed to stop work' }, { status: 500 })
  }
}


