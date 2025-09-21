import { connectToDatabase, resetConnection } from '@/lib/db'

export async function GET() {
  try {
    console.log('Testing MongoDB connection...')
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI)
    
    // Reset connection to force a fresh connection
    resetConnection()
    await connectToDatabase()
    
    return Response.json({ 
      success: true, 
      message: 'MongoDB connection successful!' 
    })
  } catch (error) {
    console.error('MongoDB connection failed:', error)
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Check your MongoDB Atlas IP whitelist and connection string'
    }, { status: 500 })
  }
}
