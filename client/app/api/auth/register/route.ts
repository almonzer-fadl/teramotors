import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/User'
import { saltAndHashPassword } from '@/lib/utils/password'

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await connectToDatabase()
    
    const body = await request.json()
    const { email, password, fullName } = body
    
    // Validate required fields
    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 })
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 })
    }
    
    // Validate password length
    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return Response.json({ error: 'Email already exists' }, { status: 400 })
    }
    
    // Create new user
    const user = new User({
      email,
      password: saltAndHashPassword(password),
      fullName: fullName || '',
      role: 'mechanic', // Default role
      isActive: true,
      emailVerified: false
    })
    
    await user.save()
    
    return Response.json({ 
      success: true, 
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    })
    
  } catch (error: any) {
    console.error('Registration error:', error)
    
    if (error.code === 11000) {
      return Response.json({ error: 'Email already exists' }, { status: 400 })
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return Response.json({ error: errors.join(', ') }, { status: 400 })
    }
    
    return Response.json({ error: 'Registration failed' }, { status: 500 })
  }
}