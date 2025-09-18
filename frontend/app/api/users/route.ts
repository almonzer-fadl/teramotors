import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/User'
import { auth } from '@/lib/auth'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    let query: any = {}

    if (role) {
      query.role = role
    }

    const users = await User.find(query)
      .select('_id fullName email role')
      .sort({ fullName: 1 })

    return Response.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
