import { NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/simple-auth';
import User from '@/lib/models/User';
import { connectToDatabase } from '@/lib/db';
import * as z from 'zod';

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(10),
});

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = profileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { firstName, lastName, phone } = validation.data;

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          firstName,
          lastName,
          phone,
          fullName: `${firstName} ${lastName}`,
        },
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update the session with the new user data
    await updateSession({ ...session, user: updatedUser.toObject() });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}