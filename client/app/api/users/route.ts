import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/User'
import { getServerSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getServerSession()
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
  }

  try {
    await connectToDatabase()
    const users = await User.find({})
    return NextResponse.json(users, { status: 200 })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ message: 'Error fetching users' }, { status: 500 })
  }
}
