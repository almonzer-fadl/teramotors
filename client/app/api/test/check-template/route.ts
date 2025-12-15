import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import InspectionTemplate from '@/lib/models/InspectionTemplate';
import { getServerSession } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || 'فحص شامل';

    // Find the template by name
    const template = await InspectionTemplate.findOne({
      name: { $regex: name, $options: 'i' },
      isActive: true
    }).lean();

    if (!template) {
      return NextResponse.json({
        error: 'Template not found',
        searchedName: name
      }, { status: 404 });
    }

    // Analyze the items
    const itemsAnalysis = (template.items || []).map((item: any) => ({
      itemId: item.itemId,
      name: item.name,
      category: item.category,
      uniqueCode: item.uniqueCode,
      hasUniqueCode: !!item.uniqueCode && item.uniqueCode.trim() !== ''
    }));

    const itemsWithCodes = itemsAnalysis.filter(i => i.hasUniqueCode);

    return NextResponse.json({
      success: true,
      template: {
        _id: template._id,
        name: template.name,
        description: template.description,
        vehicleType: template.vehicleType,
        totalItems: template.items?.length || 0,
        itemsWithCodes: itemsWithCodes.length,
        itemsWithoutCodes: (template.items?.length || 0) - itemsWithCodes.length
      },
      allItems: itemsAnalysis,
      itemsWithCodes: itemsWithCodes
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check template',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
