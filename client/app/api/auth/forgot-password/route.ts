import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/User'
import crypto from 'crypto'
import { sendEmail } from '@/lib/email'

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

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/reset-password?token=${token}`
    
    await sendEmail({
      to: user.email,
      subject: 'Reset your password',
      html: `<p>Please click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
      text: `Please copy and paste this URL into your browser to reset your password: ${resetUrl}`,
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error issuing reset token:', error)
    return Response.json({ error: 'Failed to issue reset token' }, { status: 500 })
  }
}


