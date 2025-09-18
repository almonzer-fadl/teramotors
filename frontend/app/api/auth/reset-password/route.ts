import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/User'
import { saltAndHashPassword } from '@/lib/utils/password'

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json() as { token?: string, password?: string }
    if (!token || !password) return Response.json({ error: 'Missing token or password' }, { status: 400 })

    await connectToDatabase()
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    })
    if (!user) return Response.json({ error: 'Invalid or expired token' }, { status: 400 })

    user.password = saltAndHashPassword(password)
    user.resetPasswordToken = null
    user.resetPasswordExpires = null
    await user.save()

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error resetting password:', error)
    return Response.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}


