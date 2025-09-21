import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/User'
import { verifyPassword } from '@/lib/utils/password'

export async function POST(request: Request) {
  await connectToDatabase()
  
  const { email, password } = await request.json() as { email: string, password: string }   
  
  const user = await User.findOne({ email })
  
  if (!user || !verifyPassword(password, user.password)) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  
 return Response.json({ success: true, user })
    }