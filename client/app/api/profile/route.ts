import { connectToDatabase } from '@/lib/db'
import User from '@/lib/models/User'
import Tenant from '@/lib/models/Tenant'
import { getServerSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getServerSession()
  if (!session || !session.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectToDatabase()

  const user = await User.findById(session.user.id).select('-password')

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  let tenant = null
  if (user.tenantId) {
    tenant = await Tenant.findById(user.tenantId).select('name slug companyInfo bookingSettings')
  }

  return Response.json({
    user: {
      id: user._id,
      email: user.email,
      name: user.fullName || user.name,
      role: user.role,
      tenantId: user.tenantId
    },
    tenant
  })
}

export async function PUT(request: Request) {
  const session = await getServerSession()
  if (!session || !session.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectToDatabase()

  const { fullName, phone } = await request.json()

  await User.findByIdAndUpdate(session.user.id, {
    fullName,
    phone
  })

  return Response.json({ success: true })
}
