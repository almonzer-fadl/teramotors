import { connectToDatabase } from '@/lib/db';
import VehicleInspection from '@/lib/models/VehicleInspection';
import InspectionTemplate from '@/lib/models/InspectionTemplate';
import JobCard from '@/lib/models/JobCard';
import User from '@/lib/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { withTenantAuth } from '@/lib/middleware/withTenantAuth';

// GET /api/inspections - List inspections for tenant
export const GET = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Build query with tenant filter
    const query = { tenantId };

    const totalCount = await VehicleInspection.countDocuments(query);

    const inspections = await VehicleInspection.find(query)
      .populate({
        path: 'jobCardId',
        populate: [
          { path: 'vehicleId', select: 'make model year licensePlate' },
          { path: 'customerId', select: 'firstName lastName' },
        ],
      })
      .populate('mechanicId', 'firstName lastName displayName')
      .populate('templateId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      inspections,
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

// POST /api/inspections - Create inspection for tenant
export const POST = withTenantAuth(
  async (req: NextRequest, { tenantId }) => {
    await connectToDatabase();

    const body = await req.json();

    // Validate that job card exists and belongs to tenant
    const jobCard = await JobCard.findOne({ _id: body.jobCardId, tenantId });
    if (!jobCard) {
      return NextResponse.json(
        { error: 'Job card not found' },
        { status: 400 }
      );
    }

    // Validate that user exists
    const user = await User.findById(body.mechanicId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 400 }
      );
    }

    // Validate that template exists and belongs to tenant (only if provided and not empty)
    if (body.templateId && body.templateId !== '') {
      const template = await InspectionTemplate.findOne({
        _id: body.templateId,
        tenantId,
      });
      if (!template) {
        return NextResponse.json(
          { error: 'Inspection template not found' },
          { status: 400 }
        );
      }
    }

    const inspectionData: any = {
      tenantId, // Always set tenantId from auth context
      jobCardId: body.jobCardId,
      mechanicId: body.mechanicId,
      inspectionDate: body.inspectionDate,
      mileage: body.mileage,
      items: body.items,
      recommendations: body.recommendations,
      nextInspectionMonths: body.nextInspectionMonths || 3,
      status: body.status || 'in-progress',
    };

    // Only add templateId if it's provided and not empty
    if (body.templateId && body.templateId !== '') {
      inspectionData.templateId = body.templateId;
    }

    // Only add nextInspectionDate if it's provided and not empty
    if (body.nextInspectionDate && body.nextInspectionDate !== '') {
      inspectionData.nextInspectionDate = body.nextInspectionDate;
    }

    const inspection = new VehicleInspection(inspectionData);

    await inspection.save();

    const populatedInspection = await VehicleInspection.findById(inspection._id)
      .populate({
        path: 'jobCardId',
        populate: [
          { path: 'vehicleId', select: 'make model year licensePlate' },
          { path: 'customerId', select: 'firstName lastName' },
        ],
      })
      .populate('mechanicId', 'firstName lastName displayName')
      .populate('templateId', 'name');

    return NextResponse.json(
      {
        success: true,
        inspection: populatedInspection,
      },
      { status: 201 }
    );
  },
  { requireTenant: true }
);
