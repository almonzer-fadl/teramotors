import { getServerSession } from '@/lib/auth-server'
import { connectToDatabase } from '@/lib/db'
import WorkLog from '@/lib/models/WorkLog'

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || undefined
    const jobCardId = searchParams.get('jobCardId') || undefined
    const role = searchParams.get('role') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const minDurationMs = searchParams.get('minDurationMs') ? parseInt(searchParams.get('minDurationMs') as string) : undefined
    const maxDurationMs = searchParams.get('maxDurationMs') ? parseInt(searchParams.get('maxDurationMs') as string) : undefined
    const jobCardEndsWith = searchParams.get('jobCardEndsWith') || undefined
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 500)

    const baseMatch: any = {}
    if (userId) baseMatch.userId = userId
    if (jobCardId) baseMatch.jobCardId = jobCardId
    if (role) baseMatch.role = role
    if (startDate || endDate) {
      baseMatch.startedAt = {}
      if (startDate) baseMatch.startedAt.$gte = new Date(startDate as string)
      if (endDate) baseMatch.startedAt.$lte = new Date(endDate as string)
    }
    if (typeof minDurationMs === 'number' || typeof maxDurationMs === 'number') {
      baseMatch.durationMs = {}
      if (typeof minDurationMs === 'number') baseMatch.durationMs.$gte = minDurationMs
      if (typeof maxDurationMs === 'number') baseMatch.durationMs.$lte = maxDurationMs
    }

    const pipeline: any[] = [
      { $match: baseMatch }
    ]
    if (jobCardEndsWith) {
      pipeline.push({
        $match: {
          $expr: {
            $eq: [
              {
                $substrBytes: [
                  { $toString: "$jobCardId" },
                  { $subtract: [ { $strLenBytes: { $toString: "$jobCardId" } }, 6 ] },
                  6
                ]
              },
              jobCardEndsWith
            ]
          }
        }
      })
    }
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'jobcards', localField: 'jobCardId', foreignField: '_id', as: 'job' } },
      { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } },
      { $project: { 
        jobCardId: 1, userId: 1, role: 1, startedAt: 1, endedAt: 1, durationMs: 1, createdAt: 1,
        userId_populated: { firstName: '$user.firstName', lastName: '$user.lastName', displayName: '$user.displayName', role: '$user.role', _id: '$user._id' },
        jobCardId_populated: { _id: '$job._id' }
      } }
    )

    const countPipeline: any[] = [ { $match: baseMatch } ]
    if (jobCardEndsWith) countPipeline.push({
      $match: {
        $expr: {
          $eq: [
            { $substrBytes: [ { $toString: "$jobCardId" }, { $subtract: [ { $strLenBytes: { $toString: "$jobCardId" } }, 6 ] }, 6 ] },
            jobCardEndsWith
          ]
        }
      }
    })
    countPipeline.push({ $count: 'total' })

    const [logsAgg, countAgg] = await Promise.all([
      WorkLog.aggregate(pipeline),
      WorkLog.aggregate(countPipeline)
    ])

    const logs = logsAgg.map((l: any) => ({
      _id: l._id,
      jobCardId: l.jobCardId_populated?._id ? { _id: l.jobCardId_populated._id } : l.jobCardId,
      userId: l.userId_populated?._id ? l.userId_populated : l.userId,
      role: l.role,
      startedAt: l.startedAt,
      endedAt: l.endedAt,
      durationMs: l.durationMs,
      createdAt: l.createdAt
    }))

    const totalCount = countAgg[0]?.total || 0
    const totalPages = Math.ceil(totalCount / limit) || 1

    return Response.json({ logs, pagination: { totalCount, currentPage: page, totalPages, limit } })
  } catch (e) {
    console.error('Error fetching work logs:', e)
    return Response.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}
