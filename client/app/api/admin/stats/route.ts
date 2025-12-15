import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { connectToDatabase, isDatabaseHealthy } from '@/lib/db';
import Tenant from '@/lib/models/Tenant';
import User from '@/lib/models/User';
import Invoice from '@/lib/models/Invoice';

export async function GET() {
  const session = await getServerSession();

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    if (!(await isDatabaseHealthy())) {
      throw new Error("Database is not healthy");
    }

    const totalTenants = await Tenant.countDocuments({});
    const totalUsers = await User.countDocuments({});
    
    const revenueResult = await Invoice.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: twentyFourHoursAgo } });

    const stats = {
      totalTenants,
      totalUsers,
      totalRevenue,
      newUsersToday,
    };

    return NextResponse.json(stats);

  } catch (error) {
    // Use a 503 Service Unavailable status code if there's a DB issue
    return NextResponse.json({ message: 'An error occurred while fetching stats' }, { status: 503 });
  }
}
