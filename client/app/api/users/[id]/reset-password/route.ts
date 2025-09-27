import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/User'
import { getServerSession } from "@/lib/auth-server";
import { saltAndHashPassword } from '@/lib/utils/password'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
  }

  try {
    await connectToDatabase()
    
    const { id } = await params
    const body = await request.json()
    const { newPassword } = body
    
    // Validate password
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }
    
    // Strong password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json({ 
        error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
      }, { status: 400 })
    }
    
    // Find user
    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Update password and remove password change flag
    user.password = saltAndHashPassword(newPassword)
    user.needsPasswordChange = false
    await user.save()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Password updated successfully'
    })
    
  } catch (error: any) {
    console.error('Error resetting password:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
