import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/User'
import { auth } from '@/lib/auth'

export async function PUT(request: Request) {
  const session = await auth()
  if (!session || !session.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectToDatabase()
  
  const { fullName, phone } = await request.json()
  
  await User.findByIdAndUpdate(session.user.id, {
    fullName,
    phone
  })
  
  return Response.json({ success: true })
}
