import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/User'
import crypto from 'crypto'
import { sendEmailTemplate } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email } = await request.json() as { email?: string }
    if (!email) return Response.json({ error: 'Email is required' }, { status: 400 })

    await connectToDatabase()
    const user = await User.findOne({ email })
    if (!user) return Response.json({ success: true }) // Do not leak existence

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 1000 * 60 * 30) // 30 minutes

    user.resetPasswordToken = token
    user.resetPasswordExpires = expires
    await user.save()

    // Build an absolute URL from the request origin so the link always works,
    // regardless of the environment (local, preview, or production domain)
    const origin = new URL(request.url).origin
    const resetUrl = `${origin}/reset-password?token=${token}`

    await sendEmailTemplate({
      to: user.email,
      subject: 'Password Reset - TeraMotor',
      template: 'password-reset',
      data: { resetUrl },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('[forgot-password] Failed to issue reset token:', error)
    return Response.json({ error: 'Failed to issue reset token' }, { status: 500 })
  }
}


