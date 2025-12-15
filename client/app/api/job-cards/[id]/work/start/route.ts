import { getServerSession } from '@/lib/auth-server'
import { connectToDatabase } from '@/lib/db'
import WorkLog from '@/lib/models/WorkLog'
import JobCard from '@/lib/models/JobCard'

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
    const job = await JobCard.findById(id)
    if (!job) return Response.json({ error: 'Job card not found' }, { status: 404 })

    const body = await request.json().catch(() => ({} as any))
    const role = body?.role || session.user.role || 'mechanic'

    // Prevent duplicate active logs for this user on this job
    const existing = await WorkLog.findOne({ tenantId, jobCardId: id, userId: session.user.id, endedAt: { $exists: false } })
    if (existing) return Response.json({ success: true, workLog: existing })

    const log = new WorkLog({ tenantId, jobCardId: id, userId: session.user.id, role, startedAt: new Date() })
    await log.save()

    return Response.json({ success: true, workLog: log })
  } catch (e) {
    return Response.json({ error: 'Failed to start work' }, { status: 500 })
  }
}


