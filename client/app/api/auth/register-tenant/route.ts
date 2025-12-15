import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import bcrypt from "bcryptjs"

// Note: This API will work with the Tenant model from dev2-data-models branch
// For now, we create a placeholder that will be fully functional after branch merge

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenant, admin } = body

    // Validate required fields
    if (!tenant?.name || !tenant?.email) {
      return NextResponse.json(
        { success: false, error: "Business name and email are required" },
        { status: 400 }
      )
    }

    if (!admin?.firstName || !admin?.lastName || !admin?.email || !admin?.password) {
      return NextResponse.json(
        { success: false, error: "Admin details are required" },
        { status: 400 }
      )
    }

    // Validate password length
    if (admin.password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Check if mongoose models exist (they will after merging dev2 branch)
    const mongoose = await import("mongoose")

    // Try to get Tenant model if it exists
    let Tenant = mongoose.models.Tenant
    let User = mongoose.models.User

    if (!User) {
      // Import User model if not already loaded
      const UserModule = await import("@/lib/models/User")
      User = UserModule.default
    }

    // Check if admin email already exists
    const existingUser = await User.findOne({ email: admin.email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    // Generate slug from business name
    const generateSlug = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }

    const slug = generateSlug(tenant.name)

    // Hash password
    const hashedPassword = await bcrypt.hash(admin.password, 12)

    let tenantId = null

    // Create tenant if Tenant model exists
    if (Tenant) {
      // Check if tenant slug already exists
      const existingTenant = await Tenant.findOne({
        $or: [
          { slug },
          { 'companyInfo.email': tenant.email.toLowerCase() }
        ]
      })

      if (existingTenant) {
        return NextResponse.json(
          { success: false, error: "A workshop with this name or email already exists" },
          { status: 400 }
        )
      }

      // Create new tenant with correct schema structure
      const newTenant = new Tenant({
        name: tenant.name,
        slug,
        status: 'trial', // Use trial status for new tenants
        companyInfo: {
          name: tenant.name, // REQUIRED field
          email: tenant.email.toLowerCase(),
          phone: tenant.phone || '',
          website: tenant.website || '',
          address: {
            country: 'SA', // Default country
          }
        },
        subscription: {
          plan: 'trial', // Correct field name (not 'tier')
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 day trial
          maxUsers: 5,
          maxVehicles: 100,
        },
        settings: {
          timezone: 'Asia/Riyadh',
          currency: 'SAR',
          locale: 'ar-SA', // Correct field name (not 'language')
          dateFormat: 'DD/MM/YYYY',
        },
        branding: {
          primaryColor: '#3b82f6',
          secondaryColor: '#10b981',
        },
      })

      await newTenant.save()
      tenantId = newTenant._id
    }

    // Create admin user
    const newUser = new User({
      email: admin.email.toLowerCase(),
      password: hashedPassword,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: 'admin',
      isActive: true,
      emailVerified: false,
      ...(tenantId && { tenantId }), // Add tenantId if tenant was created
    })

    await newUser.save()

    return NextResponse.json({
      success: true,
      message: "Workshop created successfully",
      needsOnboarding: true, // Add this flag
      data: {
        tenantId: tenantId?.toString(),
        userId: newUser._id.toString(),
      }
    }, { status: 201 })

  } catch (error: any) {

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message)
      return NextResponse.json(
        { success: false, error: messages.join(', ') },
        { status: 400 }
      )
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "A workshop or user with this information already exists" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to create workshop. Please try again." },
      { status: 500 }
    )
  }
}
