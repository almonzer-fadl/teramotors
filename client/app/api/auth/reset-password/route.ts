import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/User'
import { saltAndHashPassword } from '@/lib/utils/password'
import { authRateLimit } from '@/lib/middleware/rate-limit'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = authRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { token, password } = await request.json() as { token?: string, password?: string }
    if (!token || !password) return Response.json({ error: 'Missing token or password' }, { status: 400 })

    // Strong password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(password)) {
      return Response.json({ 
        error: 'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
      }, { status: 400 })
    }

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


