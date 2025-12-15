import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { connectToDatabase } from '@/lib/db';
import Tenant from '@/lib/models/Tenant';
import User from '@/lib/models/User'; // Needed for user count per tenant

export async function GET(request: Request) {
  const session = await getServerSession();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const searchQuery = searchParams.get('search') || '';

    const query: any = {};
    if (searchQuery) {
      query.name = { $regex: searchQuery, $options: 'i' }; // Case-insensitive search by name
    }

    const totalTenants = await Tenant.countDocuments(query);
    const tenants = await Tenant.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // Use .lean() for faster query execution

    // For each tenant, get the number of users
    const tenantsWithUserCount = await Promise.all(tenants.map(async (tenant) => {
      const userCount = await User.countDocuments({ tenantId: tenant._id });
      return {
        ...tenant,
        userCount,
      };
    }));

    return NextResponse.json({
      tenants: tenantsWithUserCount,
      total: totalTenants,
      page,
      limit,
    });

  } catch (error) {
    return NextResponse.json({ message: 'An error occurred while fetching tenants' }, { status: 500 });
  }
}
