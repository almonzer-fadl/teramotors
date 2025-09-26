import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/User'
import { getServerSession } from "@/lib/auth-server";

export async function PUT(request: Request) {
  const session = await getServerSession()
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
