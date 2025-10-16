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

    const { id } = await context.params

    const active = await WorkLog.findOne({ jobCardId: id, userId: session.user.id, endedAt: { $exists: false } })
    if (!active) return Response.json({ error: 'No active work log' }, { status: 400 })

    const endedAt = new Date()
    const durationMs = endedAt.getTime() - new Date(active.startedAt).getTime()

    active.endedAt = endedAt
    active.durationMs = durationMs
    await active.save()

    return Response.json({ success: true, workLog: active })
  } catch (e) {
    console.error('Error stopping work log:', e)
    return Response.json({ error: 'Failed to stop work' }, { status: 500 })
  }
}


