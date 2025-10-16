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
    const { id } = await context.params
    const logs = await WorkLog.find({ jobCardId: id, endedAt: { $exists: false } })
      .populate('userId', 'firstName lastName displayName role')
      .sort({ startedAt: -1 })

    return Response.json({ logs })
  } catch (e) {
    console.error('Error fetching active logs:', e)
    return Response.json({ error: 'Failed to fetch active logs' }, { status: 500 })
  }
}


