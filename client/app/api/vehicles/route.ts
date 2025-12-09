import { connectToDatabase } from '@/lib/db';
import Vehicle from '@/lib/models/Vehicle';
import Customer from '@/lib/models/Customer';
import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';
import { checkUsageLimit } from '@/lib/middleware/usage-enforcement';
import { updateTenantStats } from '@/lib/utils/usage-tracker';

// GET /api/vehicles - List vehicles for tenant
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const customerId = searchParams.get('customerId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query with tenant filter
    const query: Record<string, unknown> = { tenantId, isActive: true };

    if (customerId) {
      query.customerId = customerId;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { vin: searchRegex },
        { make: searchRegex },
        { model: searchRegex },
        { licensePlate: searchRegex },
      ];
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const totalCount = await Vehicle.countDocuments(query);

    const vehicles = await Vehicle.find(query)
      .populate('customerId', 'firstName lastName isActive')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      vehicles,
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

// POST /api/vehicles - Create vehicle for tenant
export const POST = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    const body = await req.json();

    if (body.vin === '') {
      body.vin = null;
    }
    if (body.licensePlate === '') {
      body.licensePlate = null;
    }

    // Check usage limits before creating a new vehicle
    const usageCheck = await checkUsageLimit(tenantId.toString(), 'vehicle', 'create');
    if (!usageCheck.allowed) {
      return NextResponse.json({
        error: usageCheck.reason,
        current: usageCheck.current,
        limit: usageCheck.limit,
      }, { status: 403 });
    }

    // CRITICAL: Validate customer belongs to same tenant
    const customer = await Customer.findOne({
      _id: body.customerId,
      tenantId,
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found or does not belong to your organization' },
        { status: 400 }
      );
    }

    // Check if VIN already exists FOR THIS TENANT
    if (body.vin) {
      const existingVehicle = await Vehicle.findOne({
        vin: body.vin,
        tenantId,
      });
      if (existingVehicle) {
        return NextResponse.json(
          { message: 'Vehicle with this VIN already exists' },
          { status: 400 }
        );
      }
    }

    // Check if license plate already exists FOR THIS TENANT
    if (body.licensePlate) {
      const existingLicensePlate = await Vehicle.findOne({
        licensePlate: body.licensePlate,
        tenantId,
      });
      if (existingLicensePlate) {
        return NextResponse.json(
          { message: 'Vehicle with this license plate already exists' },
          { status: 400 }
        );
      }
    }

    const vehicle = new Vehicle({
      tenantId, // Always set tenantId from auth context
      customerId: body.customerId,
      vin: body.vin,
      make: body.make,
      model: body.model,
      year: body.year,
      color: body.color,
      licensePlate: body.licensePlate,
      mileage: body.mileage,
      engineType: body.engineType,
      transmission: body.transmission,
      fuelType: body.fuelType,
      photos: body.photos || [],
    });

    await vehicle.save();

    // Add vehicle to customer's vehicles array
    await Customer.findOneAndUpdate(
      { _id: body.customerId, tenantId },
      { $push: { vehicles: vehicle._id } }
    );
    
    // Update tenant stats after successful creation
    await updateTenantStats(tenantId.toString());

    const populatedVehicle = await Vehicle.findById(vehicle._id).populate(
      'customerId',
      'firstName lastName'
    );

    return NextResponse.json(
      {
        success: true,
        vehicle: populatedVehicle,
      },
      { status: 201 }
    );
  },
  { requireTenant: true }
);
