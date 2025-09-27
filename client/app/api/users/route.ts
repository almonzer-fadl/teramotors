import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/User'
import { getServerSession } from "@/lib/auth-server";
import { saltAndHashPassword } from '@/lib/utils/password'

export async function GET() {
  const session = await getServerSession()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
  }

  try {
    await connectToDatabase()
    const users = await User.find({}).select('firstName lastName displayName role isActive email createdAt')
    return NextResponse.json(users, { status: 200 })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
  }

  try {
    await connectToDatabase()
    
    const body = await request.json()
    const { email, firstName, lastName, role = 'mechanic', phone } = body
    
    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json({ error: 'Email, first name, and last name are required' }, { status: 400 })
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    
    // Create new user with temporary password
    const tempPassword = 'TempPass123!' // This will be changed on first login
    const user = new User({
      email,
      password: saltAndHashPassword(tempPassword),
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      displayName: `${firstName} ${lastName}`,
      role,
      phone,
      isActive: true,
      emailVerified: false,
      needsPasswordChange: true // Flag to force password change on first login
    })
    
    await user.save()
    
    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    })
    
  } catch (error: any) {
    console.error('Error creating user:', error)
    
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
