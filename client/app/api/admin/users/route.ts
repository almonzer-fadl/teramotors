import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { connectToDatabase } from '@/lib/db';
import User from '@/lib/models/User';
import Tenant from '@/lib/models/Tenant'; // Ensure Tenant model is registered for populate

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
      query.$or = [
        { firstName: { $regex: searchQuery, $options: 'i' } },
        { lastName: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('tenantId', 'name') // Populate tenant name
      .lean();

    return NextResponse.json({
      users,
      total: totalUsers,
      page,
      limit,
    });

  } catch (error) {
    return NextResponse.json({ message: 'An error occurred while fetching users' }, { status: 500 });
  }
}
