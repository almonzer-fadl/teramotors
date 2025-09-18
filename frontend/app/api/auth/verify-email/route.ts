import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/User'

export async function POST(request: Request) {
  try {
    const { token } = await request.json() as { token?: string }
    if (!token) return Response.json({ error: 'Missing token' }, { status: 400 })

    await connectToDatabase()

    const user = await User.findOne({ 
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    })
    if (!user) return Response.json({ error: 'Invalid or expired token' }, { status: 400 })

    user.emailVerified = true
    user.emailVerificationToken = null
    user.emailVerificationExpires = null
    await user.save()

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error verifying email:', error)
    return Response.json({ error: 'Failed to verify email' }, { status: 500 })
  }
}


