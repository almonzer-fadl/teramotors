import { connectToDatabase } from '@/lib/db'
import InspectionTemplate from '@/lib/models/InspectionTemplate'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const templates = await InspectionTemplate.find({ isActive: true })
      .sort({ createdAt: -1 })

    return Response.json(templates)
  } catch (error) {
    console.error('Error fetching inspection templates:', error)
    // Return empty array when database is unavailable
    return Response.json([])
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    
    const body = await request.json()
    
    const template = new InspectionTemplate({
      name: body.name,
      category: body.category,
      vehicleType: body.vehicleType,
      items: body.items
    })

    await template.save()

    return Response.json({ 
      success: true, 
      template
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating inspection template:', error)
    return Response.json({ error: 'Failed to create inspection template' }, { status: 500 })
  }
}
