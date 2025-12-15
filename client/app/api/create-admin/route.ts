import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/User'
import { saltAndHashPassword } from '@/lib/utils/password'

// POST /api/create-admin - Create admin user (for development only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName } = body

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Email, password, and full name are required' }, { status: 400 })
    }

    await connectToDatabase()
    
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      // Update existing user to admin
      existingUser.role = 'admin'
      existingUser.isActive = true
      existingUser.password = saltAndHashPassword(password)
      existingUser.fullName = fullName
      await existingUser.save()
      
      return NextResponse.json({ 
        message: 'User updated to admin role successfully',
        user: {
          email: existingUser.email,
          fullName: existingUser.fullName,
          role: existingUser.role,
          isActive: existingUser.isActive
        }
      })
    }
    
    // Create new admin user
    const hashedPassword = saltAndHashPassword(password)
    const adminUser = new User({
      email,
      fullName,
      role: 'admin',
      password: hashedPassword,
      isActive: true,
      emailVerified: true
    })
    
    await adminUser.save()
    
    return NextResponse.json({ 
      message: 'Admin user created successfully',
      user: {
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role,
        isActive: adminUser.isActive
      }
    })
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 })
  }
}
