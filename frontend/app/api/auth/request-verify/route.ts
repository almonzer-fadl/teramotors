import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/User'
import { auth } from '@/lib/auth'
import crypto from 'crypto'
import { sendEmail } from '@/lib/email'

export async function POST() {
  try {
    const session = await auth()
    if (!session || !session.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const user = await User.findOne({ email: session.user.email })
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    user.emailVerificationToken = token
    user.emailVerificationExpires = expires
    await user.save()

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/verify-email?token=${token}`
    
    await sendEmail({
      to: user.email,
      subject: 'Verify your email address',
      html: `<p>Please click this link to verify your email address: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
      text: `Please copy and paste this URL into your browser to verify your email address: ${verifyUrl}`,
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error issuing verification token:', error)
    return Response.json({ error: 'Failed to issue verification token' }, { status: 500 })
  }
}


