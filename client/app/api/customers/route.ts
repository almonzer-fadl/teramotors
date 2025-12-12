import { connectToDatabase } from '@/lib/db';
import Customer from '@/lib/models/Customer';
import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppEventListeners } from '@/lib/services/WhatsAppEventListeners';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';

// GET /api/customers - List customers for tenant
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query with tenant filter
    const query: Record<string, unknown> = { tenantId, isActive: true };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get total count for pagination
    const totalCount = await Customer.countDocuments(query);

    // Get customers with pagination
    const customers = await Customer.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      customers,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  },
  { requireTenant: true }
);

// POST /api/customers - Create customer for tenant
export const POST = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    const body = await req.json();

    // If email is provided (and not an empty string), check for duplicates
    if (body.email && body.email.trim() !== '') {
      const existingCustomer = await Customer.findOne({
        tenantId,
        email: body.email.trim().toLowerCase(),
      });

      if (existingCustomer) {
        return NextResponse.json(
          { error: 'A customer with this email already exists for your workshop.' },
          { status: 409 } // 409 Conflict is more appropriate
        );
      }
    } else {
      // If email is empty or just whitespace, ensure it is saved as null
      // to work correctly with the sparse unique index.
      body.email = null;
    }

    const customer = new Customer({
      tenantId, // Always set tenantId from auth context
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      phoneNumber: body.phoneNumber || body.phone,
      whatsappEnabled: body.whatsappEnabled !== false,
      language: body.language || 'ar',
      address: body.address,
      vatNumber: body.vatNumber,
      idNumber: body.idNumber,
      companyName: body.companyName,
      notes: body.notes,
      vehicles: [],
    });

    await customer.save();

    // Send welcome WhatsApp message
    try {
      const whatsappListeners = WhatsAppEventListeners.getInstance();
      await whatsappListeners.onCustomerCreated(customer._id.toString());
    } catch (whatsappError) {
      console.error('Error sending welcome WhatsApp message:', whatsappError);
      // Don't fail the customer creation if WhatsApp fails
    }

    return NextResponse.json(
      {
        success: true,
        customer: {
          ...customer.toObject(),
          vehicles: 0,
        },
      },
      { status: 201 }
    );
  },
  { requireTenant: true }
);
