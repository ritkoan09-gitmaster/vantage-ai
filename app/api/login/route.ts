import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    await connectToDatabase();

    // Find user strictly by Username
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    // Match hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    // Return identity data to hydrate the Dashboard
    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        phone: user.phone,
        subscription: user.subscription
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("🔴 LOGIN API CRASHED:", error?.message || error);
    return NextResponse.json({ error: error?.message || 'Server error during authentication.' }, { status: 500 });
  }
}